import { createClient } from "@/lib/supabase/server";
import { cancelSubscription } from "@/lib/billing/subscription-service";
import { NextResponse } from "next/server";

/**
 * GET /api/billing/subscription
 * 로그인 유저의 현재 구독 상세 상태 조회 API
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = userData.user.id;

    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("GET /api/billing/subscription DB error:", error.message);
      return NextResponse.json({ error: "구독 정보를 조회하는 중 오류가 발생했습니다." }, { status: 500 });
    }

    return NextResponse.json({
      subscription: subscription || null,
    });
  } catch (err: unknown) {
    console.error("GET /api/billing/subscription exception:", err);
    return NextResponse.json({ error: "구독 정보를 조회하는 중 오류가 발생했습니다." }, { status: 500 });
  }
}

/**
 * POST /api/billing/subscription
 * 구독 해지 요청 API (서버에서 cancel_at_period_end = true 예약 처리)
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { action, subscriptionId } = body;

    if (action === "cancel" && subscriptionId) {
      const res = await cancelSubscription({
        userId: userData.user.id,
        subscriptionId,
        immediate: false,
      });

      if (!res.success) {
        return NextResponse.json({ error: res.error || "구독 해지 요청 처리 중 오류가 발생했습니다." }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: "구독 해지가 예약되었습니다. 만료 일시까지 PRO 혜택이 유지됩니다.",
      });
    }

    return NextResponse.json({ error: "유효하지 않은 요청입니다." }, { status: 400 });
  } catch (err: unknown) {
    console.error("POST /api/billing/subscription exception:", err);
    return NextResponse.json({ error: "구독 해지 요청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
