/**
 * 로또 번호 관련 타입 정의
 */

export interface GeneratorOptions {
  count?: number; // 기본값 6
  includeNumbers?: number[]; // 직접 고른 포함수 (1~6개)
  fixedNumbers?: number[]; // includeNumbers의 하위 호환
  excludeNumbers?: number[]; // 제외수 (추후 확장)
  excludedNumbers?: number[]; // excludeNumbers의 하위 호환
}

export interface LottoRangeDistribution {
  band1: number; // 1 ~ 10
  band2: number; // 11 ~ 20
  band3: number; // 21 ~ 30
  band4: number; // 31 ~ 40
  band5: number; // 41 ~ 45
}

export interface LottoAnalysis {
  numbers: number[];
  oddCount: number;
  evenCount: number;
  lowCount: number;  // 1 ~ 22
  highCount: number; // 23 ~ 45
  sum: number;
  consecutivePairs: [number, number][];
  ranges: LottoRangeDistribution;
}

export type LottoCombinationSource = "quick" | "together" | "strategy" | "manual";

export type LottoStrategyId = "balanced" | "recent-trend" | "long-absence";

export interface SavedLottoCombination {
  id: string;
  numbers: number[];
  source: LottoCombinationSource;
  strategyId?: LottoStrategyId;
  userPickedNumbers: number[];
  recommendedNumbers: number[];
  createdAt: string; // ISO String
}

export interface LottoStrategyMeta {
  id: LottoStrategyId;
  name: string;
  shortDescription: string;
  detailDescription: string;
  status: "active" | "preparing";
  badgeText?: string;
}

export interface LottoDraw {
  drawNo: number;
  drawDate: string; // "YYYY-MM-DD"
  numbers: number[]; // [n1, n2, n3, n4, n5, n6] (오름차순)
  bonus: number;
}

export interface NumberStatistics {
  number: number;
  totalAppearances: number;
  recent10: number;
  recent30: number;
  recent50: number;
  recent100: number;
  lastAppearanceDraw: number | null;
  drawsSinceLastAppearance: number;
}

export interface StrategyFeaturedStat {
  number: number;
  value: number; // 횟수 또는 미출현 회차 수
  label: string; // 예: "최근 30회 6회 출현", "최근 9회 미출현"
}

export interface StrategyGenerationResult {
  numbers: number[];
  strategyId: LottoStrategyId;
  analysis: LottoAnalysis;
  attempts: number;
  featuredNumbers: number[]; // 전략 특징 후보군에서 선택된 번호들
  metadata: {
    description: string;
    windowSize?: number;
    featuredStats?: StrategyFeaturedStat[];
  };
}
