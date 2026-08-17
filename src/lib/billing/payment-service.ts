import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  GrantAccessPassParams,
  PaymentProduct,
  PaymentProviderType,
  EntitlementSource,
} from "./types";
import { isBillingApproved } from "./capabilities";
import { markPaymentPaid } from "./subscription-service";

function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Fallback seed catalog for payment products
// 참고: amount 금액(9900, 3900, 1900)은 개발 및 테스트 흐름 검증용 임시 fixture 가격이며 실제 판매가격은 미확정 상태입니다.
const SEED_PRODUCTS: Record<string, PaymentProduct> = {
  pro_monthly_sub: {
    id: "pro_monthly_sub",
    name: "PRO 월간 정기구독",
    productType: "subscription",
    plan: "pro",
    durationDays: 30,
    amount: 9900,
    currency: "KRW",
    active: false,
  },
  pro_7day_pass: {
    id: "pro_7day_pass",
    name: "PRO 7일 체험 패스",
    productType: "access_pass",
    plan: "pro",
    durationDays: 7,
    amount: 3900,
    currency: "KRW",
    active: false,
  },
  pro_30day_pass: {
    id: "pro_30day_pass",
    name: "PRO 30일 이용권",
    productType: "access_pass",
    plan: "pro",
    durationDays: 30,
    amount: 9900,
    currency: "KRW",
    active: false,
  },
  pro_single_pass: {
    id: "pro_single_pass",
    name: "PRO 1회 이용권",
    productType: "one_time",
    plan: "pro",
    durationDays: 1,
    amount: 1900,
    currency: "KRW",
    active: false,
  },
};

/**
 * DB 또는 정찰가 카탈로그에서 상품 조회 (서버 정찰가 보장)
 */
export async function getPaymentProduct(productId: string): Promise<PaymentProduct | null> {
  try {
    const supabase = createAdminSupabaseClient();
    if (!supabase) return SEED_PRODUCTS[productId] || null;
    const { data, error } = await supabase
      .from("payment_products")
      .select("*")
      .eq("id", productId)
      .maybeSingle();

    if (data && !error) {
      return {
        id: data.id,
        name: data.name,
        productType: data.product_type,
        plan: "pro",
        durationDays: data.duration_days,
        amount: data.amount,
        currency: data.currency,
        active: data.active,
      };
    }
  } catch {
    // Fallback to seed
  }

  return SEED_PRODUCTS[productId] || null;
}

/**
 * 결제 주문 생성 (서버 정찰가 기반 Order ID 및 금액 고정으로 변조 차단)
 */
export async function createPaymentOrder(params: {
  userId: string;
  productId: string;
  provider: PaymentProviderType;
}): Promise<{ success: boolean; orderId?: string; amount?: number; product?: PaymentProduct; error?: string }> {
  // 결제 승인 전 안전 차단
  if (!isBillingApproved() && params.provider !== "mock" && params.provider !== "manual") {
    return { success: false, error: "현재 결제 서비스가 준비 중입니다." };
  }

  const product = await getPaymentProduct(params.productId);
  if (!product) {
    return { success: false, error: "존재하지 않는 상품입니다." };
  }

  // PG 승인 미완료 상품 구매 거부
  if (!product.active && params.provider !== "mock" && params.provider !== "manual") {
    return { success: false, error: "현재 준비 중인 상품입니다." };
  }

  const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  return {
    success: true,
    orderId,
    amount: product.amount, // 클라이언트 제출 금액이 아닌 서버 정찰가 반환
    product,
  };
}

/**
 * Access Pass (기간제 이용권/단건) 발급 및 entitlement PRO 설정
 */
export async function grantAccessPass(
  params: GrantAccessPassParams
): Promise<{ success: boolean; startsAt?: string; endsAt?: string; error?: string }> {
  try {
    const supabase = createAdminSupabaseClient();
    if (!supabase) return { success: false, error: "Server configuration error" };
    const now = new Date();
    const durationDays = params.durationDays > 0 ? params.durationDays : 1;
    const endsDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const startsAt = now.toISOString();
    const endsAt = endsDate.toISOString();
    const source: EntitlementSource = params.source || "access_pass";

    const { error } = await supabase.from("user_entitlements").upsert(
      {
        user_id: params.userId,
        plan: "pro",
        status: "active",
        source,
        starts_at: startsAt,
        ends_at: endsAt,
        updated_at: startsAt,
      },
      { onConflict: "user_id" }
    );

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, startsAt, endsAt };
  } catch (err: unknown) {
    return { success: false, error: (err as Error)?.message || "Grant Access Pass error" };
  }
}

/**
 * 만료된 Access Pass 검후 처리 (활성 구독이 존재하면 PRO 유지, 없으면 FREE 복구)
 */
export async function revokeExpiredAccess(
  userId: string
): Promise<{ success: boolean; currentPlan: "free" | "pro"; error?: string }> {
  try {
    const supabase = createAdminSupabaseClient();
    if (!supabase) return { success: false, currentPlan: "free", error: "Server configuration error" };

    // 1. 활성화된 정기구독(subscriptions) 존재 여부 확인
    const { data: activeSub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    if (activeSub) {
      // 활성 구독이 존재하므로 PRO 유지
      return { success: true, currentPlan: "pro" };
    }

    // 2. 활성 구독이 없으므로 entitlement를 FREE로 복구
    const nowIso = new Date().toISOString();
    await supabase.from("user_entitlements").upsert(
      {
        user_id: userId,
        plan: "free",
        status: "active",
        source: "system",
        updated_at: nowIso,
      },
      { onConflict: "user_id" }
    );

    return { success: true, currentPlan: "free" };
  } catch (err: unknown) {
    return { success: false, currentPlan: "free", error: (err as Error)?.message || "Revoke access error" };
  }
}
