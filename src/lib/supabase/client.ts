import { createBrowserClient } from "@supabase/ssr";

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
 * 브라우저 (Client Component)용 Supabase 클라이언트 팩토리 함수
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const validUrl = isValidHttpUrl(supabaseUrl) ? supabaseUrl! : "https://placeholder.supabase.co";
  const validKey = supabaseAnonKey || "placeholder-anon-key";

  return createBrowserClient(validUrl, validKey);
}
