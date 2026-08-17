import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { isAdminUserId } from "@/lib/admin/admin-auth";
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

const ALLOWED_SEVERITIES = new Set(["UNCLASSIFIED", "P0", "P1", "P2", "P3"]);
const ALLOWED_STATUSES = new Set([
  "NEW",
  "CONFIRMED",
  "IN_PROGRESS",
  "FIXED",
  "RETEST",
  "CLOSED",
  "WONT_FIX",
]);
const ALLOWED_CATEGORIES = new Set(["general", "bug", "ux", "feature"]);

/**
 * GET /api/admin/feedback
 * 관리자 전용 베타 피드백 목록 조회 API
 */
export async function GET(request: Request) {
  try {
    // 1. 관리자 세션 및 권한 검증
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    if (!isAdminUserId(userData.user.id)) {
      return NextResponse.json({ error: "관리자 접근 권한이 없습니다." }, { status: 403 });
    }

    // 2. Service Role Admin Client 준비 (Fail-closed)
    const adminSupabase = createAdminClient();
    if (!adminSupabase) {
      console.error("[GET /api/admin/feedback] Fail-closed: Admin client error.");
      return NextResponse.json({ error: "서버 관리자 설정 오류가 발생했습니다." }, { status: 500 });
    }

    // 3. Query 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const severityParam = searchParams.get("severity");
    const categoryParam = searchParams.get("category");

    let query = adminSupabase
      .from("beta_feedback")
      .select("*")
      .order("created_at", { ascending: false });

    if (statusParam && ALLOWED_STATUSES.has(statusParam)) {
      query = query.eq("status", statusParam);
    }
    if (severityParam && ALLOWED_SEVERITIES.has(severityParam)) {
      query = query.eq("severity", severityParam);
    }
    if (categoryParam && ALLOWED_CATEGORIES.has(categoryParam)) {
      query = query.eq("category", categoryParam);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[GET /api/admin/feedback] DB query error:", error.message);
      return NextResponse.json({ error: "피드백 목록 조회 중 오류가 발생했습니다." }, { status: 500 });
    }

    // 사용자 정보 마스킹 / 표시 가공 (raw user_id UUID는 클라이언트로 전달하지 않음)
    const formattedData = (data || []).map(({ user_id, ...safeRow }) => ({
      ...safeRow,
      user_type: user_id ? "회원" : "Guest",
    }));

    return NextResponse.json({
      success: true,
      feedback: formattedData,
    });
  } catch (err: unknown) {
    console.error("[GET /api/admin/feedback] Exception:", err);
    return NextResponse.json({ error: "관리자 피드백 목록 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/feedback
 * 관리자 전용 피드백 severity, status, admin_note 수정 API
 */
export async function PATCH(request: Request) {
  try {
    // 1. 관리자 권한 검증
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    if (!isAdminUserId(userData.user.id)) {
      return NextResponse.json({ error: "관리자 접근 권한이 없습니다." }, { status: 403 });
    }

    // 2. Service Role Admin Client 준비
    const adminSupabase = createAdminClient();
    if (!adminSupabase) {
      console.error("[PATCH /api/admin/feedback] Fail-closed: Admin client error.");
      return NextResponse.json({ error: "서버 관리자 설정 오류가 발생했습니다." }, { status: 500 });
    }

    // 3. Body 파싱 및 검증
    const body = await request.json().catch(() => ({}));
    const { id, severity, status, adminNote } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "유효하지 않은 피드백 ID입니다." }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (severity !== undefined) {
      if (typeof severity === "string" && ALLOWED_SEVERITIES.has(severity)) {
        updatePayload.severity = severity;
      } else {
        return NextResponse.json({ error: "유효하지 않은 Severity 값입니다." }, { status: 400 });
      }
    }

    if (status !== undefined) {
      if (typeof status === "string" && ALLOWED_STATUSES.has(status)) {
        updatePayload.status = status;
        if (status === "CLOSED") {
          updatePayload.resolved_at = new Date().toISOString();
        } else {
          updatePayload.resolved_at = null;
        }
      } else {
        return NextResponse.json({ error: "유효하지 않은 Status 값입니다." }, { status: 400 });
      }
    }

    if (adminNote !== undefined) {
      updatePayload.admin_note = typeof adminNote === "string" ? adminNote.slice(0, 2000) : null;
    }

    const { data, error } = await adminSupabase
      .from("beta_feedback")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      console.error("[PATCH /api/admin/feedback] DB update error:", error?.message);
      return NextResponse.json({ error: "피드백 정보 수정 중 오류가 발생했습니다." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      feedback: data,
    });
  } catch (err: unknown) {
    console.error("[PATCH /api/admin/feedback] Exception:", err);
    return NextResponse.json({ error: "피드백 수정 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
