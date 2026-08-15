import {
  PaymentProviderType,
  VerifyPaymentParams,
  PaymentVerificationResult,
} from "./types";

/**
 * PG 독립적 Payment Provider Adapter 인터페이스
 * 미래 Toss Payments, KakaoPay, NaverPay 등 연동 시 일관된 서버 인터페이스 제공
 */
export interface IPaymentProviderAdapter {
  readonly providerType: PaymentProviderType;

  /**
   * 결제 승인 건에 대한 Server-to-Server 검증 수행
   */
  verifyPayment(params: VerifyPaymentParams): Promise<PaymentVerificationResult>;

  /**
   * 빌링키/정기결제 구독 등록 검증
   */
  issueSubscription?(userId: string, billingKey: string): Promise<{ success: boolean; providerSubscriptionId?: string; errorMessage?: string }>;

  /**
   * PG사 측 정기결제 수단 해지
   */
  cancelSubscriptionAtPG?(providerSubscriptionId: string): Promise<{ success: boolean; errorMessage?: string }>;
}
