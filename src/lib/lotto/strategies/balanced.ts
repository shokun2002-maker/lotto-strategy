import { generateRandomNumbers } from "../generator";
import { analyzeLottoNumbers } from "../analyzer";
import { LottoAnalysis, StrategyGenerationResult, GeneratorOptions } from "@/types/lotto";

/**
 * 연속번호 수열의 최대 연속 개수 계산
 */
function getMaxConsecutiveSequence(sortedNumbers: number[]): number {
  if (sortedNumbers.length === 0) return 0;
  let maxSeq = 1;
  let currentSeq = 1;

  for (let i = 1; i < sortedNumbers.length; i++) {
    if (sortedNumbers[i] === sortedNumbers[i - 1] + 1) {
      currentSeq++;
      if (currentSeq > maxSeq) {
        maxSeq = currentSeq;
      }
    } else {
      currentSeq = 1;
    }
  }
  return maxSeq;
}

/**
 * 균형형 (balanced) 조건 충족 여부 검사
 */
export function checkBalancedConditions(analysis: LottoAnalysis): {
  isBalanced: boolean;
  score: number;
} {
  let score = 0;

  // 1. 홀짝 조건 (홀수 2~4개)
  const isOddEvenBalanced = analysis.oddCount >= 2 && analysis.oddCount <= 4;
  if (isOddEvenBalanced) score++;

  // 2. 저고 조건 (저번호 2~4개 & 고번호 2~4개)
  const isLowHighBalanced =
    analysis.lowCount >= 2 &&
    analysis.lowCount <= 4 &&
    analysis.highCount >= 2 &&
    analysis.highCount <= 4;
  if (isLowHighBalanced) score++;

  // 3. 합계 조건 (100 ~ 180)
  const isSumBalanced = analysis.sum >= 100 && analysis.sum <= 180;
  if (isSumBalanced) score++;

  // 4. 구간 분포 조건 (5개 구간 중 최소 3개 이상 분산)
  const activeBandsCount = Object.values(analysis.ranges).filter((count) => count > 0).length;
  const isRangeBalanced = activeBandsCount >= 3;
  if (isRangeBalanced) score++;

  // 5. 연속번호 조건 (4개 이상 연속수열 금지)
  const maxConsecutive = getMaxConsecutiveSequence(analysis.numbers);
  const isConsecutiveBalanced = maxConsecutive < 4;
  if (isConsecutiveBalanced) score++;

  // 모든 5개 조건 충족 시
  const isBalanced =
    isOddEvenBalanced &&
    isLowHighBalanced &&
    isSumBalanced &&
    isRangeBalanced &&
    isConsecutiveBalanced;

  return { isBalanced, score };
}

/**
 * 균형형 번호 생성 엔진 (GeneratorOptions 지원 확장)
 */
export function generateBalancedNumbers(
  options: GeneratorOptions = {},
  maxAttempts = 1000
): StrategyGenerationResult {
  const fixed = options.includeNumbers ?? options.fixedNumbers ?? [];
  const excluded = options.excludeNumbers ?? options.excludedNumbers ?? [];

  let bestCandidate: { numbers: number[]; analysis: LottoAnalysis; score: number } | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const candidateNums = generateRandomNumbers(options);
    const analysis = analyzeLottoNumbers(candidateNums);
    const { isBalanced, score } = checkBalancedConditions(analysis);

    const currentResult: StrategyGenerationResult = {
      numbers: candidateNums,
      strategyId: "balanced",
      analysis,
      attempts: attempt,
      featuredNumbers: fixed,
      metadata: {
        description: "균형형은 홀짝과 저고가 한쪽으로 크게 치우치지 않고, 여러 번호 구간에 분산되도록 조합합니다.",
        fixedNumbers: fixed,
        excludedNumbers: excluded,
        isRelaxed: false,
      },
    };

    if (isBalanced) {
      return currentResult;
    }

    if (!bestCandidate || score > bestCandidate.score) {
      bestCandidate = { numbers: candidateNums, analysis, score };
    }
  }

  return {
    numbers: bestCandidate!.numbers,
    strategyId: "balanced",
    analysis: bestCandidate!.analysis,
    attempts: maxAttempts,
    featuredNumbers: fixed,
    metadata: {
      description: "선택한 조건(고정수/제외수)을 우선해 균형형 방식으로 조합했습니다.",
      fixedNumbers: fixed,
      excludedNumbers: excluded,
      isRelaxed: true,
    },
  };
}
