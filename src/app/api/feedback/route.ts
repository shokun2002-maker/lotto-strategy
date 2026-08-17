import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createSupabaseAdmin(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

const ALLOWED_CATEGORIES = new Set(["general", "bug", "ux", "feature"]);

/**
 * POST /api/feedback
 * 인앱 베타 피드백 제출 API (Guest 및 로그인 회원 공통 지원)
 */
export async function POST(request: Request) {
  try {
    // 1. Origin 검증 (Production 및 로컬 개발 환경만 허용)
    const origin = request.headers.get("origin");
    if (origin) {
      const allowedOrigins = new Set([
        process.env.NEXT_PUBLIC_APP_URL,
        process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null,
        "https://lotto-strategy.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
      ].filter(Boolean) as string[]);

      if (!allowedOrigins.has(origin)) {
        return NextResponse.json(
          { error: "허용되지 않은 요청 출처입니다." },
          { status: 403 }
        );
      }
    }

    // 2. 로그인 세션 확인 (Request body의 userId는 절대 신뢰하지 않음)
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id || null;

    // 2. Body 파싱 및 입력값 검증
    const body = await request.json().catch(() => ({}));
    const messageRaw = typeof body.message === "string" ? body.message.trim() : "";

    if (!messageRaw || messageRaw.length < 2) {
      return NextResponse.json(
        { error: "의견 내용을 최소 2자 이상 입력해 주세요." },
        { status: 400 }
      );
    }

    if (messageRaw.length > 2000) {
      return NextResponse.json(
        { error: "의견 내용은 최대 2,000자까지 입력 가능합니다." },
        { status: 400 }
      );
    }

    const categoryRaw = typeof body.category === "string" ? body.category.toLowerCase().trim() : "general";
    const category = ALLOWED_CATEGORIES.has(categoryRaw) ? categoryRaw : "general";
    const page = typeof body.page === "string" ? body.page.slice(0, 200) : null;
    const deviceType = typeof body.deviceType === "string" ? body.deviceType.slice(0, 100) : null;
    const os = typeof body.os === "string" ? body.os.slice(0, 100) : null;
    const browser = typeof body.browser === "string" ? body.browser.slice(0, 100) : null;
    const appMode = typeof body.appMode === "string" ? body.appMode.slice(0, 50) : null;

    // 3. Admin Client 준비 (Fail-closed)
    const adminSupabase = createAdminClient();
    if (!adminSupabase) {
      console.error("[POST /api/feedback] Fail-closed: Service Role client creation failed.");
      return NextResponse.json(
        { error: "서버 설정 오류로 의견을 접수할 수 없습니다." },
        { status: 500 }
      );
    }

    // 4. DB 삽입 (클라이언트가 severity, status, admin_note를 지정하지 못하도록 서버에서 강제 고정)
    const { data, error } = await adminSupabase
      .from("beta_feedback")
      .insert({
        user_id: userId,
        message: messageRaw,
        category,
        page,
        device_type: deviceType,
        os,
        browser,
        app_mode: appMode,
        severity: "UNCLASSIFIED",
        status: "NEW",
        admin_note: null,
        resolved_at: null,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("[POST /api/feedback] DB insert error:", error?.message);
      return NextResponse.json(
        { error: "의견 전송에 실패했습니다. 잠시 후 다시 시도해 주세요." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      message: "의견을 성공적으로 접수하였습니다. 감사합니다!",
    });
  } catch (err: unknown) {
    console.error("[POST /api/feedback] Exception:", err);
    return NextResponse.json(
      { error: "의견 전송 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
