import fs from "fs";
import path from "path";
import { LottoDraw } from "../src/types/lotto";
import { validateDrawData } from "../src/lib/lotto/data-validator";
import { fetchDraw, normalizeDraw } from "./lib/data-source";

const DATA_FILE_PATH = path.join(process.cwd(), "src/data/lotto-draws.json");
const TMP_FILE_PATH = path.join(process.cwd(), "src/data/lotto-draws.tmp.json");

interface CommandArgs {
  isDryRun: boolean;
  isValidateOnly: boolean;
  targetDrawArg?: number;
}

function parseArgs(): CommandArgs {
  const args = process.argv.slice(2);
  let isDryRun = false;
  let isValidateOnly = false;
  let targetDrawArg: number | undefined = undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--dry-run") {
      isDryRun = true;
    } else if (args[i] === "--validate-only") {
      isValidateOnly = true;
    } else if (args[i] === "--draw" && args[i + 1]) {
      targetDrawArg = Number(args[i + 1]);
      i++;
    }
  }

  return { isDryRun, isValidateOnly, targetDrawArg };
}

/**
 * 날짜 일수 차이 계산 유틸리티
 */
function getDaysDiff(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const diffMs = d2.getTime() - d1.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

async function main() {
  const { isDryRun, isValidateOnly, targetDrawArg } = parseArgs();

  console.log("==========================================");
  console.log("   LOTTO DRAW DATA UPDATE PIPELINE      ");
  console.log("==========================================");

  // 1. 기존 로컬 데이터 로드
  if (!fs.existsSync(DATA_FILE_PATH)) {
    console.error(`[ERROR] 데이터 파일이 존재하지 않습니다: ${DATA_FILE_PATH}`);
    process.exit(1);
  }

  let localDraws: LottoDraw[] = [];
  try {
    const rawText = fs.readFileSync(DATA_FILE_PATH, "utf8");
    localDraws = JSON.parse(rawText);
  } catch (err) {
    console.error(`[ERROR] 데이터 파일 파싱 실패:`, err);
    process.exit(1);
  }

  // 로컬 무결성 검증
  const initialReport = validateDrawData(localDraws);
  if (!initialReport.isValid) {
    console.error(`[ERROR] 기존 데이터 파일 무결성 오류:`, initialReport.errors);
    process.exit(1);
  }

  // 회차 번호 오름차순 정렬
  localDraws.sort((a, b) => a.drawNo - b.drawNo);
  const localLatest = localDraws[localDraws.length - 1];

  console.log(`- 로컬 저장 회차 수 : ${localDraws.length}개`);
  console.log(`- 로컬 최신 회차    : 제${localLatest.drawNo}회 (${localLatest.drawDate})`);
  if (isDryRun) console.log(`- 모드               : DRY-RUN (파일 수정 없음)`);

  // --validate-only 모드 처리
  if (isValidateOnly) {
    console.log("\n=== 로컬 데이터 무결성 검증 완료 ===");
    console.log(`최초 회차: 제${initialReport.firstDrawNo}회`);
    console.log(`최신 회차: 제${initialReport.latestDrawNo}회 (${initialReport.latestDrawDate})`);
    console.log(`총 회차 수: ${initialReport.totalDraws}`);

    const totalAppSum = localDraws.reduce(
      (sum, d) => sum + d.numbers.length,
      0
    );
    const expectedSum = localDraws.length * 6;
    console.log(`본번호 총 출현 합계: ${totalAppSum} (기대값: ${expectedSum})`);

    if (totalAppSum !== expectedSum) {
      console.error(`[ERROR] 출현 횟수 합계 불일치!`);
      process.exit(1);
    }

    console.log("Validation: PASS (100% 정상)");
    process.exit(0);
  }

  // 2. 신규 회차 수집 탐색 루프
  const updatedDraws = [...localDraws];
  let nextCheckDrawNo = targetDrawArg || localLatest.drawNo + 1;
  let fetchedCount = 0;

  console.log(`\n- 신규 회차 수집 시작 : 제${nextCheckDrawNo}회부터...`);

  while (true) {
    console.log(`  Checking 제${nextCheckDrawNo}회...`);
    const fetchRes = await fetchDraw(nextCheckDrawNo);

    if (fetchRes.status === "not_found") {
      console.log(`  -> 제${nextCheckDrawNo}회: 결과 미발표/미존재`);
      break;
    }

    if (fetchRes.status === "error" || !fetchRes.draw) {
      console.error(`[ERROR] 제${nextCheckDrawNo}회 수집 실패: ${fetchRes.message}`);
      console.error(`안전 수칙에 따라 업데이트를 중단하며, 기존 데이터 파일은 100% 보존됩니다.`);
      process.exit(1);
    }

    const newDraw = fetchRes.draw;

    // 회차 연속성 및 추첨일 간격 검증
    const prevDraw = updatedDraws[updatedDraws.length - 1];
    const daysDiff = getDaysDiff(prevDraw.drawDate, newDraw.drawDate);
    if (daysDiff < 6 || daysDiff > 8) {
      console.warn(
        `[WARNING] 제${newDraw.drawNo}회 추첨일 간격 경고: 이전 회차(${prevDraw.drawDate}) 대비 ${daysDiff}일 간격`
      );
    }

    updatedDraws.push(newDraw);
    fetchedCount++;
    console.log(
      `  ✓ 제${newDraw.drawNo}회 (${newDraw.drawDate}) 당첨번호: ${newDraw.numbers.join(", ")} + 보너스 ${newDraw.bonus} 수집 완`
    );

    // 단일 회차 지정 파라미터가 있었다면 탐색 종료
    if (targetDrawArg) break;

    nextCheckDrawNo++;
  }

  // 신규 수집 건수 체크
  if (fetchedCount === 0) {
    console.log("\n==========================================");
    console.log("No new completed draw available.");
    console.log("Local data is already up to date.");
    console.log("==========================================");
    process.exit(0);
  }

  // 3. 전체 데이터셋 무결성 재검증
  console.log(`\n=== 신규 데이터셋 (${updatedDraws.length}개 회차) 전체 무결성 검증 ===`);
  const finalReport = validateDrawData(updatedDraws);

  if (!finalReport.isValid) {
    console.error(`[ERROR] 신규 데이터셋 무결성 검증 실패:`, finalReport.errors);
    console.error(`기존 데이터 파일은 100% 보존됩니다.`);
    process.exit(1);
  }

  // 수학적 무결성 검증 (totalDraws * 6 === sum)
  const totalAppSum = updatedDraws.reduce(
    (sum, d) => sum + d.numbers.length,
    0
  );
  const expectedSum = updatedDraws.length * 6;
  if (totalAppSum !== expectedSum) {
    console.error(`[ERROR] 본번호 출현 합계 불일치: ${totalAppSum} !== ${expectedSum}`);
    process.exit(1);
  }

  console.log(`- 검증 완료 : 회차 1~${finalReport.latestDrawNo} 무결성 PASS (총 출현 합계: ${totalAppSum})`);

  // 4. Dry-run 인 경우 종료
  if (isDryRun) {
    console.log("\n==========================================");
    console.log(`Current: ${localLatest.drawNo}`);
    console.log(`Found: ${fetchedCount} new draw(s)`);
    console.log(`Validation: PASS`);
    console.log(`Dry run: no file changed.`);
    console.log("==========================================");
    process.exit(0);
  }

  // 5. Temporary Write & Atomic Replace
  try {
    console.log(`\n- 임시 파일 생성 중: ${TMP_FILE_PATH}`);
    const jsonFormatted = JSON.stringify(updatedDraws, null, 2);
    fs.writeFileSync(TMP_FILE_PATH, jsonFormatted, "utf8");

    // 작성된 임시 파일 재검증
    const tmpRaw = fs.readFileSync(TMP_FILE_PATH, "utf8");
    const tmpParsed: LottoDraw[] = JSON.parse(tmpRaw);
    const tmpReport = validateDrawData(tmpParsed);
    if (!tmpReport.isValid) {
      throw new Error("임시 파일 재검증 실패");
    }

    // Atomic Replace
    console.log(`- 원자적 파일 교체 진행: lotto-draws.json`);
    fs.renameSync(TMP_FILE_PATH, DATA_FILE_PATH);

    console.log("\n==========================================");
    console.log(`SUCCESSFULLY UPDATED`);
    console.log(`제${localLatest.drawNo}회 → 제${finalReport.latestDrawNo}회`);
    console.log(`총 ${updatedDraws.length}개 회차 연동 완료`);
    console.log("==========================================");
  } catch (err) {
    console.error(`[ERROR] 파일 원자적 저장 도중 오류 발생:`, err);
    if (fs.existsSync(TMP_FILE_PATH)) {
      fs.unlinkSync(TMP_FILE_PATH);
    }
    process.exit(1);
  }
}

main();
