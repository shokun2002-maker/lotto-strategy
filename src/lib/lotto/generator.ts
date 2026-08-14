import { GeneratorOptions } from "@/types/lotto";

/**
 * 1~45 사이의 로또 번호를 조합하여 생성하는 추천 엔진 함수
 * 직접 지정한 포함수(includeNumbers)를 유지하면서 남은 개수를 중복 없이 랜덤으로 채움
 */
export function generateRandomNumbers(options: GeneratorOptions = {}): number[] {
  const count = options.count ?? 6;
  const includeInput = options.includeNumbers ?? options.fixedNumbers ?? [];
  const excludeInput = options.excludeNumbers ?? options.excludedNumbers ?? [];

  // 제외수 정리 (범위 1~45)
  const excludedSet = new Set<number>();
  for (const num of excludeInput) {
    if (typeof num === "number" && num >= 1 && num <= 45) {
      excludedSet.add(num);
    }
  }

  // 포함수 방어적 정제 (범위 1~45, 제외수에 포함된 번호 제외, 중복 제거)
  const validIncludes: number[] = [];
  for (const num of includeInput) {
    if (
      typeof num === "number" &&
      num >= 1 &&
      num <= 45 &&
      !excludedSet.has(num) &&
      !validIncludes.includes(num)
    ) {
      validIncludes.push(num);
    }
  }

  // 만약 포함수가 원하는 개수(6개) 이상이라면 앞의 count개만 잘라 오름차순 반환
  if (validIncludes.length >= count) {
    return validIncludes.slice(0, count).sort((a, b) => a - b);
  }

  const resultSet = new Set<number>(validIncludes);

  // 남은 개수를 중복 없이 랜덤으로 채움
  let attempts = 0;
  const maxAttempts = 1000;

  while (resultSet.size < count && attempts < maxAttempts) {
    attempts++;
    const randomNum = Math.floor(Math.random() * 45) + 1;
    if (!excludedSet.has(randomNum)) {
      resultSet.add(randomNum);
    }
  }

  // 안전장치: 혹시라도 채우지 못한 경우 (제외수가 너무 많은 극단적 케이스)
  if (resultSet.size < count) {
    for (let i = 1; i <= 45; i++) {
      if (resultSet.size >= count) break;
      if (!excludedSet.has(i)) {
        resultSet.add(i);
      }
    }
  }

  return Array.from(resultSet).sort((a, b) => a - b);
}
