import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  ActivateSubscriptionParams,
  CancelSubscriptionParams,
  SubscriptionRecord,
  PaymentRecord,
  PaymentProviderType,
} from "./types";

/**
 * Service Role / Server Key 기반 Admin Supabase 클라이언트 팩토리
 * (RLS 우회 및 서버 검증 완료 건에 대한 db mutation 수행)
 */
function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  // SUPABASE_SERVICE_ROLE_KEY가 없으면 fallback으로 anon key 사용 (서버 전용)
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "placeholder-key";

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Server-side Subscription Activation Service
 * 서버 검증 완료 후 구독 생성 및 user_entitlements를 PRO로 갱신
 */
export async function activateSubscription(
  params: ActivateSubscriptionParams
): Promise<{ success: boolean; subscription?: SubscriptionRecord; error?: string }> {
  try {
    const supabase = createAdminSupabaseClient();
    const now = new Date();
    const periodDays = params.periodDays || 30;
    const periodEnd = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000);

    const startIso = now.toISOString();
    const endIso = periodEnd.toISOString();

    // 1. subscriptions 테이블에 구독 활성화 레코드 삽입/갱신
    const { data: subData, error: subError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: params.userId,
        provider: params.provider,
        provider_customer_id: params.providerCustomerId || null,
        provider_subscription_id: params.providerSubscriptionId || null,
        plan: "pro",
        status: "active",
        amount: params.amount || 0,
        currency: "KRW",
        current_period_start: startIso,
        current_period_end: endIso,
        cancel_at_period_end: false,
      })
      .select("*")
      .single();

    if (subError || !subData) {
      console.error("Subscription insert failed:", subError?.message);
      return { success: false, error: subError?.message || "Failed to create subscription record" };
    }

    // 2. user_entitlements 테이블을 authoritative PRO 권한으로 갱신
    const { error: entError } = await supabase
      .from("user_entitlements")
      .upsert(
        {
          user_id: params.userId,
          plan: "pro",
          status: "active",
          source: params.provider,
          starts_at: startIso,
          ends_at: endIso,
          updated_at: startIso,
        },
        { onConflict: "user_id" }
      );

    if (entError) {
      console.error("User entitlement update failed:", entError.message);
      return { success: false, error: entError.message };
    }

    const subscription: SubscriptionRecord = {
      id: subData.id,
      userId: subData.user_id,
      provider: subData.provider as PaymentProviderType,
      providerCustomerId: subData.provider_customer_id,
      providerSubscriptionId: subData.provider_subscription_id,
      plan: "pro",
      status: "active",
      amount: subData.amount,
      currency: subData.currency,
      currentPeriodStart: subData.current_period_start,
      currentPeriodEnd: subData.current_period_end,
      cancelAtPeriodEnd: subData.cancel_at_period_end,
      createdAt: subData.created_at,
      updatedAt: subData.updated_at,
    };

    return { success: true, subscription };
  } catch (err: any) {
    return { success: false, error: err?.message || "Server activation error" };
  }
}

/**
 * Server-side Subscription Cancellation Service
 * 사용자 해지 요청 시 즉시 FREE로 내리지 않고 cancel_at_period_end = true 설정 (기간 만료 시까지 PRO 유지)
 */
