# Day 29 Production Security & Operations Readiness Checklist

본 체크리스트는 LOTTO STRATEGY 서비스의 프로덕션(Vercel & Supabase) 출시 직전 보안, 환경변수, RLS, 인증/OAuth, 계정 격리, 회원 탈퇴, 개인정보/약관, SEO/URL 및 모바일 UX 상태를 종합 점검한 결과입니다.

---

## 1. Secret & Environment Variables Audit

| ID | 점검 항목 | 상태 | 비고 / 결과 |
| :--- | :--- | :---: | :--- |
| **SEC-01** | Git 추적 대상 `.env*` 파일 존재 여부 | **PASS** | `git ls-files` 결과 `.env` / `.env.local` 없음. `.gitignore`에 `.env*` 차단 설정 완료. |
| **SEC-02** | `SUPABASE_SERVICE_ROLE_KEY` 클라이언트 노출 여부 | **PASS** | 서버 전용 API 및 서비스 모듈에서만 참조하며 `NEXT_PUBLIC_*` 노출 없음. |
| **SEC-03** | 하드코딩된 Secret / Private Key 존재 여부 | **PASS** | Kakao Secret, PG Secret, Supabase Service Key 하드코딩 0건. |
| **SEC-04** | Auth Token / Refresh Token 콘솔 로그 출력 여부 | **PASS** | 서버 및 클라이언트 로그에 토큰 및 비밀키 출력 없음. |
| **SEC-05** | Server-Only 모듈의 Client Component 직접 Import 여부 | **PASS** | `delete-account-service.ts`, `subscription-service.ts` 등은 오직 API Route Handler에서만 참조. |

---

## 2. Supabase RLS & DB Schema Security Audit

| ID | 점검 항목 | 상태 | 비고 / 결과 |
| :--- | :--- | :---: | :--- |
| **RLS-01** | `saved_combinations` RLS 및 본인 격리 | **PASS** | RLS Enabled. `auth.uid() = user_id` 조건으로 타 계정 및 Anon 접근 전면 차단. |
| **RLS-02** | `saved_custom_strategies` RLS 및 본인 격리 | **PASS** | RLS Enabled. `auth.uid() = user_id` 조건으로 CRUD 권한 격리 완료. |
| **RLS-03** | `user_entitlements` RLS 및 읽기 전용 | **PASS** | RLS Enabled. `SELECT` 권한만 본인에 부여하며 브라우저 `INSERT`/`UPDATE` 차단. |
| **RLS-04** | `subscriptions` & `payments` RLS 및 최저 권한 | **PASS** | RLS Enabled. Anon/Authenticated 쓰기 차단, 본인 `SELECT` 권한만 부여. |
| **RLS-05** | Foreign Key ON DELETE CASCADE 정의 | **PASS** | `saved_combinations`, `saved_custom_strategies`, `user_entitlements`, `subscriptions`, `payments` 모두 cascade 설정 확인. |

---

## 3. Account Isolation & Data Preservation Audit

| ID | 점검 항목 | 상태 | 비고 / 결과 |
| :--- | :--- | :---: | :--- |
| **ISO-01** | Guest 번호 생성 $\rightarrow$ Account A 로그인 승격 | **PASS** | Guest 소유 번호가 Account A 로그인 시 A 소유로 승격되어 A Cloud로 정상 병합. |
| **ISO-02** | Account A 로그아웃 시 Guest UI 격리 | **PASS** | 로그아웃 시 A의 private 데이터는 `isolated-combinations`로 이동되어 Guest UI 노출 차단. |
| **ISO-03** | Guest 상태에서 신규 번호 생성 후 Account B 로그인 | **PASS** | 신규 Guest 번호만 B로 병합되며, A의 isolated 데이터는 B UI 및 B Cloud에 절대 미노출. |
| **ISO-04** | Account A 재로그인 시 데이터 복원 | **PASS** | Isolated storage에서 A 소유 데이터 X가 Active Storage로 100% 정상 복원됨. |
| **ISO-05** | 동기화 오류 시 데이터 보존 | **PASS** | 네트워크 오프라인 또는 API 오류 시 Active/Isolated 항목 유실 없음. |

---

## 4. Self Account Deletion Security Audit

| ID | 점검 항목 | 상태 | 비고 / 결과 |
| :--- | :--- | :---: | :--- |
| **DEL-01** | 비로그인 `POST /api/account/delete` | **PASS** | `401 Unauthorized` (`"인증이 필요합니다."`) 즉시 반환. |
| **DEL-02** | Body `userId` 변조 공격 방어 | **PASS** | Body `userId`를 미신뢰하고 서버 세션 쿠키의 `auth.getUser().id`만 사용. |
| **DEL-03** | GET 요청 등 HTTP Method 제한 | **PASS** | POST 이외 요청 차단. |
| **DEL-04** | Supabase URL / Service Role Key 미존재 시 Fail-Closed | **PASS** | key/URL 미설정 시 즉시 500 반환 (공개키/placeholder fallback 사용 안 함). |
| **DEL-05** | `subscriptions` / `payments` 레코드 존재 시 409 차단 | **PASS** | 거래/구독 레코드 존재 시 `409` 응답 반환 및 계정/데이터 파기 즉시 차단. |
| **DEL-06** | DB 조회 실패 시 Fail-Closed | **PASS** | DB 조회 에러 시 레코드가 없다고 추측하지 않고 500 반환 후 삭제 차단. |
| **DEL-07** | 원자적(Atomic) Cascade 파기 | **PASS** | 거래 기록 없는 일반 계정에 한해 `admin.deleteUser` 단일 동작으로 cascade 영구 삭제. |
| **DEL-08** | 로컬 선택적 정리 (`clearDeletedUserLocalData`) | **PASS** | 서버 성공 후에만 탈퇴 user 소유 데이터만 선택 삭제 (타 계정 isolated 및 Guest 데이터 보존). |

