# LOTTO STRATEGY

데이터 분석과 나만의 맞춤 전략으로 로또 번호를 조합하고 관리하는 모바일 퍼스트 스마트 웹 서비스 MVP입니다.

## 📊 역대 당첨 데이터 명세 (Day 13)

- **데이터 출처 (Data Source)**:
  - 1순위: 대한민국 동행복권 공식 서비스 API (`https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=...`)
  - 2순위: 동행복권 수집 공개 mirror (`https://smok95.github.io/lotto/results/all.json`)
- **데이터 기준 회차**: **제1회 (2002-12-07)** ~ **제1236회 (2026-08-08)**
- **총 회차 수**: **1,236개** 전체 회차 결손/중복 없음 (무결성 100% 검증 통과)
- **마지막 업데이트 날짜**: 2026년 8월 15일
- **데이터 저장 파일**: `src/data/lotto-draws.json`

---

## ☁️ Supabase Database & Cloud Sync (Day 15)

- **Supabase database setup**: `supabase/migrations/001_saved_lotto_data.sql`
- Day 15 Cloud Sync는 authenticated role의 table grants와 RLS 정책을 모두 필요로 합니다.

---

## 👑 FREE / PRO 권한 체계 & RLS 보안 (Day 17)

본 프로젝트는 결제 연동(Day 18) 이전, Supabase DB 기반의 **authoritative FREE / PRO 요금제 권한 체계**를 갖추고 있습니다.

- **Migration Script**: `supabase/migrations/002_user_entitlements.sql`
- **테이블**: `public.user_entitlements`
- **보안 원칙 (RLS)**:
  - `SELECT`: 로그인 사용자 본인(`auth.uid() = user_id`)만 조회 허용
  - `INSERT / UPDATE / DELETE`: 브라우저 클라이언트(`authenticated`/`anon`) 직접 수정 금지. (웹에서 `update({ plan: "pro" })` 차단)
  - `Fallback`: 비회원(Guest), DB 조회 실패, entitlement 레코드 부재 시 안전하게 **FREE**로 자동 해석

### 🧪 개발용 수동 PRO 테스트 방법 (Dev Manual PRO Testing)
개발 환경에서 수동으로 PRO 권한을 부여하거나 테스트하려면 **Supabase Dashboard > SQL Editor**에서 아래 쿼리를 실행하세요:

```sql
-- 1. PRO 권한 수동 부여 (특정 사용자 UUID 지정)
INSERT INTO public.user_entitlements (user_id, plan, status, source)
VALUES ('YOUR_USER_UUID_HERE', 'pro', 'active', 'manual')
ON CONFLICT (user_id) DO UPDATE
SET plan = 'pro', status = 'active', updated_at = now();

-- 2. 다시 FREE 권한으로 복구
UPDATE public.user_entitlements
SET plan = 'free', updated_at = now()
WHERE user_id = 'YOUR_USER_UUID_HERE';
```

### 🔒 RLS 보안 검증 절차
1. `SELECT * FROM public.user_entitlements;` -> 본인 user_id 행만 반환
2. 타 사용자의 `user_id` 조회 시 -> 0건 반환 (RLS 차단)
3. 브라우저 `supabase.from('user_entitlements').update({ plan: 'pro' })` 실행 시 -> Permission Denied 에러 발생

---

## 💳 PG-Independent Subscription Backend Foundation (Day 18)

본 프로젝트는 특정 PG 결제사(토스, 카카오페이, 네이버페이 등)에 구동 로직이 종속되지 않는 **PG 독립적 구독 백엔드 파운데이션(Subscription Backend Foundation)**을 갖추고 있습니다.

```
Payment Provider (Toss / KakaoPay / NaverPay)
              ↓
  Server-Side Verification (API / Webhook)
              ↓
  public.payments / public.subscriptions (DB Log)
              ↓
  public.user_entitlements (Authoritative Feature Gate)
```

