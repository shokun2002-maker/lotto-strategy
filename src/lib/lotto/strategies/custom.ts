import { CustomStrategyOptions, StrategyGenerationResult } from "@/types/lotto";
import { generateBalancedNumbers } from "./balanced";
import { generateRecentTrendNumbers } from "./recent-trend";
import { generateLongAbsenceNumbers } from "./long-absence";
import { getStrategyMeta } from "./index";

/**
 * 나만의 커스텀 전략 번호 생성 엔진 (1게임)
 * 고정수(0~3개) + 제외수(0~5개) + 기본 전략(balanced | recent-trend | long-absence) 결합
 */
export function generateCustomNumbers(
  options: CustomStrategyOptions
): StrategyGenerationResult {
  const rawFixed = options.fixedNumbers ?? [];
  const rawExcluded = options.excludedNumbers ?? [];

  // 1. 고정수 정제 (1~45 범위, 중복 제거, 최대 3개)
  const cleanFixed: number[] = [];
  for (const n of rawFixed) {
    if (typeof n === "number" && n >= 1 && n <= 45 && !cleanFixed.includes(n)) {
      cleanFixed.push(n);
      if (cleanFixed.length >= 3) break;
    }
  }

  // 2. 제외수 정제 (1~45 범위, 고정수와 충돌하는 번호 자동 제거, 중복 제거, 최대 5개)
  const cleanExcluded: number[] = [];
  const fixedSet = new Set(cleanFixed);
  for (const n of rawExcluded) {
    if (
      typeof n === "number" &&
      n >= 1 &&
      n <= 45 &&
      !fixedSet.has(n) &&
      !cleanExcluded.includes(n)
    ) {
      cleanExcluded.push(n);
      if (cleanExcluded.length >= 5) break;
    }
  }

  // 3. 기본 전략 호출
  let result: StrategyGenerationResult;
  const genOptions = {
    includeNumbers: cleanFixed,
    excludeNumbers: cleanExcluded,
  };

  switch (options.baseStrategy) {
    case "recent-trend":
      result = generateRecentTrendNumbers(genOptions);
      break;
    case "long-absence":
      result = generateLongAbsenceNumbers(genOptions);
      break;
    case "balanced":
    default:
      result = generateBalancedNumbers(genOptions);
      break;
  }

  // 4. 고정수 100% 포함 & 제외수 100% 제거 사후 방어 검증 및 보정
  const finalNumbersSet = new Set(result.numbers);
  const excludedSet = new Set(cleanExcluded);

  for (const ex of cleanExcluded) {
    finalNumbersSet.delete(ex);
  }

  for (const fix of cleanFixed) {
    finalNumbersSet.add(fix);
  }

  if (finalNumbersSet.size < 6) {
    for (let i = 1; i <= 45; i++) {
      if (finalNumbersSet.size >= 6) break;
      if (!excludedSet.has(i)) {
        finalNumbersSet.add(i);
      }
    }
  }

  const sortedFinalNumbers = Array.from(finalNumbersSet).slice(0, 6).sort((a, b) => a - b);
  const baseMeta = getStrategyMeta(options.baseStrategy);
  const baseName = baseMeta ? baseMeta.name : "균형형";

  const featuredWithFixed = Array.from(new Set([...cleanFixed, ...result.featuredNumbers]));

  return {
    ...result,
    numbers: sortedFinalNumbers,
    featuredNumbers: featuredWithFixed,
    metadata: {
      ...result.metadata,
      fixedNumbers: cleanFixed,
      excludedNumbers: cleanExcluded,
      description: `사용자가 선택한 고정수 ${cleanFixed.length}개 · 제외수 ${cleanExcluded.length}개 조건을 우선 적용하고, 나머지를 ${baseName} 방식으로 구성했습니다.`,
    },
  };
}

/**
 * N게임 (1 / 3 / 5게임) 중복 없는 커스텀 번호 일괄 생성 함수
 */
export function generateMultipleCustomCombinations(
  options: CustomStrategyOptions,
  count: 1 | 3 | 5
): StrategyGenerationResult[] {
  const results: StrategyGenerationResult[] = [];
  const seenKeys = new Set<string>();
  const maxAttempts = 50;

  for (let i = 0; i < count; i++) {
    let currentRes: StrategyGenerationResult | null = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const candidate = generateCustomNumbers(options);
      const key = candidate.numbers.join(",");

      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        currentRes = candidate;
        break;
      }
      currentRes = candidate;
    }

    if (currentRes) {
      results.push(currentRes);
    }
  }

  return results;
}
