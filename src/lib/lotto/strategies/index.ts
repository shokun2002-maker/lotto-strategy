import { LottoStrategyMeta, LottoStrategyId } from "@/types/lotto";

export const LOTTO_STRATEGIES: LottoStrategyMeta[] = [
  {
    id: "balanced",
    name: "균형형",
    shortDescription: "번호의 기본적인 구성 균형을 맞춰 조합합니다.",
    detailDescription:
      "홀짝, 저고, 합계와 번호 분포 조건을 이용해 특정 영역에 지나치게 몰리지 않는 조합을 만듭니다.",
    status: "active",
  },
  {
    id: "recent-trend",
    name: "최근흐름형",
    shortDescription: "최근 회차의 번호 출현 데이터를 활용하는 전략",
    detailDescription:
      "최근 회차의 데이터 출현 동향을 파악하여 구성 조건을 조율하는 전략입니다.",
    status: "preparing",
    badgeText: "준비 중",
  },
  {
    id: "long-absence",
    name: "장기미출현형",
    shortDescription: "일정 기간 등장하지 않은 번호 데이터를 활용하는 전략",
    detailDescription:
      "오랫동안 출현하지 않은 번호의 흐름을 반영하여 구성 조건을 조율하는 전략입니다.",
    status: "preparing",
    badgeText: "준비 중",
  },
];

export function getStrategyMeta(id: LottoStrategyId): LottoStrategyMeta | undefined {
  return LOTTO_STRATEGIES.find((s) => s.id === id);
}
