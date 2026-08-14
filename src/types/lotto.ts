/**
 * 로또 번호 관련 타입 정의
 */

export interface GeneratorOptions {
  count?: number; // 기본값 6
  fixedNumbers?: number[]; // 고정수 (추후 확장)
  excludedNumbers?: number[]; // 제외수 (추후 확장)
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