- **Migration Script**: `supabase/migrations/003_subscription_foundation.sql`
- **테이블**: `public.subscriptions`, `public.payments`
- **핵심 모듈**:
  - `src/lib/billing/types.ts`: PG 독립적 타입 정의
  - `src/lib/billing/provider.ts`: `IPaymentProviderAdapter` 어댑터 인터페이스
  - `src/lib/billing/subscription-service.ts`: 서버 사이드 구독 승인, 해지 예약 (`cancel_at_period_end`), 만료 처리 및 `order_id` 중복 방지(Idempotency) 로직
- **보안 규칙 (Table Privileges & RLS)**:
  - `anon` 역할: 모든 테이블 권한 명시적 박탈 (`REVOKE ALL`), 조회를 포함한 어떠한 접근도 불가
  - `authenticated` 역할: 모든 기존 테이블 권한 박탈 후 본인 레코드 `SELECT`만 최소 부여 (`GRANT SELECT`), `INSERT / UPDATE / DELETE / TRUNCATE / REFERENCES / TRIGGER` 권한 원천 제거
  - 브라우저 클라이언트를 통한 결제/구독 상태 조작 시도는 RLS 및 Grant 레벨에서 이중 차단됨
  - PG Secret Key 및 `SUPABASE_SERVICE_ROLE_KEY`는 서버 환경 전용이며 브라우저 노출 금지 (`.env.example` 참조)
- **현재 상태**: 실제 PG 결제 심사 및 계약 완료 후 Provider Adapter 연결 예정 (현재 실결제 발생하지 않음)

---

## 🎟️ Payment Product Catalog & Access Pass Architecture (Day 19)

본 프로젝트는 정기 구독뿐만 아니라 **단건 결제(One-time Purchase) 및 기간제 이용권 패스(Access Pass)**를 유연하게 지원하는 확장 결제 상품 아키텍처를 갖추고 있습니다.

```
Payment Product Catalog (public.payment_products)
              ↓
   createPaymentOrder (Locked Server-Side Amount)
              ↓
   Server Verification (verifyOneTimePayment)
              ↓
   grantAccessPass (starts_at ~ ends_at duration)
              ↓
   public.user_entitlements (Authoritative Feature Gate)
```

- **Migration Script**: `supabase/migrations/004_payment_products.sql`
- **테이블**: `public.payment_products` (`subscription`, `one_time`, `access_pass`)
- **핵심 모듈**:
  - `src/lib/billing/capabilities.ts`: Provider Capability Matrix (Toss, KakaoPay, NaverPay 지원 결제수단 및 `BILLING_AVAILABILITY` 승인 상태 제어)
  - `src/lib/billing/payment-service.ts`: 서버 정찰가 기반 `createPaymentOrder`, `grantAccessPass`, 만료 시 활성 정기구독 유무 대조 후 FREE 복구 `revokeExpiredAccess`
- **보안 및 가용성 규칙**:
  - `payment_products`: `anon`, `authenticated` CUD 조작 원천 차단 (`REVOKE ALL`), `authenticated`에 `SELECT` 권한만 부여
  - `BILLING_AVAILABILITY`: 현재 기본값은 `"under_review"`이며, `"approved"`가 아닌 경우 실제 결제창 호출, PG SDK 로드 및 entitlement 자동 승인이 철저히 차단됨
  - **임시 Fixture 가격 명시**: DB 및 코드에 설정된 금액(1,900원, 3,900원, 9,900원 등)은 결제 흐름 검증용 임시 테스트 fixture 가격이며, 실제 판매 가격은 미확정 상태입니다 (`active = false` 유지).

---

## 🛠️ 데이터 유지보수 및 파이프라인 (Lotto Data Maintenance)

본 프로젝트는 원본 데이터 보존 및 검증을 최우선으로 하는 원자적(Atomic) 데이터 갱신 파이프라인을 갖추고 있습니다.

### 1. 신규 회차 수집 및 안전 업데이트
새로운 회차 추첨이 완료되면 아래 명령으로 원자적 파일 교체(Atomic Replacement)를 통해 데이터를 안전하게 업데이트합니다:

```bash
npm run lotto:update
```

### 2. Dry-Run 모드 (파일 변경 없이 사전 검증만 수행)
```bash
npm run lotto:update -- --dry-run
```

### 3. 전체 데이터 무결성 검증
```bash
npm run lotto:validate
```

---

## 🚀 Getting Started

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드 검증
npm run build
```
