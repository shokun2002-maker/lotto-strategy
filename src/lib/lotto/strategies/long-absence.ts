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
 * 미출현 회차 수 기준 후보군 18개 산출 (제외수 필터링 & 동률 셔플 적용)
 */
export function getLongAbsencePool(
  excludedNumbers: number[] = [],
  poolSize = 18
): Array<{ number: number; absentDraws: number }> {
  const stats = getAllNumberStatistics();
  const excludedSet = new Set(excludedNumbers);

  const groupedByAbsence = new Map<number, number[]>();
  for (const s of stats) {
    if (excludedSet.has(s.number)) continue; // 제외수 100% 후보군에서 제거

    const absence = s.drawsSinceLastAppearance;
    if (!groupedByAbsence.has(absence)) {
      groupedByAbsence.set(absence, []);
    }
    groupedByAbsence.get(absence)!.push(s.number);
  }

  const sortedAbsences = Array.from(groupedByAbsence.keys()).sort((a, b) => b - a);
  const poolResult: Array<{ number: number; absentDraws: number }> = [];

  for (const absence of sortedAbsences) {
    const numsInAbsence = groupedByAbsence.get(absence)!;
    const shuffledNums = shuffleArray(numsInAbsence);

    for (const num of shuffledNums) {
      poolResult.push({ number: num, absentDraws: absence });
      if (poolResult.length >= poolSize) {
        return poolResult;
      }
    }
  }

  return poolResult;
}

/**
 * 장기미출현형 필터 조건 검사
 */
function checkLongAbsenceConditions(
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
 * 장기미출현형 전략 번호 생성 엔진 (GeneratorOptions 지원 확장)
 */
export function generateLongAbsenceNumbers(
  options: GeneratorOptions = {},
  maxAttempts = 1000
): StrategyGenerationResult {
  const fixed = options.includeNumbers ?? options.fixedNumbers ?? [];
  const excluded = options.excludeNumbers ?? options.excludedNumbers ?? [];
  const statsMap = new Map(getAllNumberStatistics().map((s) => [s.number, s]));

  let fallbackResult: StrategyGenerationResult | null = null;

  const remainingSpots = Math.max(0, 6 - fixed.length);
  const targetPickCount = Math.min(remainingSpots, Math.floor(Math.random() * 3) + 2);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const pool = getLongAbsencePool(excluded, 18);
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
      const absentCount = stat ? stat.drawsSinceLastAppearance : 0;
      return {
        number: num,
        value: absentCount,
        label: `최근 ${absentCount}회 미출현`,
      };
    });

    const currentResult: StrategyGenerationResult = {
      numbers: candidateNums,
      strategyId: "long-absence",
      analysis,
      attempts: attempt,
      featuredNumbers: actualFeatured,
      metadata: {
        description: `현재 기준으로 상대적으로 오랜 기간 등장하지 않은 번호 ${actualFeatured.length}개를 포함해 구성했습니다.`,
        featuredStats,
        fixedNumbers: fixed,
        excludedNumbers: excluded,
        isRelaxed: false,
      },
    };

    const minFeaturedCount = fixed.length >= 4 ? 1 : 2;
    if (checkLongAbsenceConditions(analysis, actualFeatured, minFeaturedCount)) {
      return currentResult;
    }

    if (!fallbackResult) {
      fallbackResult = currentResult;
    }
  }

  return fallbackResult!;
}
