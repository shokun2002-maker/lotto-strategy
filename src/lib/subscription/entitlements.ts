import { createClient } from "@/lib/supabase/client";
import { UserEntitlement, UserPlan, EntitlementStatus } from "@/types/subscription";

export const DEFAULT_FREE_ENTITLEMENT: UserEntitlement = {
  userId: "",
  plan: "free",
  status: "active",
  source: "system",
  isPro: false,
};

/**
 * Supabase DB에서 현재 사용자의 Entitlement(요금제 권한)를 조회
 * 비로그인(Guest), row 없음, 또는 fetch 실패 시 안전하게 FREE로 fallback
 */
export async function getUserEntitlement(): Promise<UserEntitlement> {
  if (typeof window === "undefined") return DEFAULT_FREE_ENTITLEMENT;

  try {
    const supabase = createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return DEFAULT_FREE_ENTITLEMENT;
    }

    const userId = userData.user.id;

    const { data, error } = await supabase
      .from("user_entitlements")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      return {
        ...DEFAULT_FREE_ENTITLEMENT,
        userId,
      };
    }

    const plan: UserPlan = data.plan === "pro" ? "pro" : "free";
    const status: EntitlementStatus = (data.status as EntitlementStatus) || "active";
    const isPro = plan === "pro" && (status === "active" || status === "trialing");

    return {
      userId,
      plan,
      status,
      source: data.source || "system",
      startsAt: data.starts_at,
      endsAt: data.ends_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isPro,
    };
  } catch {
    return DEFAULT_FREE_ENTITLEMENT;
  }
}

/**
 * 현재 사용자의 요금제 플랜 단독 조회
 */
export async function getCurrentPlan(): Promise<UserPlan> {
  const entitlement = await getUserEntitlement();
  return entitlement.plan;
}

/**
 * 현재 사용자의 PRO 권한 활성 여부 단독 조회
 */
export async function isProUser(): Promise<boolean> {
  const entitlement = await getUserEntitlement();
  return entitlement.isPro;
}
