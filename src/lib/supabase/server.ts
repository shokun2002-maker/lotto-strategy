import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function isValidHttpUrl(urlStr?: string): boolean {
  if (!urlStr) return false;
  try {
    const u = new URL(urlStr);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * 서버 컴포넌트, 서버 액션, API 라우트용 Supabase 서버 클라이언트
 */
export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const validUrl = isValidHttpUrl(supabaseUrl) ? supabaseUrl! : "https://placeholder.supabase.co";
  const validKey = supabaseAnonKey || "placeholder-key";

  return createServerClient(validUrl, validKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component에서는 쿠키를 직접 변경할 수 없으나 proxy에서 자동 갱신됨
        }
      },
    },
  });
}
