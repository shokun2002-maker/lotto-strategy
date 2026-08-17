# Day 30 Release Candidate (RC) Final Verification Checklist

본 체크리스트는 LOTTO STRATEGY 무료 베타 MVP 서비스의 프로덕션(Vercel & Supabase) 확정을 위한 최종 Release Candidate (RC) 검증 항목 및 결과입니다.

---

## 1. Journey A ~ I 사용자 흐름 검증

| ID | 검증 항목 | 상태 | 결과 및 비고 |
| :--- | :--- | :---: | :--- |
| **RC-J01** | Journey A: 신규 Guest 사용자 흐름 | **PASS** | 로그인 강제 없이 번호 생성/저장 및 `/numbers` 조회 정상. 새로고침 후 데이터 100% 보존. |
| **RC-J02** | Journey B: Guest $\rightarrow$ 로그인 데이터 승격 | **PASS** | Guest 데이터 유실 없이 사용자 계정으로 ownership 승격 및 Cloud 동기화 완료. |
| **RC-J03** | Journey C: 동일 계정 재로그인 | **PASS** | 계정 A 로그아웃 후 재로그인 시 Active storage 및 Cloud 데이터 100% 복원. |
| **RC-J04** | Journey D: 다중 계정 격리 | **PASS** | 계정 A 데이터가 계정 B UI 및 B Cloud에 노출/업로드되지 않고 `isolated-combinations`로 격리. |
| **RC-J05** | Journey E: Guest 데이터 + 계정 전환 | **PASS** | Guest 데이터만 계정 B로 승격되며, 기존 계정 A의 isolated 데이터는 안전하게 보존. |
| **RC-J06** | Journey F: 번호 추천 (Quick/Together/Strategy) | **PASS** | 1~45 범위, 6개 유일 번호, 오름차순 정렬, 저장 및 전략 생성 정상. |
| **RC-J07** | Journey G: 내 번호 (`/numbers`) UX | **PASS** | 최신 회차 우선, 회차 내 저장 최신 순(GAME 1~), 당첨 결과 및 삭제 2단계 모달 정상. |
| **RC-J08** | Journey H: MY & Cloud Sync (`/my`) | **PASS** | 계정 상태, Provider, Sync 시간 및 오류 시 Local/Isolated 데이터 100% 보존. |
| **RC-J09** | Journey I: 회원 탈퇴 (Self Deletion) | **PASS** | 2단계 모달, POST 서버 전용 세션 인증, 결제/구독 레코드 존재 시 409 차단, 원자적 파기 완료. |

---

## 2. Production Environment & Security Audit

| ID | 검증 항목 | 상태 | 결과 및 비고 |
| :--- | :--- | :---: | :--- |
| **RC-SEC01**| Service Role Key 클라이언트 미노출 | **PASS** | `SUPABASE_SERVICE_ROLE_KEY` 서버 전용 참조 및 Fail-closed admin client 검증 완료. |
| **RC-SEC02**| Secret Key 하드코딩 여부 | **PASS** | Supabase/Kakao/PG Secret 하드코딩 0건. |
| **RC-SEC03**| Production URL Fallback 계층 | **PASS** | `NEXT_PUBLIC_APP_URL` $\rightarrow$ `VERCEL_PROJECT_PRODUCTION_URL` $\rightarrow$ `https://lotto-strategy.vercel.app`. |
| **RC-SEC04**| Security Headers (`next.config.ts`) | **PASS** | `nosniff`, `strict-origin-when-cross-origin`, `DENY`, `Permissions-Policy` 정상 적용. |
| **RC-SEC05**| SEO & Metadata (`robots.txt`/`sitemap.xml`) | **PASS** | localhost URL 미노출 및 프로덕션 URL 정상 서빙. |

---

## 3. Responsible Messaging & Legal Audit

| ID | 검증 항목 | 상태 | 결과 및 비고 |
| :--- | :--- | :---: | :--- |
| **RC-LEG01**| 과대 광고 문구 존재 여부 | **PASS** | "당첨 보장", "확률 상승 보장", "필승", "무조건", "고수익", "확실한 번호", "AI 당첨" 0건. |
| **RC-LEG02**| 면책 고지 (`ServiceDisclaimer`) | **PASS** | 과거 데이터 분석 참고 도구이며 독립 무작위 확률로 당첨을 보장하지 않음을 안내. |
| **RC-LEG03**| 약관 및 방침 (`/privacy`, `/terms`) | **PASS** | MY 페이지 회원 탈퇴 지체 없는 파기 조항 및 서비스 이용 조건 동기화 완료. |

---

## 4. Mobile & Browser UX Audit

| ID | 검증 항목 | 상태 | 결과 및 비고 |
| :--- | :--- | :---: | :--- |
| **RC-UX01** | 360px 모바일 화면 레이아웃 | **PASS** | horizontal overflow 없음, LottoBall 6개 정상 배치, 터치 타겟 정상. |
| **RC-UX02** | Empty / Loading State | **PASS** | 데이터 미존재 시 명확한 한국어 안내 메시지 표시. |

---

## 5. 회귀 테스트 및 파이프라인 무결성

| ID | 검증 항목 | 상태 | 결과 및 비고 |
| :--- | :--- | :---: | :--- |
| **RC-PIPE01**| `npm run lotto:check` | **PASS** | `status: WAITING`, `exitCode: 0`. |
| **RC-PIPE02**| `npm run lotto:regression` | **PASS** | `9/9 PASS`, `exitCode: 0`. |
| **RC-PIPE03**| `npm run lotto:validate` | **PASS** | `로컬 데이터 무결성 100% 검증 통과`, `exitCode: 0`. |
| **RC-PIPE04**| `npm run build` | **PASS** | `Compiled successfully` (23 static/dynamic routes). |
| **RC-PIPE05**| `git diff -- src/data/lotto-draws.json` | **PASS** | 출력 없음 (프로덕션 데이터 100% 보존). |
