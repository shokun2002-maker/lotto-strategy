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
