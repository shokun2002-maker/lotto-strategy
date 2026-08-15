import { PaymentProviderType, PaymentMethod, BillingAvailability } from "./types";

export interface ProviderCapability {
  provider: PaymentProviderType;
  name: string;
  supportedMethods: PaymentMethod[];
  supportsSubscription: boolean;
  supportsOneTime: boolean;
  approved: boolean; // PG 심사 및 계약 완료 여부
}

/**
 * PG Provider별 기능 스펙 매트릭스 (Technical capabilities vs Business approval 분리)
 */
export const PROVIDER_CAPABILITIES: Record<PaymentProviderType, ProviderCapability> = {
  toss: {
    provider: "toss",
    name: "토스페이먼츠",
    supportedMethods: [
      "card",
      "transfer",
      "virtual_account",
      "mobile_phone",
      "easy_pay",
      "billing_card",
      "billing_account",
    ],
    supportsSubscription: true,
    supportsOneTime: true,
    approved: false,
  },
  kakaopay: {
    provider: "kakaopay",
    name: "카카오페이",
    supportedMethods: ["easy_pay", "billing_card"],
    supportsSubscription: true,
    supportsOneTime: true,
    approved: false,
  },
  naverpay: {
    provider: "naverpay",
    name: "네이버페이",
    supportedMethods: ["easy_pay", "billing_card"],
    supportsSubscription: true,
    supportsOneTime: true,
    approved: false,
  },
  manual: {
    provider: "manual",
    name: "시스템 수동 발급",
    supportedMethods: ["card"],
    supportsSubscription: true,
    supportsOneTime: true,
    approved: true,
  },
  mock: {
    provider: "mock",
    name: "개발 테스트용 MOCK",
    supportedMethods: ["card", "easy_pay"],
    supportsSubscription: true,
    supportsOneTime: true,
    approved: false,
  },
};

/**
 * 결제 서비스 전체 가용성 상태 (기본값: 'under_review', PG 승인 완료 시 'approved'로 변경)
 */
export const BILLING_AVAILABILITY: BillingAvailability = "under_review";

/**
 * 결제 서비스가 현재 승인되어 실결제 창을 호출할 수 있는지 체크
 */
export function isBillingApproved(): boolean {
  return BILLING_AVAILABILITY === "approved";
}
