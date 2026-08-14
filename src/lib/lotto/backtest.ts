import {
  LottoStrategyId,
  BacktestSummary,
  BacktestRoundResult,
  LottoDraw,
} from "@/types/lotto";
import { getAllDraws } from "./draw-data";
import { matchLottoCombination } from "./matcher";
import { generateBalancedNumbers } from "./strategies/balanced";
import { generateRecentTrendNumbers } from "./strategies/recent-trend";
import { generateLongAbsenceNumbers } from "./strategies/long-absence";
import { getStrategyMeta } from "./strategies";

export interface BacktestOptions {
  count?: number; // 기본 100회
  startDrawNo?: number;
  endDrawNo?: number;
}

/**
 * 시점 데이터 누수(Look-ahead bias)를 철저히 방지한 과거 시뮬레이션 백테스트 엔진
 */
export function runStrategyBacktest(
  strategyId: LottoStrategyId,
  options: BacktestOptions = {}
): BacktestSummary {
  const allDraws = getAllDraws().sort((a, b) => a.drawNo - b.drawNo);
  const totalAvailable = allDraws.length;

  if (totalAvailable === 0) {
    const meta = getStrategyMeta(strategyId);
    return {
      strategyId,
      strategyName: meta ? meta.name : "기본전략",
      testedDraws: 0,
      startDrawNo: 0,
      endDrawNo: 0,
      rankCounts: { first: 0, second: 0, third: 0, fourth: 0, fifth: 0, noPrize: 0 },
      averageMatchCount: 0,
      rounds: [],
    };
  }

  const latestDrawNo = allDraws[totalAvailable - 1].drawNo;
  const count = options.count ?? 100;
  const endDrawNo = options.endDrawNo ?? latestDrawNo;

  // recent-trend 및 long-absence의 과거 30회 최소 필요조건을 위해 최소 시작 회차는 31회로 제한
  const calculatedStart = Math.max(31, endDrawNo - count + 1);
  const startDrawNo = options.startDrawNo ?? calculatedStart;

  // 테스트 대상 회차 추출
  const targetDraws = allDraws.filter(
    (d) => d.drawNo >= startDrawNo && d.drawNo <= endDrawNo
  );

  const rounds: BacktestRoundResult[] = [];
  const rankCounts = {
    first: 0,
    second: 0,
    third: 0,
    fourth: 0,
    fifth: 0,
    noPrize: 0,
  };

  let totalMatchSum = 0;

  for (const targetDraw of targetDraws) {
    const targetDrawNo = targetDraw.drawNo;

    // 시점 데이터 누수 차단: 오직 1회부터 targetDrawNo - 1회까지의 과거 데이터만 포함
    const pastDraws = allDraws.filter((d) => d.drawNo < targetDrawNo);
    const contextLatestDrawNo =
      pastDraws.length > 0 ? pastDraws[pastDraws.length - 1].drawNo : 0;

    // 시점 누수 방지 Assertion Check
    if (contextLatestDrawNo !== targetDrawNo - 1 && targetDrawNo > 1) {
      console.warn(
        `Look-ahead bias warning: Context latest (${contextLatestDrawNo}) !== Target - 1 (${targetDrawNo - 1})`
      );
    }

    // 선택된 전략으로 과거 시점 기반 번호 생성
    let genResult;
    const genOptions = { drawsContext: pastDraws };

    if (strategyId === "recent-trend") {
      genResult = generateRecentTrendNumbers(genOptions);
    } else if (strategyId === "long-absence") {
      genResult = generateLongAbsenceNumbers(genOptions);
    } else {
      genResult = generateBalancedNumbers(genOptions);
    }

    const generatedNumbers = genResult.numbers;

    // 실제 당첨 결과와 등수 대조
    const matchResult = matchLottoCombination(generatedNumbers, targetDraw);
    totalMatchSum += matchResult.matchCount;

    // 등수별 카운팅
    if (matchResult.rank === 1) rankCounts.first++;
    else if (matchResult.rank === 2) rankCounts.second++;
    else if (matchResult.rank === 3) rankCounts.third++;
    else if (matchResult.rank === 4) rankCounts.fourth++;
    else if (matchResult.rank === 5) rankCounts.fifth++;
    else rankCounts.noPrize++;

    rounds.push({
      drawNo: targetDraw.drawNo,
      drawDate: targetDraw.drawDate,
      generatedNumbers,
      actualNumbers: targetDraw.numbers,
      bonus: targetDraw.bonus,
      matchResult,
      contextLatestDrawNo,
    });
  }

  const testedDraws = rounds.length;
  const averageMatchCount =
    testedDraws > 0 ? Number((totalMatchSum / testedDraws).toFixed(2)) : 0;

  const strategyMeta = getStrategyMeta(strategyId);
  const strategyName = strategyMeta ? strategyMeta.name : "기본전략";

  return {
    strategyId,
    strategyName,
    testedDraws,
    startDrawNo: targetDraws.length > 0 ? targetDraws[0].drawNo : 0,
    endDrawNo: targetDraws.length > 0 ? targetDraws[targetDraws.length - 1].drawNo : 0,
    rankCounts,
    averageMatchCount,
    rounds,
  };
}
