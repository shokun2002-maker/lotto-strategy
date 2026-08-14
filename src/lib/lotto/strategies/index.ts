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
    shortDescription: "최근 30회 출현 기록을 참고해 번호를 구성합니다.",
    detailDescription:
      "최근 30회 동안 상대적으로 출현 빈도가 높은 번호군 중 일부를 선택하고 나머지는 균형 있게 배치합니다.",
    status: "active",
  },
  {
    id: "long-absence",
    name: "장기미출현형",
    shortDescription: "최근 미출현 기간을 참고해 번호를 구성합니다.",
    detailDescription:
      "현재 기준 오랫동안 출현하지 않은 번호군 중 일부를 선택하고 나머지는 균형 있게 배치합니다.",
    status: "active",
  },
];

export function getStrategyMeta(id: LottoStrategyId): LottoStrategyMeta | undefined {
  return LOTTO_STRATEGIES.find((s) => s.id === id);
}
