import { IPaymentProviderAdapter } from "./provider";
import {
  PaymentProviderType,
  VerifyPaymentParams,
  PaymentVerificationResult,
} from "./types";

/**
 * 개발/테스트용 Server-side Mock Payment Provider Adapter
 * IMPORTANT: Production 환경(NODE_ENV === 'production')에서는 비활성화됨
 */
export class MockPaymentProviderAdapter implements IPaymentProviderAdapter {
  readonly providerType: PaymentProviderType = "mock";

  async verifyPayment(params: VerifyPaymentParams): Promise<PaymentVerificationResult> {
    if (process.env.NODE_ENV === "production") {
      return {
        success: false,
        orderId: params.orderId,
        amount: params.amount,
        status: "failed",
        errorMessage: "Mock provider is disabled in production environment.",
      };
    }

    return {
      success: true,
      orderId: params.orderId,
      providerPaymentId: params.providerPaymentId || `mock_pay_${Date.now()}`,
      amount: params.amount,
      status: "paid",
    };
  }

  async issueSubscription(_userId: string, _billingKey: string) {
    if (process.env.NODE_ENV === "production") {
      return { success: false, errorMessage: "Mock provider is disabled in production." };
    }
    return {
      success: true,
      providerSubscriptionId: `mock_sub_${Date.now()}`,
    };
  }

  async cancelSubscriptionAtPG(_providerSubscriptionId: string) {
    if (process.env.NODE_ENV === "production") {
      return { success: false, errorMessage: "Mock provider is disabled in production." };
    }
    return { success: true };
  }
}
