import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteUserAccountServer } from "@/lib/account/delete-account-service";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return NextResponse.json(
        { success: false, error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const userId = userData.user.id;
    const result = await deleteUserAccountServer(userId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "회원 탈퇴 처리 중 오류가 발생했습니다." },
        { status: result.statusCode || 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("Account delete API error:", (error as Error)?.message || error);
    return NextResponse.json(
      { success: false, error: "회원 탈퇴 처리 중 시스템 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
