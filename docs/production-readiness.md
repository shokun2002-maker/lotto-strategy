# Production Readiness Matrix (배포 준비도 점검표)

본 문서는 LOTTO STRATEGY 무료 베타 서비스 상용 배포를 위한 항목별 준비 상태(Readiness Status) 점검표입니다.

---

## 📊 Production Readiness Status Summary

| 영역 (Category) | 점검 항목 (Item) | 상태 (Status) | 주요 내용 및 비고 |
| :--- | :--- | :---: | :--- |
| **Auth** | Supabase Email Auth | `DONE` | 이메일 회원가입/로그인/세션 유지 및 한국어 오류 파싱 완성 |
| **OAuth** | Kakao OAuth Integration | `DONE` | Kakao OAuth, KOE205 대응(`scopes:""`), Callback 핸들러 적용 완료 |
| **Supabase** | DB Schema & Migrations | `DONE` | `001_saved_lotto_data`, `002_user_entitlements`, `003_subscription_foundation`, `004_payment_products` |
| **RLS** | Row Level Security & Grants | `DONE` | 본인 SELECT만 허용, `anon`/`authenticated` CUD 조작 원천 박탈 (`REVOKE ALL`) |
| **Cloud Sync** | LocalStorage ↔ Cloud Sync | `DONE` | Guest First 로컬 보존 및 로그인 시 양방향 자동 동기화 안정성 검증 |
| **Billing Lock** | Production Billing Security | `DONE` | `BILLING_AVAILABILITY = "under_review"`, `active = false`, Mock Provider Prod 차단 완료 |
| **Policies** | Legal & Compliance Pages | `DONE` | `/terms`, `/privacy`, `/refund-policy`, `/service-info`, `/disclaimer` 및 공통 푸터 완성 |
| **SEO** | OpenGraph & Metadata | `DONE` | App Router Metadata, OpenGraph, `robots.ts`, `sitemap.ts` 완성 |
| **UX Boundaries**| 404, Error, Loading | `DONE` | `not-found.tsx`, `error.tsx` (Client Error Boundary), `loading.tsx` 연동 |
| **Environment** | Env Variables Specification | `DONE` | `.env.example` 정비 및 `NEXT_PUBLIC_APP_URL` 동적 바인딩 |
| **Domain** | Custom Production Domain | `TODO` | 상용 도메인 확정 시 Vercel & Supabase Site URL 업데이트 필요 |
| **Deployment** | Vercel Platform Deployment | `TODO` | 배포 체크리스트(`docs/deployment-checklist.md`) 수립 완료 (실배포 미진행) |
| **Monitoring** | Sentry / Analytics | `TODO` | 배포 후 에러 트래킹 및 트래픽 모니터링 수집 도구 연동 예정 |
| **Backup** | Supabase DB Auto Backup | `DONE` | Supabase Managed Postgres 데이터베이스 자동 백업 활성화 |
| **PG Approval** | PG Merchant Contract | `BLOCKED` | PG 심사 제출 문서 준비 완료 (`docs/payment-provider-review.md`), 심사 전 |

---

## 🎯 무료 베타 론칭을 위한 결론
현 프로젝트는 **실제 상용 도메인 및 Vercel 환경 변수만 등록하면 즉시 안전하게 무료 베타 서비스를 배포할 수 있는 준비도(Production Ready)**를 갖추었습니다.
