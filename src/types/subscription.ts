/**
 * Entitlement & Subscription Type Definitions (Day 17)
 */

export type UserPlan = "free" | "pro";

export type EntitlementStatus = "active" | "trialing" | "past_due" | "canceled" | "expired";

export interface UserEntitlement {
  userId: string;
  plan: UserPlan;
  status: EntitlementStatus;
  source: string;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  isPro: boolean;
}

export type FeatureKey =
  | "quick_pick"
  | "together_pick"
  | "basic_strategy"
  | "custom_strategy"
  | "saved_strategy"
  | "multi_game"
  | "advanced_profile"
  | "backtest"
  | "cloud_sync";

export interface PlanLimits {
  maxSavedStrategies: number; // FREE: 1, PRO: 20
  maxMultiGameCount: number; // FREE: 1, PRO: 5
  allowAdvancedBacktest: boolean;
  allowAdvancedProfile: boolean;
}
