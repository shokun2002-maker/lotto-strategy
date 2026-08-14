import { GeneratorOptions } from "@/types/lotto";

/**
 * 1~45 사이의 중복 없는 로또 번호 6개를 오름차순으로 정렬하여 생성하는 추천 엔진 함수
 */
export function generateRandomNumbers(options: GeneratorOptions = {}): number[] {
  const count = options.count ?? 6;
  const fixed = options.fixedNumbers ?? [];
  const excluded = new Set(options.excludedNumbers ?? []);

  const result = new Set<number>();

  // 1. 고정수 등록 (범위 유효성 및 제외수 검증)
  for (const num of fixed) {
    if (num >= 1 && num <= 45 && !excluded.has(num)) {
      result.add(num);
    }
  }

  // 2. 남은 개수만큼 랜덤 추출
  while (result.size < count) {
    const randomNum = Math.floor(Math.random() * 45) + 1;
    if (!excluded.has(randomNum)) {
      result.add(randomNum);
    }
  }

  // 3. 오름차순 정렬 후 반환
  return Array.from(result).sort((a, b) => a - b);
}
