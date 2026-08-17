import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    // Supabase URL 또는 Service Role Key가 없으면 fail-closed
    return null;
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export interface DeleteAccountResult {
  success: boolean;
  error?: string;
  statusCode?: number;
}

/**
 * Server-only service for deleting user account safely.
 *
 * 안전 파기 처리 순서:
 * 1. Supabase URL 및 Service Role Key 존재 확인 (미존재 시 Fail-closed 500)
 * 2. subscriptions & payments 거래/구독 레코드 존재 여부 조회 (조회 오류 시 Fail-closed 500)
 * 3. 레코드가 하나라도 존재할 경우 409 Conflict 반환 후 탈퇴 즉시 차단 (법적/회계 기록 보존)
 * 4. 거래/구독 기록이 없는 계정만 auth.admin.deleteUser(userId) 원자적 파기 실행
 * 5. DB Foreign Key ON DELETE CASCADE에 의해 saved_combinations, saved_custom_strategies, user_entitlements 자동 파기
 */
export async function deleteUserAccountServer(userId: string): Promise<DeleteAccountResult> {
  if (!userId) {
    return { success: false, error: "유효하지 않은 사용자 ID입니다.", statusCode: 400 };
  }

  const adminSupabase = createAdminSupabaseClient();
  if (!adminSupabase) {
    console.error("[deleteUserAccountServer] Fail-closed: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.");
    return {
      success: false,
      error: "서버 환경 설정 오류로 회원 탈퇴를 진행할 수 없습니다. 관리자에게 문의해 주세요.",
      statusCode: 500,
    };
  }

  try {
    // 1. subscriptions 거래/구독 레코드 존재 여부 조회
    const { data: subRows, error: subErr } = await adminSupabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    if (subErr) {
      console.error("[deleteUserAccountServer] Fail-closed: subscriptions query error:", subErr.message);
      return {
        success: false,
        error: "회원 탈퇴 처리 중 구독 정보 조회 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        statusCode: 500,
      };
    }

    // 2. payments 결제 내역 레코드 존재 여부 조회
    const { data: payRows, error: payErr } = await adminSupabase
      .from("payments")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    if (payErr) {
      console.error("[deleteUserAccountServer] Fail-closed: payments query error:", payErr.message);
      return {
        success: false,
        error: "회원 탈퇴 처리 중 결제 정보 조회 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        statusCode: 500,
      };
    }

    // 3. 거래 또는 구독 기록이 존재하는 계정은 자동 탈퇴 차단 (409 Conflict)
    const hasSubscriptions = Array.isArray(subRows) && subRows.length > 0;
    const hasPayments = Array.isArray(payRows) && payRows.length > 0;

    if (hasSubscriptions || hasPayments) {
      return {
        success: false,
        statusCode: 409,
        error: "구독 또는 결제 기록이 있는 계정은 현재 자동 탈퇴할 수 없습니다. 고객센터에 문의해 주세요.",
      };
    }

    // 4. 핵심 원자적 삭제: Supabase auth.users 계정 파기
    // DB schema FK(ON DELETE CASCADE)에 의해 saved_combinations, saved_custom_strategies,
    // user_entitlements가 부분 파기 없이 단일 동작으로 원자적 파기됩니다.
    const { error: deleteUserErr } = await adminSupabase.auth.admin.deleteUser(userId);

    if (deleteUserErr) {
      console.error("[deleteUserAccountServer] Admin deleteUser failed:", deleteUserErr.message);
      return {
        success: false,
        error: "회원 탈퇴 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        statusCode: 500,
      };
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("[deleteUserAccountServer] Exception:", (err as Error)?.message || err);
    return {
      success: false,
      error: "회원 탈퇴 처리 중 오류가 발생했습니다.",
      statusCode: 500,
    };
  }
}
