import { generateRandomNumbers } from "../generator";
import { analyzeLottoNumbers } from "../analyzer";
import { getAllNumberStatistics } from "../statistics";
import { StrategyGenerationResult, StrategyFeaturedStat, LottoAnalysis, GeneratorOptions } from "@/types/lotto";

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
 * 최근 30회 출현 횟수 기준 후보군 18개 산출 (제외수 필터링 & 동률 셔플 적용)
 */
export function getRecentTrendPool(
  excludedNumbers: number[] = [],
  poolSize = 18
): Array<{ number: number; count: number }> {
  const stats = getAllNumberStatistics();
  const excludedSet = new Set(excludedNumbers);

  const groupedByCount = new Map<number, number[]>();
  for (const s of stats) {
    if (excludedSet.has(s.number)) continue; // 제외수 100% 후보군에서 제거

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
 * 최근흐름형 전략 번호 생성 엔진 (GeneratorOptions 지원 확장)
 */
export function generateRecentTrendNumbers(
  options: GeneratorOptions = {},
  maxAttempts = 1000
): StrategyGenerationResult {
  const fixed = options.includeNumbers ?? options.fixedNumbers ?? [];
  const excluded = options.excludeNumbers ?? options.excludedNumbers ?? [];
  const statsMap = new Map(getAllNumberStatistics().map((s) => [s.number, s]));

  let fallbackResult: StrategyGenerationResult | null = null;

  // 고정수를 제외한 남은 자리 수
  const remainingSpots = Math.max(0, 6 - fixed.length);
  const targetPickCount = Math.min(remainingSpots, Math.floor(Math.random() * 3) + 2);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // 제외수가 무조건 배제된 후보군
    const pool = getRecentTrendPool(excluded, 18);
    const poolNumbers = pool.map((p) => p.number);

    // 고정수와 후보군의 중복 제거 후 무작위 추출
    const availablePool = poolNumbers.filter((n) => !fixed.includes(n));
    const shuffledPool = shuffleArray(availablePool);
    const pickedFromPool = shuffledPool.slice(0, targetPickCount);

    // 포함수 = 고정수 + 최근흐름 후보 추출수
    const combinedIncludes = Array.from(new Set([...fixed, ...pickedFromPool]));

    const candidateNums = generateRandomNumbers({
      includeNumbers: combinedIncludes,
      excludeNumbers: excluded,
    });

    const analysis = analyzeLottoNumbers(candidateNums);

    // 최종 조합에 포함된 최근 30회 후보군 번호들
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
