import { LottoDraw, LottoMatchResult, LottoRank } from "@/types/lotto";

/**
 * 생성된 번호 조합(6개)과 실제 당첨 회차 데이터(본번호 6개 + 보너스)를 비교하여 정확한 등수를 산출하는 순수 함수
 */
export function matchLottoCombination(
  numbers: number[],
  draw: LottoDraw
): LottoMatchResult {
  const sortedNumbers = [...numbers].sort((a, b) => a - b);
  const actualNumbersSet = new Set(draw.numbers);

  // 본번호 일치 개수 및 일치 번호 리스트 추출
  const matchedNumbers = sortedNumbers.filter((n) => actualNumbersSet.has(n));
  const matchCount = matchedNumbers.length;

  // 보너스 번호 일치 여부
  const bonusMatched = sortedNumbers.includes(draw.bonus);

  // 등수 판정
  let rank: LottoRank = null;

  if (matchCount === 6) {
    rank = 1;
  } else if (matchCount === 5 && bonusMatched) {
    rank = 2;
  } else if (matchCount === 5 && !bonusMatched) {
    rank = 3;
  } else if (matchCount === 4) {
    rank = 4;
  } else if (matchCount === 3) {
    rank = 5;
  } else {
    rank = null;
  }

  return {
    matchedNumbers,
    matchCount,
    bonusMatched,
    rank,
  };
}
