import { UserPlan, PlanLimits } from "@/types/subscription";

/**
 * Feature Entitlement Matrix Definition
 * FREE / PRO 요금제별 기능 제한 사양
 */
export const PLAN_LIMITS: Record<UserPlan, PlanLimits> = {
  free: {
    maxSavedStrategies: 1,
    maxMultiGameCount: 1,
    allowAdvancedBacktest: false,
    allowAdvancedProfile: false,
  },
  pro: {
    maxSavedStrategies: 20,
    maxMultiGameCount: 5,
    allowAdvancedBacktest: true,
    allowAdvancedProfile: true,
  },
};

/**
 * 요금제 등급별 제한 사양 조회
 */
export function getPlanLimits(plan: UserPlan): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}
