/**
 * Supabase Auth & DB 영어 에러 메시지를 한국어 친화적인 안내 메시지로 변환하는 모듈
 */
export function formatAuthError(error: any): string {
  if (!error) return "알 수 없는 오류가 발생했습니다.";

  const message = typeof error === "string" ? error : error.message || "";

  if (message.includes("Failed to fetch") || message.includes("fetch failed") || message.includes("NetworkError")) {
    return "Supabase 서버에 연결할 수 없습니다. .env.local의 NEXT_PUBLIC_SUPABASE_URL 설정과 네트워크 연결 상태를 확인해주세요.";
  }

  if (message.includes("permission denied") || message.includes("permission_denied")) {
    return "Supabase DB 테이블 접근 권한(GRANT/RLS)이 필요합니다. migration SQL을 실행해주세요.";
  }

  if (message.includes("Invalid login credentials")) {
    return "이메일 또는 비밀번호를 확인해주세요.";
  }

  if (message.includes("User already registered") || message.includes("user_already_exists")) {
    return "이미 가입된 이메일 주소입니다.";
  }

  if (message.includes("Password should be at least") || message.includes("password")) {
    return "비밀번호는 최소 8자 이상이어야 합니다.";
  }

  if (message.includes("Email not confirmed")) {
    return "이메일 인증이 필요합니다. 가입하신 이메일의 수신함을 확인해주세요.";
  }

  if (message.includes("rate limit") || message.includes("Too many requests")) {
    return "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
  }

  if (message.includes("access_denied") || message.includes("user_denied") || message.includes("User denied")) {
    return "카카오 로그인이 취소되었거나 동의가 거부되었습니다.";
  }

  if (message.includes("email") && (message.includes("required") || message.includes("denied") || message.includes("missing") || message.includes("grant"))) {
    return "카카오 계정에서 이메일 제공 동의가 필요합니다.";
  }

  if (message.includes("provider") && (message.includes("disabled") || message.includes("not enabled") || message.includes("Unsupported"))) {
    return "카카오 로그인 설정이 올바르지 않거나 활성화되지 않았습니다.";
  }

  if (message.includes("auth-callback-failed") || message.includes("oauth_callback_failed")) {
    return "카카오 로그인 인증 처리에 실패했습니다. 다시 시도해주세요.";
  }

  if (message.includes("Unable to validate email address") || message.includes("invalid email")) {
    return "올바른 이메일 형식을 입력해주세요.";
  }

  return message || "인증 처리 중 오류가 발생했습니다.";
}
