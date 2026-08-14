import { generateRandomNumbers } from "../generator";
import { analyzeLottoNumbers } from "../analyzer";
import { LottoAnalysis } from "@/types/lotto";

export interface BalancedGenerationResult {
  numbers: number[];
  analysis: LottoAnalysis;
  attempts: number;
  isBalancedStrict: boolean;
}

/**
 * 연속번호 수열의 최대 연속 개수 계산 (예: [1,2,3,10,11] -> 3개 연속)
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
 * 균형형 번호 생성 엔진
 */
export function generateBalancedNumbers(maxAttempts = 1000): BalancedGenerationResult {
  let bestCandidate: { numbers: number[]; analysis: LottoAnalysis; score: number } | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const candidateNums = generateRandomNumbers();
    const analysis = analyzeLottoNumbers(candidateNums);
    const { isBalanced, score } = checkBalancedConditions(analysis);

    if (isBalanced) {
      return {
        numbers: candidateNums,
        analysis,
        attempts: attempt,
        isBalancedStrict: true,
      };
    }

    // 최고 점수 candidate 저장 (fallback 대비)
    if (!bestCandidate || score > bestCandidate.score) {
      bestCandidate = { numbers: candidateNums, analysis, score };
    }
  }

  // Fallback (1000회 내 미발견 시 최고 점수 조합 안전 반환)
  return {
    numbers: bestCandidate!.numbers,
    analysis: bestCandidate!.analysis,
    attempts: maxAttempts,
    isBalancedStrict: false,
  };
}
