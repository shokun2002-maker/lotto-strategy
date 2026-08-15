/**
 * PG-Independent Billing & Subscription Types (Day 18 Foundation)
 */

export type PaymentProviderType = "toss" | "kakaopay" | "naverpay" | "manual" | "mock";

export type SubscriptionStatus = "pending" | "active" | "past_due" | "canceled" | "expired";

export type PaymentStatus = "pending" | "paid" | "failed" | "canceled" | "refunded";

export interface SubscriptionRecord {
  id: string;
  userId: string;
  provider: PaymentProviderType;
  providerCustomerId?: string | null;
  providerSubscriptionId?: string | null;
  plan: "free" | "pro";
  status: SubscriptionStatus;
  amount?: number | null;
  currency: string;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  subscriptionId?: string | null;
  provider: PaymentProviderType;
  providerPaymentId?: string | null;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paidAt?: string | null;
  failedAt?: string | null;
  failureCode?: string | null;
  createdAt: string;
}

export interface ActivateSubscriptionParams {
  userId: string;
  provider: PaymentProviderType;
  providerCustomerId?: string;
  providerSubscriptionId?: string;
  amount?: number;
  periodDays?: number;
}

export interface CancelSubscriptionParams {
  userId: string;
  subscriptionId: string;
  immediate?: boolean;
}

export interface VerifyPaymentParams {
  orderId: string;
  amount: number;
  providerPaymentId?: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  orderId: string;
  providerPaymentId?: string;
  amount: number;
  status: PaymentStatus;
  errorMessage?: string;
}