export async function cancelSubscription(
  params: CancelSubscriptionParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminSupabaseClient();
    const nowIso = new Date().toISOString();

    if (params.immediate) {
      // 즉시 환불/해지인 경우
      await supabase
        .from("subscriptions")
        .update({
          status: "canceled",
          canceled_at: nowIso,
          updated_at: nowIso,
        })
        .eq("id", params.subscriptionId)
        .eq("user_id", params.userId);

      await supabase
        .from("user_entitlements")
        .upsert(
          {
            user_id: params.userId,
            plan: "free",
            status: "active",
            source: "system",
            updated_at: nowIso,
          },
          { onConflict: "user_id" }
        );
    } else {
      // 일반 해지: 기간 만료일까지 PRO 유지 (cancel_at_period_end = true)
      const { error } = await supabase
        .from("subscriptions")
        .update({
          cancel_at_period_end: true,
          canceled_at: nowIso,
          updated_at: nowIso,
        })
        .eq("id", params.subscriptionId)
        .eq("user_id", params.userId);

      if (error) {
        return { success: false, error: error.message };
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Cancellation error" };
  }
}

/**
 * Subscription Expiration Service
 * 만료 시점에 user_entitlements를 FREE로 전환
 */
export async function expireSubscription(
  userId: string,
  subscriptionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminSupabaseClient();
    const nowIso = new Date().toISOString();

    await supabase
      .from("subscriptions")
      .update({
        status: "expired",
        updated_at: nowIso,
      })
      .eq("id", subscriptionId);

    await supabase
      .from("user_entitlements")
      .upsert(
        {
          user_id: userId,
          plan: "free",
          status: "active",
          source: "system",
          updated_at: nowIso,
        },
        { onConflict: "user_id" }
      );

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Expiration error" };
  }
}

/**
 * Idempotency 검증을 포함한 Payment 결제 완료 기록 함수
 */
export async function markPaymentPaid(params: {
  userId: string;
  orderId: string;
  amount: number;
  provider: PaymentProviderType;
  subscriptionId?: string;
  providerPaymentId?: string;
}): Promise<{ success: boolean; isDuplicate?: boolean; payment?: PaymentRecord; error?: string }> {
  try {
    const supabase = createAdminSupabaseClient();

    // Idempotency 체크: 동일 order_id가 이미 존재하는지 확인
    const { data: existing } = await supabase
      .from("payments")
      .select("*")
      .eq("order_id", params.orderId)
      .maybeSingle();

    if (existing) {
      return {
        success: true,
        isDuplicate: true,
        payment: {
          id: existing.id,
          userId: existing.user_id,
          subscriptionId: existing.subscription_id,
          provider: existing.provider as PaymentProviderType,
          providerPaymentId: existing.provider_payment_id,
          orderId: existing.order_id,
          amount: existing.amount,
          currency: existing.currency,
          status: existing.status,
          paidAt: existing.paid_at,
          createdAt: existing.created_at,
        },
      };
    }

    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from("payments")
      .insert({
        user_id: params.userId,
        subscription_id: params.subscriptionId || null,
        provider: params.provider,
        provider_payment_id: params.providerPaymentId || null,
        order_id: params.orderId,
        amount: params.amount,
        currency: "KRW",
        status: "paid",
        paid_at: nowIso,
      })
      .select("*")
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || "Failed to record payment" };
    }

    return {
      success: true,
      isDuplicate: false,
      payment: {
        id: data.id,
        userId: data.user_id,
        subscriptionId: data.subscription_id,
        provider: data.provider as PaymentProviderType,
        providerPaymentId: data.provider_payment_id,
        orderId: data.order_id,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        paidAt: data.paid_at,
        createdAt: data.created_at,
      },
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "Payment record error" };
  }
}

/**
 * Payment 결제 실패 기록 함수 (past_due 처리)
 */
export async function markPaymentFailed(params: {
  userId: string;
  orderId: string;
  amount: number;
  provider: PaymentProviderType;
  subscriptionId?: string;
  failureCode?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminSupabaseClient();
    const nowIso = new Date().toISOString();

    await supabase.from("payments").insert({
      user_id: params.userId,
      subscription_id: params.subscriptionId || null,
      provider: params.provider,
      order_id: params.orderId,
      amount: params.amount,
      currency: "KRW",
      status: "failed",
      failed_at: nowIso,
      failure_code: params.failureCode || "PAYMENT_FAILED",
    });

    if (params.subscriptionId) {
      await supabase
        .from("subscriptions")
        .update({
          status: "past_due",
          updated_at: nowIso,
        })
        .eq("id", params.subscriptionId);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to log payment failure" };
  }
}
