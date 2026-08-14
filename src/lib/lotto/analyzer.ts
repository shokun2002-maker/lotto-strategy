import { LottoAnalysis, LottoRangeDistribution } from "@/types/lotto";

/**
 * 6개 로또 번호 조합의 주요 특성(홀짝, 저고, 합계, 연속번호, 구간 분포)을 분석하는 순수 함수
 */
export function analyzeLottoNumbers(numbers: number[]): LottoAnalysis {
  // 번호가 오름차순 정렬되어 있는지 확인 및 정렬
  const sorted = [...numbers].sort((a, b) => a - b);

  let oddCount = 0;
  let evenCount = 0;
  let lowCount = 0;
  let highCount = 0;
  let sum = 0;

  const consecutivePairs: [number, number][] = [];
  const ranges: LottoRangeDistribution = {
    band1: 0, // 1~10
    band2: 0, // 11~20
    band3: 0, // 21~30
    band4: 0, // 31~40
    band5: 0, // 41~45
  };

  for (let i = 0; i < sorted.length; i++) {
    const num = sorted[i];

    // 1. 합계
    sum += num;

    // 2. 홀짝
    if (num % 2 !== 0) {
      oddCount++;
    } else {
      evenCount++;
    }

    // 3. 저고 (1~22: 저번호, 23~45: 고번호)
    if (num <= 22) {
      lowCount++;
    } else {
      highCount++;
    }

    // 4. 구간 분포
    if (num >= 1 && num <= 10) {
      ranges.band1++;
    } else if (num >= 11 && num <= 20) {
      ranges.band2++;
    } else if (num >= 21 && num <= 30) {
      ranges.band3++;
    } else if (num >= 31 && num <= 40) {
      ranges.band4++;
    } else if (num >= 41 && num <= 45) {
      ranges.band5++;
    }

    // 5. 연속번호 체크
    if (i > 0 && num === sorted[i - 1] + 1) {
      consecutivePairs.push([sorted[i - 1], num]);
    }
  }

  return {
    numbers: sorted,
    oddCount,
    evenCount,
    lowCount,
    highCount,
    sum,
    consecutivePairs,
    ranges,
  };
}
