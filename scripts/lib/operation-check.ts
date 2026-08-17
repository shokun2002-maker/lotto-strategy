import fs from "fs";
import path from "path";
import crypto from "crypto";
import { LottoDraw } from "../../src/types/lotto";
import { validateDrawData } from "../../src/lib/lotto/data-validator";
import { fetchDraw } from "./data-source";
import { getDaysDiff } from "./update-pipeline";
import { runRegressionTests } from "../regression-lotto-data";

export type OperationalStatus =
  | "WAITING"
  | "UPDATE_AVAILABLE"
  | "LOCAL_INVALID"
  | "REMOTE_INVALID"
  | "NETWORK_ERROR"
  | "UP_TO_DATE";

export interface OperationCheckResult {
  status: OperationalStatus;
  exitCode: number;
  localLatestDrawNo: number;
  latestDrawDate: string;
  nextExpectedDrawNo: number;
  expectedDrawDate: string;
  remoteStatusText: string;
  datasetValidationText: string;
  regressionStatusText: string;
  recommendedAction: string;
  errors: string[];
  warnings: string[];
  fetchedDraw: LottoDraw | null;
}

/**
 * Asia/Seoul (KST) 타임존 기준 YYYY-MM-DD 날짜 문자열 반환 함수
 */
export function getKSTDateString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [{ value: month }, , { value: day }, , { value: year }] =
    formatter.formatToParts(date);
  return `${year}-${month}-${day}`;
}

