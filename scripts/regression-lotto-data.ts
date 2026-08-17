import fs from "fs";
import path from "path";
import { LottoDraw, SavedLottoCombination } from "../src/types/lotto";
import { validateDrawData } from "../src/lib/lotto/data-validator";
import { getLatestDraw, getDrawByNumber } from "../src/lib/lotto/draw-data";
import { getNextDrawInfo, addDaysToDate } from "../src/lib/lotto/draw-schedule";
import { getSavedCombinationResult } from "../src/lib/lotto/saved-result";
import { matchLottoCombination } from "../src/lib/lotto/matcher";
import {
  getAllNumberStatistics,
  getLongestAbsentNumbers,
} from "../src/lib/lotto/statistics";

export interface RegressionTestItemResult {
  name: string;
  passed: boolean;
  message?: string;
}

export interface RegressionSuiteResult {
  passed: boolean;
  total: number;
  passedCount: number;
  failedCount: number;
  results: RegressionTestItemResult[];
}

/**
 * 기본 로컬 데이터셋에 가상(또는 원격) 신규 회차 N을 결합하여
 * 업데이트 전후 8개 핵심 기능에 대한 회귀 검증을 수행하는 순수 검증 함수
 */
export function runRegressionTests(
  baseDraws?: LottoDraw[],
  fixtureDrawInput?: LottoDraw
): RegressionSuiteResult {
  const draws =
    baseDraws ||
    JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), "src/data/lotto-draws.json"),
        "utf8"
      )
    );

  const sortedBase = [...draws].sort((a, b) => a.drawNo - b.drawNo);
  const latestBase = sortedBase[sortedBase.length - 1];
  const targetDrawNo = latestBase ? latestBase.drawNo + 1 : 1;
  const targetDrawDate = latestBase
    ? addDaysToDate(latestBase.drawDate, 7)
    : "2026-08-22";

  // 신규 회차 N fixture 생성 (입력 파라미터 미제공 시 디폴트 테스트용 피스처 생성)
  const fixtureDraw: LottoDraw = fixtureDrawInput || {
    drawNo: targetDrawNo,
    drawDate: targetDrawDate,
    numbers: [3, 12, 23, 31, 38, 44],
    bonus: 7,
  };

  const extendedDraws: LottoDraw[] = [...sortedBase, fixtureDraw];

  const results: RegressionTestItemResult[] = [];

  // A. Latest draw transition
  const latestExt = getLatestDraw(extendedDraws);
  const passA = latestExt !== null && latestExt.drawNo === fixtureDraw.drawNo;
  results.push({
    name: "Latest draw transition",
    passed: passA,
    message: passA
      ? undefined
      : `Expected latest draw to be ${fixtureDraw.drawNo}, got ${latestExt?.drawNo}`,
  });

  // B. Next draw transition
  const nextInfo = getNextDrawInfo(undefined, extendedDraws);
  const passB = nextInfo.drawNo === fixtureDraw.drawNo + 1;
  results.push({
    name: "Next draw transition",
    passed: passB,
    message: passB
      ? undefined
      : `Expected next drawNo to be ${fixtureDraw.drawNo + 1}, got ${nextInfo.drawNo}`,
  });

  // C. Next draw date transition
  const expectedNextDate = addDaysToDate(fixtureDraw.drawDate, 7);
  const passC = nextInfo.drawDate === expectedNextDate;
  results.push({
    name: "Next draw date transition",
    passed: passC,
    message: passC
      ? undefined
      : `Expected next draw date to be ${expectedNextDate}, got ${nextInfo.drawDate}`,
  });

  // D. Draw lookup (getDrawByNumber)
  const foundDraw = getDrawByNumber(fixtureDraw.drawNo, extendedDraws);
  const passD =
    foundDraw !== undefined &&
    foundDraw.drawNo === fixtureDraw.drawNo &&
    foundDraw.numbers.join(",") === fixtureDraw.numbers.join(",");
  results.push({
    name: "Draw lookup",
    passed: passD,
    message: passD ? undefined : `Failed to look up draw ${fixtureDraw.drawNo}`,
  });

  // E. Saved result transition (waiting -> completed)
  const sampleSaved: SavedLottoCombination = {
    id: "regression-test-comb-1",
    numbers: fixtureDraw.numbers,
    source: "manual",
    targetDrawNo: fixtureDraw.drawNo,
    userPickedNumbers: [],
    recommendedNumbers: fixtureDraw.numbers,
    createdAt: new Date().toISOString(),
  };

  const statusBefore = getSavedCombinationResult(sampleSaved, sortedBase);
  const statusAfter = getSavedCombinationResult(sampleSaved, extendedDraws);
  const passE =
    statusBefore.status === "waiting" && statusAfter.status === "completed";
  results.push({
    name: "Saved result transition",
    passed: passE,
    message: passE
      ? undefined
      : `Expected waiting -> completed transition. Before: ${statusBefore.status}, After: ${statusAfter.status}`,
  });

  // F. Actual match calculation (1st rank & 2nd rank test)
  const match1st = matchLottoCombination(fixtureDraw.numbers, fixtureDraw);
  const match2nd = matchLottoCombination(
    [
      fixtureDraw.numbers[0],
      fixtureDraw.numbers[1],
      fixtureDraw.numbers[2],
      fixtureDraw.numbers[3],
      fixtureDraw.numbers[4],
      fixtureDraw.bonus,
    ],
    fixtureDraw
  );
  const passF =
    match1st.rank === 1 &&
    match1st.matchCount === 6 &&
    !match1st.bonusMatched &&
    match2nd.rank === 2 &&
    match2nd.matchCount === 5 &&
    match2nd.bonusMatched;
  results.push({
    name: "Match calculation",
    passed: passF,
    message: passF
      ? undefined
      : `Match calculation mismatch (1st rank: ${match1st.rank}, 2nd rank: ${match2nd.rank})`,
  });

  // G. Recent trend statistics
  const extStats = getAllNumberStatistics(extendedDraws);
  const passG = fixtureDraw.numbers.every((num) => {
    const stat = extStats.find((s) => s.number === num);
    return (
      stat !== undefined &&
      stat.lastAppearanceDraw === fixtureDraw.drawNo &&
      stat.drawsSinceLastAppearance === 0
    );
  });
  results.push({
    name: "Recent trend statistics",
    passed: passG,
    message: passG
      ? undefined
      : "Recent trend statistics did not reflect latest fixture draw numbers",
  });

  // H. Long absence statistics
  const longAbsence = getLongestAbsentNumbers(6, extendedDraws);
  const passH =
    longAbsence.length === 6 &&
    longAbsence.every(
      (stat) => !fixtureDraw.numbers.includes(stat.number)
    );
  results.push({
    name: "Long absence statistics",
    passed: passH,
    message: passH
      ? undefined
      : "Long absence numbers contained numbers that appeared in the latest draw",
  });

  // I. Dataset count
  const passI = extendedDraws.length === sortedBase.length + 1;
  results.push({
    name: "Dataset count",
    passed: passI,
    message: passI
      ? undefined
      : `Expected dataset length ${sortedBase.length + 1}, got ${extendedDraws.length}`,
  });

  const passedCount = results.filter((r) => r.passed).length;
  const total = results.length;
  const failedCount = total - passedCount;

  return {
    passed: failedCount === 0,
    total,
    passedCount,
    failedCount,
    results,
  };
}

async function main() {
  console.log("==========================================");
  console.log("    LOTTO DATA REGRESSION TEST SUITE     ");
  console.log("==========================================");

  // 로컬 파일 무결성 1차 확인
  const dataPath = path.join(process.cwd(), "src/data/lotto-draws.json");
  const rawData = fs.readFileSync(dataPath, "utf8");
  const draws: LottoDraw[] = JSON.parse(rawData);
  const initialReport = validateDrawData(draws);

  if (!initialReport.isValid) {
    console.error("❌ BASE DATASET INTEGRITY ERROR:");
    for (const err of initialReport.errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  const suiteResult = runRegressionTests(draws);

  for (const item of suiteResult.results) {
    const statusText = item.passed ? "PASS" : "FAIL";
    const paddedName = item.name.padEnd(28, " ");
    console.log(`${paddedName} ${statusText}`);
    if (!item.passed && item.message) {
      console.error(`  -> Reason: ${item.message}`);
    }
  }

  console.log("==========================================");
  console.log(
    `Regression Result: ${suiteResult.passedCount}/${suiteResult.total} PASS`
  );
  console.log("==========================================");

  process.exit(suiteResult.passed ? 0 : 1);
}

if (require.main === module) {
  main();
}
