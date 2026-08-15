# Production Deployment Guide & Checklist (Vercel 타겟)

본 문서는 LOTTO STRATEGY 서비스를 Vercel 플랫폼에 배포할 때 사용하는 추천 배포 절차 가이드라인입니다.

---

## 1. 배포 타겟 선정 이유 (Vercel 추천)
- **Next.js 16.3.1 App Router 완벽 지원**: Server Actions, Dynamic Route Handlers(`api/billing/*`, `auth/callback`), SSR Middleware(`proxy.ts`) 정식 지원
- **Edge / Serverless Functions**: Cloudflare Pages Static-only 호환 이슈(Server Route Handler 충돌) 없이 안정적 서버 실행
- **Automatic SSL/TLS & Custom Domain**: 무료 SSL 및 커스텀 도메인 용이한 바인딩

---

## 2. 배포 단계별 체크리스트

### Step 1: GitHub Repository 연동
- [ ] GitHub main 브랜치 최신화 및 빌드 검증 (`npm run build` 통과)

### Step 2: Vercel Project 생성 & Environment Variables 설정
Vercel Dashboard > Project Settings > Environment Variables 등록:
- [ ] `NEXT_PUBLIC_APP_URL`: `https://your-domain.com`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`: `https://your-project.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: `your-anon-key`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`: `your-service-role-key` (Server-Only)

### Step 3: Build & Output Settings
- [ ] Framework Preset: `Next.js`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: Next.js default (`.next`)

### Step 4: Supabase & OAuth Redirect 동기화
- [ ] Supabase Site URL을 Vercel 커스텀 도메인(`https://your-domain.com`)으로 업데이트
- [ ] Kakao Developers 웹 도메인 및 Redirect URI 검증

---

## 3. 배포 후 최종 검증 (Smoke Test)
- [ ] 메인 홈, `/quick`, `/together`, `/strategy`, `/numbers` 정상 렌더링 확인
- [ ] `/terms`, `/privacy`, `/refund-policy`, `/service-info`, `/disclaimer` 정책 페이지 확인
- [ ] 이메일 회원가입/로그인 및 Kakao OAuth 로그인 동작 테스트
- [ ] LocalStorage ↔ Cloud Sync 양방향 동기화 검증
- [ ] `/api/billing/status` 헬스 체크 API 응답 확인 (`billingAvailability: "under_review"`)