function calculateFileHash(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 * 주간 운영 상태를 절대 파일 변경 없이 검사하는 순수 읽기 전용 점검 함수
 */
export async function runOperationCheck(
  dataFileAbsolutePath?: string
): Promise<OperationCheckResult> {
  const dataFilePath =
    dataFileAbsolutePath ||
    path.join(process.cwd(), "src/data/lotto-draws.json");

  const errors: string[] = [];
  const warnings: string[] = [];

  // 파일 존재 여부 확인
  if (!fs.existsSync(dataFilePath)) {
    errors.push(`데이터 파일 미존재: ${dataFilePath}`);
    return {
      status: "LOCAL_INVALID",
      exitCode: 1,
      localLatestDrawNo: 0,
      latestDrawDate: "N/A",
      nextExpectedDrawNo: 0,
      expectedDrawDate: "N/A",
      remoteStatusText: "UNCHECKED",
      datasetValidationText: "FAIL (File Missing)",
      regressionStatusText: "SKIPPED",
      recommendedAction: "CHECK — src/data/lotto-draws.json 파일이 존재하지 않습니다.",
      errors,
      warnings,
      fetchedDraw: null,
    };
  }

  // 해시 스냅샷 기록 (읽기 전용 보장)
  const initialHash = calculateFileHash(dataFilePath);

  let localDraws: LottoDraw[] = [];
  try {
    const rawText = fs.readFileSync(dataFilePath, "utf8");
    localDraws = JSON.parse(rawText);
  } catch (err: unknown) {
    const parseErrMsg = err instanceof Error ? err.message : String(err);
    errors.push(`JSON 파싱 실패: ${parseErrMsg}`);
    return {
      status: "LOCAL_INVALID",
      exitCode: 1,
      localLatestDrawNo: 0,
      latestDrawDate: "N/A",
      nextExpectedDrawNo: 0,
      expectedDrawDate: "N/A",
      remoteStatusText: "UNCHECKED",
      datasetValidationText: "FAIL (JSON Parse Error)",
      regressionStatusText: "SKIPPED",
      recommendedAction: "CHECK — src/data/lotto-draws.json 파일 문법을 점검하고 복구하세요.",
      errors,
      warnings,
      fetchedDraw: null,
    };
  }

  // 로컬 데이터 무결성 검증
  const initialReport = validateDrawData(localDraws);
  if (!initialReport.isValid) {
    errors.push(...initialReport.errors);
    return {
      status: "LOCAL_INVALID",
      exitCode: 1,
      localLatestDrawNo: 0,
      latestDrawDate: "N/A",
      nextExpectedDrawNo: 0,
      expectedDrawDate: "N/A",
      remoteStatusText: "UNCHECKED",
      datasetValidationText: "FAIL (Integrity Violations)",
      regressionStatusText: "SKIPPED",
      recommendedAction: "CHECK — src/data/lotto-draws.json 파일 무결성을 점검하고 수동 복원(git checkout)을 검토하세요.",
      errors,
      warnings,
      fetchedDraw: null,
    };
  }

  localDraws.sort((a, b) => a.drawNo - b.drawNo);
  const localLatest = localDraws[localDraws.length - 1];
  const localLatestDrawNo = localLatest.drawNo;
  const latestDrawDate = localLatest.drawDate;

  // 다음 예상 회차 및 추첨일 계산 (7일 간격)
  const nextExpectedDrawNo = localLatestDrawNo + 1;
  const latestDateObj = new Date(latestDrawDate);
  latestDateObj.setDate(latestDateObj.getDate() + 7);
  const expectedYear = latestDateObj.getFullYear();
  const expectedMonth = String(latestDateObj.getMonth() + 1).padStart(2, "0");
  const expectedDay = String(latestDateObj.getDate()).padStart(2, "0");
  const expectedDrawDate = `${expectedYear}-${expectedMonth}-${expectedDay}`;

  // 1. Remote Fetch
  const fetchRes = await fetchDraw(nextExpectedDrawNo);

  let status: OperationalStatus = "WAITING";
  let exitCode = 0;
  let remoteStatusText = "NOT AVAILABLE YET";
  const datasetValidationText = "PASS";
  let regressionStatusText = "PASS";
  let recommendedAction = "";
  let fetchedDraw: LottoDraw | null = null;

  if (fetchRes.status === "error") {
    status = "NETWORK_ERROR";
    exitCode = 2;
    remoteStatusText = "NETWORK ERROR";
    regressionStatusText = "SKIPPED";
    recommendedAction = "RETRY — 원격 데이터 조회 중 네트워크 오류가 발생했습니다. 잠시 후 다시 시도하세요.";
    errors.push(fetchRes.message || "원격 데이터 수집 실패");
  } else if (fetchRes.status === "not_found" || !fetchRes.draw) {
    status = "WAITING";
    exitCode = 0;
    remoteStatusText = "NOT AVAILABLE YET";
    regressionStatusText = "PASS";
    recommendedAction = `WAIT — 제${nextExpectedDrawNo}회 공식 결과 발표 전입니다.`;
  } else {
    // 원격 데이터 수집 성공
    fetchedDraw = fetchRes.draw;
    remoteStatusText = `AVAILABLE (제${fetchedDraw.drawNo}회)`;

    // 2. Strict Validation (신규 데이터 및 전체 데이터셋 무결성 검증)
    let isStrictValid = true;

    // 2-A. 예상 drawNo 일치
    if (fetchedDraw.drawNo !== nextExpectedDrawNo) {
      isStrictValid = false;
      errors.push(`회차 불일치: 요청 ${nextExpectedDrawNo}회 != 수집 ${fetchedDraw.drawNo}회`);
    }

    // 2-B. 추첨일 유효성 및 7일 간격 검증
    if (!fetchedDraw.drawDate || isNaN(Date.parse(fetchedDraw.drawDate))) {
      isStrictValid = false;
      errors.push(`신규 회차 추첨일 형식 오류: ${fetchedDraw.drawDate}`);
    } else {
      const intervalDays = getDaysDiff(latestDrawDate, fetchedDraw.drawDate);
      if (intervalDays !== 7) {
        isStrictValid = false;
        errors.push(`추첨일 간격 불일치: 이전 ${latestDrawDate} 대비 신규 ${fetchedDraw.drawDate} (${intervalDays}일 차이, 정확히 7일 필요)`);
      }
    }

    // 2-C. 당첨번호 개수(6개), 정수, 1~45 범위, 중복 검증
    if (!Array.isArray(fetchedDraw.numbers) || fetchedDraw.numbers.length !== 6) {
      isStrictValid = false;
      errors.push(`본번호 개수 오류: 6개 필요 (실제 ${fetchedDraw.numbers?.length || 0}개)`);
    } else {
      const numSet = new Set<number>();
      for (const n of fetchedDraw.numbers) {
        if (!Number.isInteger(n) || n < 1 || n > 45) {
          isStrictValid = false;
          errors.push(`본번호 범위 오류: 1~45 정수 필요 (${n})`);
        }
        if (numSet.has(n)) {
          isStrictValid = false;
          errors.push(`본번호 중복 발견: ${n}`);
        }
        numSet.add(n);
      }
    }

    // 2-D. 보너스 번호 정수, 1~45 범위, 본번호와 중복 검증
    if (!Number.isInteger(fetchedDraw.bonus) || fetchedDraw.bonus < 1 || fetchedDraw.bonus > 45) {
      isStrictValid = false;
      errors.push(`보너스 번호 범위 오류: 1~45 정수 필요 (${fetchedDraw.bonus})`);
    } else if (fetchedDraw.numbers.includes(fetchedDraw.bonus)) {
      isStrictValid = false;
      errors.push(`보너스 번호가 본번호와 중복됨: ${fetchedDraw.bonus}`);
    }

    // 2-E. 신규 회차 포함 전체 데이터셋 결손/중복 무결성 재검증
    const combinedDraws = [...localDraws, fetchedDraw];
    const combinedReport = validateDrawData(combinedDraws);
    if (!combinedReport.isValid) {
      isStrictValid = false;
      errors.push(...combinedReport.errors);
    }

    if (!isStrictValid) {
      status = "REMOTE_INVALID";
      exitCode = 1;
      regressionStatusText = "SKIPPED (Remote Data Invalid)";
      recommendedAction = "WARN — 원격 소스의 신규 회차 데이터 검증에 실패했습니다. 공식 포털을 직접 확인하세요.";
    } else {
      // 3. KST Future-Date Guard (KST 기준 미래 날짜 차단)
      const todayKstStr = getKSTDateString();
      if (fetchedDraw.drawDate > todayKstStr) {
        status = "REMOTE_INVALID";
        exitCode = 1;
        regressionStatusText = "SKIPPED (Future Draw Date)";
        errors.push(`미래 날짜 방어: 원격 추첨일(${fetchedDraw.drawDate})이 KST 현재 날짜(${todayKstStr}) 기준 미래 날짜입니다.`);
        recommendedAction = "WARN — 원격 데이터의 추첨일이 현재 KST 날짜보다 미래입니다.";
      } else {
        // 4. Regression Testing
        const regResult = runRegressionTests(localDraws, fetchedDraw);
        if (!regResult.passed) {
          status = "REMOTE_INVALID";
          exitCode = 1;
          regressionStatusText = `FAIL (${regResult.passedCount}/${regResult.total} PASS)`;
          errors.push("신규 원격 회차 주입 후 회귀 테스트 검증 실패");
          recommendedAction = "WARN — 원격 회차 주입 후 앱 회귀 테스트 검증에 실패했습니다.";
        } else {
          // 5. UPDATE_AVAILABLE
          status = "UPDATE_AVAILABLE";
          exitCode = 0;
          regressionStatusText = "PASS";
          recommendedAction = [
            "1. npm run lotto:update:dry",
            "2. 신규 회차 번호/날짜/당첨번호 확인",
            "3. npm run lotto:update",
            "4. npm run lotto:regression",
            "5. npm run build",
            "6. git diff 확인",
            "7. 사람 승인 후 commit/push",
          ].join("\n");
        }
      }
    }
  }

  // 최종 해시 비교 (100% 읽기 전용 검증)
  const finalHash = calculateFileHash(dataFilePath);
  if (initialHash !== finalHash) {
    throw new Error("CRITICAL SAFETY VIOLATION: src/data/lotto-draws.json was modified during lotto:check!");
  }

  return {
    status,
    exitCode,
    localLatestDrawNo,
    latestDrawDate,
    nextExpectedDrawNo,
    expectedDrawDate,
    remoteStatusText,
    datasetValidationText,
    regressionStatusText,
    recommendedAction,
    errors,
    warnings,
    fetchedDraw,
  };
}
