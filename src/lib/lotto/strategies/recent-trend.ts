import { generateRandomNumbers } from "../generator";
import { analyzeLottoNumbers } from "../analyzer";
import { getAllNumberStatistics } from "../statistics";
import { StrategyGenerationResult, StrategyFeaturedStat, LottoAnalysis, GeneratorOptions, LottoDraw } from "@/types/lotto";

/**
 * 배열 요소 무작위 셔플 (Fisher-Yates Shuffle)
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * 최근 30회 출현 횟수 기준 후보군 18개 산출 (drawsContext 지원)
 */
export function getRecentTrendPool(
  excludedNumbers: number[] = [],
  poolSize = 18,
  drawsContext?: LottoDraw[]
): Array<{ number: number; count: number }> {
  const stats = getAllNumberStatistics(drawsContext);
  const excludedSet = new Set(excludedNumbers);

  const groupedByCount = new Map<number, number[]>();
  for (const s of stats) {
    if (excludedSet.has(s.number)) continue;

    const count = s.recent30;
    if (!groupedByCount.has(count)) {
      groupedByCount.set(count, []);
    }
    groupedByCount.get(count)!.push(s.number);
  }

  const sortedCounts = Array.from(groupedByCount.keys()).sort((a, b) => b - a);
  const poolResult: Array<{ number: number; count: number }> = [];

  for (const count of sortedCounts) {
    const numsInCount = groupedByCount.get(count)!;
    const shuffledNums = shuffleArray(numsInCount);

    for (const num of shuffledNums) {
      poolResult.push({ number: num, count });
      if (poolResult.length >= poolSize) {
        return poolResult;
      }
    }
  }

  return poolResult;
}

/**
 * 최근흐름형 필터 조건 검사
 */
function checkRecentTrendConditions(
  analysis: LottoAnalysis,
  featuredNumbers: number[],
  minFeaturedCount = 2
): boolean {
  if (featuredNumbers.length < minFeaturedCount) return false;

  const activeBandsCount = Object.values(analysis.ranges).filter((c) => c > 0).length;
  if (activeBandsCount < 2) return false;

  let maxSeq = 1;
  let currSeq = 1;
  for (let i = 1; i < analysis.numbers.length; i++) {
    if (analysis.numbers[i] === analysis.numbers[i - 1] + 1) {
      currSeq++;
      if (currSeq > maxSeq) maxSeq = currSeq;
    } else {
      currSeq = 1;
    }
  }
  if (maxSeq >= 5) return false;

  return true;
}

/**
 * 최근흐름형 전략 번호 생성 엔진 (drawsContext 지원)
 */
export function generateRecentTrendNumbers(
  options: GeneratorOptions = {},
  maxAttempts = 1000
): StrategyGenerationResult {
  const fixed = options.includeNumbers ?? options.fixedNumbers ?? [];
  const excluded = options.excludeNumbers ?? options.excludedNumbers ?? [];
  const drawsContext = options.drawsContext;

  const statsMap = new Map(getAllNumberStatistics(drawsContext).map((s) => [s.number, s]));
  let fallbackResult: StrategyGenerationResult | null = null;

  const remainingSpots = Math.max(0, 6 - fixed.length);
  const targetPickCount = Math.min(remainingSpots, Math.floor(Math.random() * 3) + 2);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const pool = getRecentTrendPool(excluded, 18, drawsContext);
    const poolNumbers = pool.map((p) => p.number);

    const availablePool = poolNumbers.filter((n) => !fixed.includes(n));
    const shuffledPool = shuffleArray(availablePool);
    const pickedFromPool = shuffledPool.slice(0, targetPickCount);

    const combinedIncludes = Array.from(new Set([...fixed, ...pickedFromPool]));

    const candidateNums = generateRandomNumbers({
      includeNumbers: combinedIncludes,
      excludeNumbers: excluded,
    });

    const analysis = analyzeLottoNumbers(candidateNums);

    const actualFeatured = candidateNums.filter((num) => poolNumbers.includes(num));

    const featuredStats: StrategyFeaturedStat[] = actualFeatured.map((num) => {
      const stat = statsMap.get(num);
      const appCount = stat ? stat.recent30 : 0;
      return {
        number: num,
        value: appCount,
        label: `최근 30회 ${appCount}회 출현`,
      };
    });

    const currentResult: StrategyGenerationResult = {
      numbers: candidateNums,
      strategyId: "recent-trend",
      analysis,
      attempts: attempt,
      featuredNumbers: actualFeatured,
      metadata: {
        description: `최근 30회 번호 출현 기록에서 상대적으로 자주 등장한 번호 ${actualFeatured.length}개를 포함해 구성했습니다.`,
        windowSize: 30,
        featuredStats,
        fixedNumbers: fixed,
        excludedNumbers: excluded,
        isRelaxed: false,
      },
    };

    const minFeaturedCount = fixed.length >= 4 ? 1 : 2;
    if (checkRecentTrendConditions(analysis, actualFeatured, minFeaturedCount)) {
      return currentResult;
    }

    if (!fallbackResult) {
      fallbackResult = currentResult;
    }
  }

  return fallbackResult!;
}
