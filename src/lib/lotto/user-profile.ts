import {
  SavedLottoCombination,
  SavedCustomStrategy,
  UserLottoProfile,
  LottoStrategyId,
} from "@/types/lotto";
import { analyzeLottoNumbers } from "./analyzer";

/**
 * 저장된 조합 및 저장된 전략 데이터를 바탕으로 유저의 로또 선택 성향/패턴을 분석하는 순수 함수
 */
export function analyzeUserProfile(
  combinations: SavedLottoCombination[] = [],
  strategies: SavedCustomStrategy[] = []
): UserLottoProfile {
  const safeCombinations = Array.isArray(combinations) ? combinations : [];
  const safeStrategies = Array.isArray(strategies) ? strategies : [];

  // 1. 기본 수량 통계
  const totalSavedCombinations = safeCombinations.length;
  const totalSavedStrategies = safeStrategies.length;
  const totalStrategyUsageCount = safeStrategies.reduce(
    (sum, s) => sum + (s.usageCount || 0),
    0
  );

  // 2. 직접 선택 vs 추천 비율 분석
  let userPickedCount = 0;
  let recommendedCount = 0;

  for (const comb of safeCombinations) {
    const userPicks = comb.userPickedNumbers || comb.fixedNumbers || [];
    const recommended = comb.recommendedNumbers || [];

    userPickedCount += userPicks.length;
    // 추천 번호 수 = 총 6개 - 직접 선택수
    recommendedCount += Math.max(0, 6 - userPicks.length);
  }

  const selectionTotal = userPickedCount + recommendedCount;
  const hasSelectionData = selectionTotal > 0 && userPickedCount > 0;

  const userPickedPercentage =
    hasSelectionData && selectionTotal > 0
      ? Math.round((userPickedCount / selectionTotal) * 100)
      : 0;
  const recommendedPercentage =
    hasSelectionData && selectionTotal > 0
      ? 100 - userPickedPercentage
      : 0;

  // 3. 자주 직접 고른 번호 (상위 5개)
  const userPickedNumCounts = new Map<number, number>();
  for (const comb of safeCombinations) {
    const userPicks = comb.userPickedNumbers || comb.fixedNumbers || [];
    for (const num of userPicks) {
      if (typeof num === "number" && num >= 1 && num <= 45) {
        userPickedNumCounts.set(num, (userPickedNumCounts.get(num) || 0) + 1);
      }
    }
  }

  const favoriteUserPickedNumbers = Array.from(userPickedNumCounts.entries())
    .map(([number, count]) => ({ number, count }))
    .sort((a, b) => b.count - a.count || a.number - b.number)
    .slice(0, 5);

  // 4. 자주 사용한 전략 분석
  const strategyCounts: Record<LottoStrategyId, number> = {
    balanced: 0,
    "recent-trend": 0,
    "long-absence": 0,
  };

  // 1순위: 저장된 전략의 usageCount 합산
  let usageSourceTotal = 0;
  for (const st of safeStrategies) {
    if (st.baseStrategy && strategyCounts[st.baseStrategy] !== undefined) {
      strategyCounts[st.baseStrategy] += st.usageCount || 0;
      usageSourceTotal += st.usageCount || 0;
    }
  }

  // 2순위: usageCount 데이터가 0이면 저장된 조합의 strategyId 분포 활용
  if (usageSourceTotal === 0) {
    for (const comb of safeCombinations) {
      if (comb.strategyId && strategyCounts[comb.strategyId] !== undefined) {
        strategyCounts[comb.strategyId]++;
        usageSourceTotal++;
      }
    }
  }

  const hasStrategyData = usageSourceTotal > 0;

  const strategyLabels: Record<LottoStrategyId, string> = {
    balanced: "균형형",
    "recent-trend": "최근흐름형",
    "long-absence": "장기미출현형",
  };

  const strategyUsageItems = (
    ["balanced", "recent-trend", "long-absence"] as LottoStrategyId[]
  ).map((id) => {
    const count = strategyCounts[id];
    const percentage =
      hasStrategyData && usageSourceTotal > 0
        ? Math.round((count / usageSourceTotal) * 100)
        : 0;
    return {
      strategyId: id,
      label: strategyLabels[id],
      count,
      percentage,
    };
  });

  // 5. 저장 번호의 번호대 분포 분석
  const rangeCounts = {
    band1: 0, // 1 ~ 10
    band2: 0, // 11 ~ 20
    band3: 0, // 21 ~ 30
    band4: 0, // 31 ~ 40
    band5: 0, // 41 ~ 45
  };

  let totalNumbersCount = 0;

  for (const comb of safeCombinations) {
    if (Array.isArray(comb.numbers)) {
      for (const num of comb.numbers) {
        totalNumbersCount++;
        if (num >= 1 && num <= 10) rangeCounts.band1++;
        else if (num >= 11 && num <= 20) rangeCounts.band2++;
        else if (num >= 21 && num <= 30) rangeCounts.band3++;
        else if (num >= 31 && num <= 40) rangeCounts.band4++;
        else if (num >= 41 && num <= 45) rangeCounts.band5++;
      }
    }
  }

  const hasRangeData = totalNumbersCount > 0;

  const rangeDisplayList = [
    { rangeKey: "band1", label: "01~10", count: rangeCounts.band1 },
    { rangeKey: "band2", label: "11~20", count: rangeCounts.band2 },
    { rangeKey: "band3", label: "21~30", count: rangeCounts.band3 },
    { rangeKey: "band4", label: "31~40", count: rangeCounts.band4 },
    { rangeKey: "band5", label: "41~45", count: rangeCounts.band5 },
  ];

  const rangeDistributionItems = rangeDisplayList.map((item) => ({
    ...item,
    percentage:
      hasRangeData && totalNumbersCount > 0
        ? Math.round((item.count / totalNumbersCount) * 100)
        : 0,
  }));

  // 6. 평균 조합 통계 분석 (홀짝 / 저고 / 합계)
  let sumOdd = 0;
  let sumEven = 0;
  let sumLow = 0;
  let sumHigh = 0;
  let sumTotal = 0;

  for (const comb of safeCombinations) {
    if (Array.isArray(comb.numbers) && comb.numbers.length === 6) {
      const analysis = analyzeLottoNumbers(comb.numbers);
      sumOdd += analysis.oddCount;
      sumEven += analysis.evenCount;
      sumLow += analysis.lowCount;
      sumHigh += analysis.highCount;
      sumTotal += analysis.sum;
    }
  }

  const hasAverageData = totalSavedCombinations > 0;

  const avgOdd = hasAverageData
    ? Number((sumOdd / totalSavedCombinations).toFixed(1))
    : 0;
  const avgEven = hasAverageData
    ? Number((sumEven / totalSavedCombinations).toFixed(1))
    : 0;
  const avgLow = hasAverageData
    ? Number((sumLow / totalSavedCombinations).toFixed(1))
    : 0;
  const avgHigh = hasAverageData
    ? Number((sumHigh / totalSavedCombinations).toFixed(1))
    : 0;
  const avgSum = hasAverageData
    ? Math.round(sumTotal / totalSavedCombinations)
    : 0;

  // 7. 커스텀 전략 설정 습관 분석
  let withFixedCount = 0;
  let withExcludedCount = 0;

  for (const st of safeStrategies) {
    if (Array.isArray(st.fixedNumbers) && st.fixedNumbers.length > 0) {
      withFixedCount++;
    }
    if (Array.isArray(st.excludedNumbers) && st.excludedNumbers.length > 0) {
      withExcludedCount++;
    }
  }

  const hasHabitsData = totalSavedStrategies > 0;

  const fixedPercentage =
    hasHabitsData && totalSavedStrategies > 0
      ? Math.round((withFixedCount / totalSavedStrategies) * 100)
      : 0;
  const excludedPercentage =
    hasHabitsData && totalSavedStrategies > 0
      ? Math.round((withExcludedCount / totalSavedStrategies) * 100)
      : 0;

  return {
    totalSavedCombinations,
    totalSavedStrategies,
    totalStrategyUsageCount,
    selectionRatio: {
      hasData: hasSelectionData,
      userPickedCount,
      recommendedCount,
      userPickedPercentage,
      recommendedPercentage,
    },
    favoriteUserPickedNumbers,
    strategyUsage: {
      hasData: hasStrategyData,
      totalUsage: usageSourceTotal,
      items: strategyUsageItems,
    },
    rangeDistribution: {
      hasData: hasRangeData,
      items: rangeDistributionItems,
    },
    averageAnalysis: {
      hasData: hasAverageData,
      odd: avgOdd,
      even: avgEven,
      low: avgLow,
      high: avgHigh,
      sum: avgSum,
    },
    strategyHabits: {
      hasData: hasHabitsData,
      totalStrategies: totalSavedStrategies,
      withFixedNumbersCount: withFixedCount,
      withExcludedNumbersCount: withExcludedCount,
      fixedPercentage,
      excludedPercentage,
    },
  };
}
