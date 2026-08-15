# Kakao & Supabase OAuth Production 설정 체크리스트

본 문서는 상용 배포(Production Deployment) 시 Kakao Developers 및 Supabase Authentication URL 설정을 점검하는 체크리스트입니다.

---

## 1. Supabase Authentication > URL Configuration
- [ ] **Site URL**: `https://your-domain.com` (상용 서비스 운영 도메인)
- [ ] **Redirect URLs**:
  - `https://your-domain.com/auth/callback` (운영 Callback)
  - `http://localhost:3000/auth/callback` (로컬 개발용 유지를 위해 보존)
- [ ] **Allow users without email**: `ON` (카카오 로그인 이메일 미제공 대응)

---

## 2. Kakao Developers 설정 점검
- [ ] **앱 상태**: 카카오 로그인 `ON`
- [ ] **Redirect URI**: `https://your-project.supabase.co/auth/v1/callback` (Supabase Provider Callback URL 등록 완료)
- [ ] **REST API Key & Client Secret**: Supabase Provider 설정 콘솔에만 입력 (소스코드 하드코딩 금지)
- [ ] **동의항목**: `account_email` (선택/권한 없음 허용), `profile_nickname` (사용자 닉네임)
- [ ] **웹 플랫폼 도메인**: `https://your-domain.com`, `http://localhost:3000` 등록

---

## 3. OAuth PKCE 및 Callback 흐름 점검
- [ ] `/auth/callback/route.ts` PKCE code exchange 오류 처리 및 로그인 에러 쿼리 파싱 확인
- [ ] 로그인 실패 시 `/login?error=...` 한국어 친화적 에러 메시지 반환 확인
- [ ] `scopes: ""` 옵션을 적용하여 Kakao KOE205 권한 에러 예방

---

## ⚠️ 보안 주의사항
Client Secret Key, REST API Key, `SUPABASE_SERVICE_ROLE_KEY` 등 비밀 키는 본 문서나 커밋 내역에 절대 기록하지 마십시오.
