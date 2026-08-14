/**
 * 로또 번호 관련 타입 정의
 */

export interface GeneratorOptions {
  count?: number; // 기본값 6
  includeNumbers?: number[]; // 직접 고른 포함수/고정수 (1~6개)
  fixedNumbers?: number[]; // includeNumbers의 하위 호환
  excludeNumbers?: number[]; // 제외수 (0~5개)
  excludedNumbers?: number[]; // excludeNumbers의 하위 호환
  drawsContext?: LottoDraw[]; // 백테스트 시점 데이터 누수 차단용 과거 회차 context
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
  targetDrawNo?: number; // 대상 추첨 회차 (예: 1237)
  strategyId?: LottoStrategyId;
  customStrategyId?: string;
  customStrategyName?: string;
  userPickedNumbers: number[];
  recommendedNumbers: number[];
  fixedNumbers?: number[];
  excludedNumbers?: number[];
  createdAt: string; // ISO String
}

export interface SavedCustomStrategy {
  id: string;
  name: string;
  baseStrategy: LottoStrategyId;
  fixedNumbers: number[];
  excludedNumbers: number[];
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
  usageCount: number; // 생성 버튼 실행 횟수
}

export interface UserLottoProfile {
  totalSavedCombinations: number;
  totalSavedStrategies: number;
  totalStrategyUsageCount: number;

  selectionRatio: {
    hasData: boolean;
    userPickedCount: number;
    recommendedCount: number;
    userPickedPercentage: number;
    recommendedPercentage: number;
  };

  favoriteUserPickedNumbers: Array<{
    number: number;
    count: number;
  }>;

  strategyUsage: {
    hasData: boolean;
    totalUsage: number;
    items: Array<{
      strategyId: LottoStrategyId;
      label: string;
      count: number;
      percentage: number;
    }>;
  };

  rangeDistribution: {
    hasData: boolean;
    items: Array<{
      rangeKey: string;
      label: string;
      count: number;
      percentage: number;
    }>;
  };

  averageAnalysis: {
    hasData: boolean;
    odd: number;
    even: number;
    low: number;
    high: number;
    sum: number;
  };

  strategyHabits: {
    hasData: boolean;
    totalStrategies: number;
    withFixedNumbersCount: number;
    withExcludedNumbersCount: number;
    fixedPercentage: number;
    excludedPercentage: number;
  };
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
  value: number;
  label: string;
}

export interface CustomStrategyOptions {
  baseStrategy: LottoStrategyId;
  fixedNumbers: number[];
  excludedNumbers: number[];
  drawsContext?: LottoDraw[];
}

export interface StrategyGenerationResult {
  numbers: number[];
  strategyId: LottoStrategyId;
  analysis: LottoAnalysis;
  attempts: number;
  featuredNumbers: number[];
  metadata: {
    description: string;
    windowSize?: number;
    featuredStats?: StrategyFeaturedStat[];
    fixedNumbers?: number[];
    excludedNumbers?: number[];
    isRelaxed?: boolean;
    customStrategyId?: string;
    customStrategyName?: string;
  };
}

export type LottoRank = 1 | 2 | 3 | 4 | 5 | null;

export interface LottoMatchResult {
  matchedNumbers: number[];
  matchCount: number;
  bonusMatched: boolean;
  rank: LottoRank;
}

export interface BacktestRoundResult {
  drawNo: number;
  drawDate: string;
  generatedNumbers: number[];
  actualNumbers: number[];
  bonus: number;
  matchResult: LottoMatchResult;
  contextLatestDrawNo: number;
}

export interface BacktestSummary {
  strategyId: LottoStrategyId;
  strategyName: string;
  testedDraws: number;
  startDrawNo: number;
  endDrawNo: number;
  rankCounts: {
    first: number;
    second: number;
    third: number;
    fourth: number;
    fifth: number;
    noPrize: number;
  };
  averageMatchCount: number;
  rounds: BacktestRoundResult[];
}
