import fs from "fs";
import path from "path";
import { LottoDraw } from "../../src/types/lotto";
import { validateDrawData } from "../../src/lib/lotto/data-validator";
import { fetchDraw } from "./data-source";

export interface UpdatePipelineOptions {
  isDryRun?: boolean;
  isValidateOnly?: boolean;
  targetDrawArg?: number;
  dataFileAbsolutePath?: string;
}

export type PipelineStatus =
  | "updated"
  | "already_up_to_date"
  | "not_available_yet"
  | "validation_error"
  | "network_error";

export interface UpdatePipelineResult {
  status: PipelineStatus;
  exitCode: number; // 0 for success/up-to-date/not-yet, 1 for validation_error, 2 for network_error
  localLatestDrawNo: number;
  targetDrawNo: number;
  addedDrawsCount: number;
  addedDraws: LottoDraw[];
  totalDrawsCount: number;
  errors: string[];
  warnings: string[];
  message: string;
}

/**
 * 두 날짜 간의 일수 차이 산출
 */
export function getDaysDiff(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const diffMs = d2.getTime() - d1.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * 주간 로또 데이터 업데이트 핵심 파이프라인 (CLI 및 Cron/Serverless 공용)
 */
export async function runUpdatePipeline(
  options: UpdatePipelineOptions = {}
): Promise<UpdatePipelineResult> {
  const isDryRun = options.isDryRun ?? false;
  const isValidateOnly = options.isValidateOnly ?? false;
  const targetDrawArg = options.targetDrawArg;

  const dataFilePath =
    options.dataFileAbsolutePath ||
    path.join(process.cwd(), "src/data/lotto-draws.json");
  const tmpFilePath = path.join(
    path.dirname(dataFilePath),
    "lotto-draws.tmp.json"
  );

  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. 기존 데이터 파일 존재 확인
  if (!fs.existsSync(dataFilePath)) {
    errors.push(`데이터 파일이 존재하지 않습니다: ${dataFilePath}`);
    return {
      status: "validation_error",
      exitCode: 1,
      localLatestDrawNo: 0,
      targetDrawNo: 0,
      addedDrawsCount: 0,
      addedDraws: [],
      totalDrawsCount: 0,
      errors,
      warnings,
      message: "데이터 파일 미존재",
    };
  }

  // 2. 로컬 데이터 로드
  let localDraws: LottoDraw[] = [];
  try {
    const rawText = fs.readFileSync(dataFilePath, "utf8");
    localDraws = JSON.parse(rawText);
  } catch (err: unknown) {
    const parseErrMsg = err instanceof Error ? err.message : String(err);
    errors.push(`기존 데이터 JSON 파싱 실패: ${parseErrMsg}`);
    return {
      status: "validation_error",
      exitCode: 1,
      localLatestDrawNo: 0,
      targetDrawNo: 0,
      addedDrawsCount: 0,
      addedDraws: [],
      totalDrawsCount: 0,
      errors,
      warnings,
      message: "JSON 파싱 실패",
    };
  }

  // 3. 로컬 데이터 기본 무결성 검증
  const initialReport = validateDrawData(localDraws);
  if (!initialReport.isValid) {
    errors.push(...initialReport.errors);
    return {
      status: "validation_error",
      exitCode: 1,
      localLatestDrawNo: 0,
      targetDrawNo: 0,
      addedDrawsCount: 0,
      addedDraws: [],
      totalDrawsCount: localDraws.length,
      errors,
      warnings,
      message: "기존 로컬 데이터셋 무결성 오류",
    };
  }

  localDraws.sort((a, b) => a.drawNo - b.drawNo);
  const localLatest = localDraws[localDraws.length - 1];
  const localLatestDrawNo = localLatest.drawNo;

  // 3-1. 이미 로컬에 존재하는 회차를 요구한 경우 ("already_up_to_date" 사전 처리)
  if (targetDrawArg && targetDrawArg <= localLatestDrawNo) {
    return {
      status: "already_up_to_date",
      exitCode: 0,
      localLatestDrawNo,
      targetDrawNo: targetDrawArg,
      addedDrawsCount: 0,
      addedDraws: [],
      totalDrawsCount: localDraws.length,
      errors: [],
      warnings: [],
      message: `제${targetDrawArg}회 데이터는 이미 로컬에 보관되어 있습니다. (already_up_to_date)`,
    };
  }

  // --validate-only 검증 모드
  if (isValidateOnly) {
    const totalAppSum = localDraws.reduce(
      (sum, d) => sum + d.numbers.length,
      0
    );
    const expectedSum = localDraws.length * 6;

    if (totalAppSum !== expectedSum) {
      errors.push(`출현 횟수 총합 불일치: ${totalAppSum} !== ${expectedSum}`);
      return {
        status: "validation_error",
        exitCode: 1,
        localLatestDrawNo,
        targetDrawNo: localLatestDrawNo,
        addedDrawsCount: 0,
        addedDraws: [],
        totalDrawsCount: localDraws.length,
        errors,
        warnings,
        message: "검증 실패: 총합 불일치",
      };
    }

    return {
      status: "already_up_to_date",
      exitCode: 0,
      localLatestDrawNo,
      targetDrawNo: localLatestDrawNo,
      addedDrawsCount: 0,
      addedDraws: [],
      totalDrawsCount: localDraws.length,
      errors: [],
      warnings: [],
      message: "로컬 데이터 무결성 100% 검증 통과 (PASS)",
    };
  }

  // 4. 신규 회차 수집 탐색
  const updatedDraws = [...localDraws];
  const addedDraws: LottoDraw[] = [];
  let nextCheckDrawNo = targetDrawArg || localLatestDrawNo + 1;
  let isNetworkError = false;

  while (true) {
    const fetchRes = await fetchDraw(nextCheckDrawNo);

    if (fetchRes.status === "not_found") {
      break;
    }

    if (fetchRes.status === "error" || !fetchRes.draw) {
      isNetworkError = true;
      errors.push(`제${nextCheckDrawNo}회 데이터 수집 오류: ${fetchRes.message || "원격 수집 실패"}`);
      break;
    }

    const newDraw = fetchRes.draw;

    // 회차 번호 검증 (Strict Validation)
    if (newDraw.drawNo !== nextCheckDrawNo) {
      errors.push(`회차 불일치: 요청 ${nextCheckDrawNo}회 != 수집 ${newDraw.drawNo}회`);
      return {
        status: "validation_error",
        exitCode: 1,
        localLatestDrawNo,
        targetDrawNo: nextCheckDrawNo,
        addedDrawsCount: 0,
        addedDraws: [],
        totalDrawsCount: localDraws.length,
        errors,
        warnings,
        message: "수집 회차 번호 불일치",
      };
    }

    // 추첨일 간격 검증 (정확히 7일이 아니면 엄격 차단)
    const prevDraw = updatedDraws[updatedDraws.length - 1];
    const daysDiff = getDaysDiff(prevDraw.drawDate, newDraw.drawDate);
    if (daysDiff !== 7) {
      const intervalErrMsg = `제${newDraw.drawNo}회 추첨일 간격 검증 실패: 이전 회차(${prevDraw.drawDate}) 대비 신규 회차(${newDraw.drawDate}) 차이가 ${daysDiff}일입니다. (정확히 7일 필요)`;
      errors.push(intervalErrMsg);
      return {
        status: "validation_error",
        exitCode: 1,
        localLatestDrawNo,
        targetDrawNo: newDraw.drawNo,
        addedDrawsCount: 0,
        addedDraws: [],
        totalDrawsCount: localDraws.length,
        errors,
        warnings,
        message: "추첨일 간격 불일치 (7일 조건 미충족)",
      };
    }

    updatedDraws.push(newDraw);
    addedDraws.push(newDraw);

    if (targetDrawArg) break;
    nextCheckDrawNo++;
  }

  if (isNetworkError) {
    return {
      status: "network_error",
      exitCode: 2,
      localLatestDrawNo,
      targetDrawNo: localLatestDrawNo + 1,
      addedDrawsCount: 0,
      addedDraws: [],
      totalDrawsCount: localDraws.length,
      errors,
      warnings,
      message: "원격 데이터 수집 중 네트워크 오류 발생",
    };
  }

  // 신규 수집 결과가 없는 경우 ("not_available_yet")
  if (addedDraws.length === 0) {
    return {
      status: "not_available_yet",
      exitCode: 0,
      localLatestDrawNo,
      targetDrawNo: localLatestDrawNo + 1,
      addedDrawsCount: 0,
      addedDraws: [],
      totalDrawsCount: localDraws.length,
      errors: [],
      warnings,
      message: `제${localLatestDrawNo + 1}회 결과가 아직 원격 소스에 발표되지 않았거나 이용할 수 없습니다. (not_available_yet)`,
    };
  }

  // 5. 전체 데이터셋 무결성 재검증
  const finalReport = validateDrawData(updatedDraws);
  if (!finalReport.isValid) {
    errors.push(...finalReport.errors);
    return {
      status: "validation_error",
      exitCode: 1,
      localLatestDrawNo,
      targetDrawNo: updatedDraws[updatedDraws.length - 1].drawNo,
      addedDrawsCount: 0,
      addedDraws: [],
      totalDrawsCount: localDraws.length,
      errors,
      warnings,
      message: "신규 수집 후 전체 데이터셋 무결성 재검증 실패",
    };
  }

  // 수학적 무결성 검증 (totalDraws * 6 === sum)
  const totalAppSum = updatedDraws.reduce(
    (sum, d) => sum + d.numbers.length,
    0
  );
  const expectedSum = updatedDraws.length * 6;
  if (totalAppSum !== expectedSum) {
    errors.push(`신규 수집 후 본번호 출현 총합 불일치: ${totalAppSum} !== ${expectedSum}`);
    return {
      status: "validation_error",
      exitCode: 1,
      localLatestDrawNo,
      targetDrawNo: updatedDraws[updatedDraws.length - 1].drawNo,
      addedDrawsCount: 0,
      addedDraws: [],
      totalDrawsCount: localDraws.length,
      errors,
      warnings,
      message: "수학적 무결성 검증 실패",
    };
  }

  // Dry-Run 인 경우 파일 수정 없이 반환
  if (isDryRun) {
    return {
      status: "updated",
      exitCode: 0,
      localLatestDrawNo,
      targetDrawNo: updatedDraws[updatedDraws.length - 1].drawNo,
      addedDrawsCount: addedDraws.length,
      addedDraws,
      totalDrawsCount: updatedDraws.length,
      errors: [],
      warnings,
      message: `[DRY-RUN] 제${localLatestDrawNo}회 -> 제${updatedDraws[updatedDraws.length - 1].drawNo}회 (${addedDraws.length}개 회차 추가 가능, 파일 변경 없음)`,
    };
  }

  // 6. 원자적 파일 교체 (Atomic Replace)
  try {
    const jsonFormatted = JSON.stringify(updatedDraws, null, 2);
    fs.writeFileSync(tmpFilePath, jsonFormatted, "utf8");

    // 임시 작성 파일 재검토
    const tmpRaw = fs.readFileSync(tmpFilePath, "utf8");
    const tmpParsed: LottoDraw[] = JSON.parse(tmpRaw);
    const tmpReport = validateDrawData(tmpParsed);

    if (!tmpReport.isValid) {
      throw new Error("임시 파일 검증 실패");
    }

    // Atomic Rename
    fs.renameSync(tmpFilePath, dataFilePath);

    return {
      status: "updated",
      exitCode: 0,
      localLatestDrawNo,
      targetDrawNo: updatedDraws[updatedDraws.length - 1].drawNo,
      addedDrawsCount: addedDraws.length,
      addedDraws,
      totalDrawsCount: updatedDraws.length,
      errors: [],
      warnings,
      message: `SUCCESS: 제${localLatestDrawNo}회 -> 제${updatedDraws[updatedDraws.length - 1].drawNo}회 원자적 업데이트 완료`,
    };
  } catch (err: unknown) {
    if (fs.existsSync(tmpFilePath)) {
      fs.unlinkSync(tmpFilePath);
    }
    const writeErrMsg = err instanceof Error ? err.message : String(err);
    errors.push(`파일 원자적 교체 중 오류 발생: ${writeErrMsg}`);
    return {
      status: "validation_error",
      exitCode: 1,
      localLatestDrawNo,
      targetDrawNo: localLatestDrawNo,
      addedDrawsCount: 0,
      addedDraws: [],
      totalDrawsCount: localDraws.length,
      errors,
      warnings,
      message: "파일 저장을 실패했습니다.",
    };
  }
}