---

## 5. API Route Security Audit

| ID | 점검 항목 | 상태 | 비고 / 결과 |
| :--- | :--- | :---: | :--- |
| **API-01** | `/api/account/delete` | **PASS** | Auth required (POST). Raw DB 에러 미노출. Fail-closed 원자적 파기 적용. |
| **API-02** | `/api/billing/subscription` | **PASS** | Auth required (GET/POST). Raw DB 에러 정화 및 본인 구독 정보만 접근 허용. |
| **API-03** | `/api/billing/status` | **PASS** | Public health check (GET). `BILLING_AVAILABILITY = "under_review"` 정찰 상태 반환. |

---

## 6. Auth / OAuth & Production URL Audit

| ID | 점검 항목 | 상태 | 비고 / 결과 |
| :--- | :--- | :---: | :--- |
| **AUTH-01** | Email 로그인 및 세션 유지 | **PASS** | `/auth/callback` 및 세션 유지 정상. |
| **AUTH-02** | Kakao OAuth 동기화 | **PASS** | 닉네임 없는 카카오 계정 및 이메일 상이 계정 대응 완비. |
| **AUTH-03** | Production URL Fallback 계층 | **PASS** | `NEXT_PUBLIC_APP_URL` $\rightarrow$ `VERCEL_PROJECT_PRODUCTION_URL` $\rightarrow$ `https://lotto-strategy.vercel.app` 계층 확립. |
| **AUTH-04** | Open Redirect 방어 | **PASS** | Callback URL 하드코딩 방지 및 안전한 상대 경로 기반 리다이렉트 적용. |

---

## 7. Security Headers & Policy Audit

| ID | 점검 항목 | 상태 | 비고 / 결과 |
| :--- | :--- | :---: | :--- |
| **HDR-01** | Security Headers 설정 (`next.config.ts`) | **PASS** | `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy` 설정 완료. |
| **POL-01** | 개인정보처리방침 (`/privacy`) 동기화 | **PASS** | 제4조에 MY 페이지 회원 탈퇴 기능을 통한 지체 없는 파기 명시 반영 완료. |
| **POL-02** | 서비스 이용약관 (`/terms`) 동기화 | **PASS** | 복권 미판매, 당첨 미보장 및 데이터 분석 참고 도구 명시 확립. |

---

## 8. Responsible Lottery Messaging Audit

| ID | 점검 항목 | 상태 | 비고 / 결과 |
| :--- | :--- | :---: | :--- |
| **MSG-01** | 오해 유발 과대 광고문구 존재 여부 | **PASS** | "당첨 보장", "확률 상승 보장", "필승", "무조건", "고수익", "확실한 번호", "AI 당첨" 0건. |
| **MSG-02** | 면책 고지 안내 컴포넌트 (`ServiceDisclaimer`) | **PASS** | 모든 핵심 페이지 하단 및 정책 페이지에 독립 무작위 확률 및 면책 고지 명시. |

---

## 9. SEO & Metadata Audit

| ID | 점검 항목 | 상태 | 비고 / 결과 |
| :--- | :--- | :---: | :--- |
| **SEO-01** | `robots.txt` 및 `sitemap.xml` | **PASS** | `/robots.txt` 및 `/sitemap.xml` 정상 서빙. localhost URL 미노출. |
| **SEO-02** | Metadata & OpenGraph 설정 | **PASS** | `layout.tsx` 내 metadataBase 프로덕션 fallback 적용 완료. |

---

## 10. 회귀 및 데이터 무결성 검증

| ID | 점검 항목 | 상태 | 비고 / 결과 |
| :--- | :--- | :---: | :--- |
| **REG-01** | `npm run lotto:check` | **PASS** | `status: WAITING`, `exitCode: 0`. |
| **REG-02** | `npm run lotto:regression` | **PASS** | `9/9 PASS`, `exitCode: 0`. |
| **REG-03** | `npm run lotto:validate` | **PASS** | `로컬 데이터 무결성 100% 검증 통과`, `exitCode: 0`. |
| **REG-04** | `npx eslint .` | **PASS** | `0 errors`. |
| **REG-05** | `npm run build` | **PASS** | `Compiled successfully` (23 static/dynamic routes). |
| **REG-06** | `git diff -- src/data/lotto-draws.json` | **PASS** | 출력 없음 (프로덕션 로또 데이터 100% 보존). |
