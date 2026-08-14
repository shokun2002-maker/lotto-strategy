import { generateRandomNumbers } from "../generator";
import { analyzeLottoNumbers } from "../analyzer";
import { getAllNumberStatistics } from "../statistics";
import { StrategyGenerationResult, StrategyFeaturedStat, LottoAnalysis } from "@/types/lotto";

/**
 * 배열 요소 무작위 셔플 (Fisher-Yates Shuffle) - tie 동률 편향 방지
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
 * 미출현 회차 수 기준 후보군 18개 산출 (동률 셔플 적용)
 */
export function getLongAbsencePool(poolSize = 18): Array<{ number: number; absentDraws: number }> {
  const stats = getAllNumberStatistics();

  // 미출현 회차 수별로 그룹화
  const groupedByAbsence = new Map<number, number[]>();
  for (const s of stats) {
    const absence = s.drawsSinceLastAppearance;
    if (!groupedByAbsence.has(absence)) {
      groupedByAbsence.set(absence, []);
    }
    groupedByAbsence.get(absence)!.push(s.number);
  }

  // 미출현 회차 수 내림차순 정렬
  const sortedAbsences = Array.from(groupedByAbsence.keys()).sort((a, b) => b - a);

  const poolResult: Array<{ number: number; absentDraws: number }> = [];

  for (const absence of sortedAbsences) {
    const numsInAbsence = groupedByAbsence.get(absence)!;
    // 동률 그룹 무작위 셔플
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
  featuredNumbers: number[]
): boolean {
  // 1. 후보군 포함 개수 최소 2개 이상
  if (featuredNumbers.length < 2) return false;

  // 2. 최소 2개 이상 구간 사용
  const activeBandsCount = Object.values(analysis.ranges).filter((c) => c > 0).length;
  if (activeBandsCount < 2) return false;

  // 3. 5개 이상 연속수열 금지
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
 * 장기미출현형 전략 번호 생성 엔진
 */
export function generateLongAbsenceNumbers(maxAttempts = 1000): StrategyGenerationResult {
  const statsMap = new Map(getAllNumberStatistics().map((s) => [s.number, s]));
  let fallbackResult: StrategyGenerationResult | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // 동률 셔플이 반영된 장기 미출현 후보군 18개
    const pool = getLongAbsencePool(18);
    const poolNumbers = pool.map((p) => p.number);

    // 후보군 중 무작위 2~4개 선택
    const pickCount = Math.floor(Math.random() * 3) + 2; // 2, 3, 4 중 하나
    const shuffledPool = shuffleArray(poolNumbers);
    const pickedFromPool = shuffledPool.slice(0, pickCount).sort((a, b) => a - b);

    // 나머지 번호는 전체 영역에서 중복 없이 생성
    const candidateNums = generateRandomNumbers({
      includeNumbers: pickedFromPool,
    });

    const analysis = analyzeLottoNumbers(candidateNums);

    // 실제로 최종 조합에 포함된 후보군 번호들
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
      },
    };

    if (checkLongAbsenceConditions(analysis, actualFeatured)) {
      return currentResult;
    }

    if (!fallbackResult) {
      fallbackResult = currentResult;
    }
  }

  return fallbackResult!;
}
