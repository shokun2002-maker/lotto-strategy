import "server-only";

/**
 * Admin Authentication & Authorization Helper (Server-only)
 *
 * 보안 원칙:
 * 1. ADMIN_USER_IDS 환경변수 기반 allowlist 방식만 사용 (공개키 NEXT_PUBLIC_* 사용 금지)
 * 2. ADMIN_USER_IDS 미설정 또는 userId 미존재 시 무조건 false 반환 (Fail-closed)
 * 3. UUID 하드코딩 전면 금지
 */

export function isAdminUserId(userId?: string | null): boolean {
  if (!userId || typeof userId !== "string") {
    return false;
  }

  const rawAdminUserIds = process.env.ADMIN_USER_IDS;
  if (!rawAdminUserIds || !rawAdminUserIds.trim()) {
    return false;
  }

  const adminList = rawAdminUserIds
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);

  return adminList.includes(userId.trim());
}
