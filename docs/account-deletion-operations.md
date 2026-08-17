# LOTTO STRATEGY 운영자 수동 회원 탈퇴 대응 매뉴얼

본 문서는 이용자의 회원 탈퇴 문의 또는 자동 탈퇴 실패 건 발생 시, 운영자가 안전하고 규정에 맞춰 수동으로 계정을 처리하기 위한 운영 가이드라인입니다.

---

## 1. 보안 및 비밀키 엄격 관리 원칙 (Fail-Closed)

1. **Service Role Key & URL Fail-Closed 정책**:
   - `NEXT_PUBLIC_SUPABASE_URL` 또는 `SUPABASE_SERVICE_ROLE_KEY` 중 하나라도 백엔드 환경변수에 설정되어 있지 않을 경우, 공개키(Anon Key)나 Placeholder URL로의 대체(fallback)를 전면 금지하고 **즉시 차단(Fail-Closed)**하여 500 에러를 반환합니다.
   - 어떠한 이유로도 클라이언트 코드(`NEXT_PUBLIC_*`), Git 커밋, 이슈 트래커, 외부 전달용 메일 또는 콘솔 로그에 비밀키 값이 포함되어서는 안 됩니다.

2. **로그 정책 및 민감 정보 조율**:
   - 운영자 로그 또는 서빙 로그에 사용자의 access token, refresh token, password hash, service role key 등이 절대 기록되어서는 안 됩니다.

---

## 2. Supabase DB Schema & CASCADE / 레코드 보존 Guard 명세

### 2-1. DB Schema FK 구조
- `public.saved_combinations`: `user_id uuid references auth.users(id) on delete cascade`
- `public.saved_custom_strategies`: `user_id uuid references auth.users(id) on delete cascade`
- `public.user_entitlements`: `user_id uuid references auth.users(id) on delete cascade`
- `public.subscriptions`: `user_id uuid references auth.users(id) on delete cascade`
- `public.payments`: `user_id uuid references auth.users(id) on delete cascade`

### 2-2. 거래/구독 레코드 존재 시 회원 탈퇴 차단 (409 Conflict)
- `subscriptions` 또는 `payments` 테이블에 해당 `user_id` 레코드가 하나라도 존재하는 경우, 법적/회계 기록 파기를 방지하기 위해 **자동 회원 탈퇴를 즉시 차단(409 Conflict)**합니다.
- 탈퇴 차단 시:
  - Supabase `auth.users` 계정 삭제 금지
  - Cloud 데이터 파기 금지
  - 로컬 LocalStorage / Isolated Storage 삭제 금지
  - 클라이언트 세션 로그아웃 금지

### 2-3. 거래 기록 없는 일반 계정 원자적(Atomic) 파기
- `subscriptions` 및 `payments` 레코드가 없는 일반 계정의 경우, `adminSupabase.auth.admin.deleteUser(userId)` 단일 동작으로 계정을 삭제합니다.
- PostgreSQL Foreign Key CASCADE에 의해 `saved_combinations`, `saved_custom_strategies`, `user_entitlements`가 한 번에 파기되며, 부분 삭제(Partial Deletion) 현상이 100% 방지됩니다.

### 2-4. 향후 PG 실결제 전환 시 DB Migration TODO
- 향후 실결제 오픈 시, 거래 기록이 있는 계정의 탈퇴를 지원하기 위해 아래 작업을 수행해야 합니다:
  1. `payments` / `subscriptions` 테이블의 `user_id` FK를 `ON DELETE CASCADE`에서 `ON DELETE SET NULL` 또는 별도 anonymized user id 방식으로 분리.
  2. 전자상거래법 등 관계 법령에 따른 결제/환불 거래 기록 보존 기간(5년) 명시.
  3. 활성 구독 해지 및 정산 완료 후 계정 익명화 파기 프로세스 구축.

---

## 3. 사용자 회원 탈퇴 요청 수동 처리 절차

자동 탈퇴 실패 문의(네트워크 오류, 세션 만료, 409 거래 기록 존재 등) 접수 시 아래 순서에 따라 처리합니다.

### Step 1: 본인 확인 절차
- 요청자가 해당 계정의 소유자(이메일 또는 Kakao OAuth 이메일)인지 사전 검증합니다.

### Step 2: 결제/구독 거래 내역 확인
- `subscriptions` 및 `payments` 테이블에 해당 사용자의 거래 기록이 있는지 확인합니다.
- 거래 기록이 있는 경우, 법적/회계 보존 방침을 안내하고 필요 시 수동 정산 후 계정 익명화 처리를 진행합니다.

### Step 3: Supabase Dashboard를 통한 수동 삭제 (거래 기록 없는 계정)
1. **Supabase Dashboard 로그인** $\rightarrow$ 해당 프로젝트 선택
2. **Authentication** $\rightarrow$ **Users** 메뉴 진입
3. 탈퇴 요청 사용자의 이메일 또는 UUID 검색
4. 해당 사용자 우측 메뉴 $\rightarrow$ **Delete User** 실행

---

## 4. Kakao OAuth 계정 탈퇴 및 연동 해지 (Unlink) 정책

- **Supabase 서비스 계정 삭제**: Supabase `auth.users`에서 삭제 시 해당 Kakao 계정으로 생성되었던 LOTTO STRATEGY 서비스 회원 및 Cloud 동기화 데이터는 완전히 삭제됩니다.
- **Kakao 플랫폼 연동 해지 (Kakao Unlink)**:
  - 이용자가 카카오 계정 설정(카카오톡 $\rightarrow$ 전체설정 $\rightarrow$ 카카오계정 $\rightarrow$ 연결된 서비스 관리)에서 직접 앱 연동을 해지할 수 있습니다.
  - 카카오 REST Admin Key를 웹 앱 클라이언트에 노출하지 않기 위해, 서비스 내에서는 안전하게 Supabase Auth 계정 삭제를 우선 수행합니다.
  - 탈퇴 후 사용자가 동일한 Kakao 계정으로 다시 로그인할 경우 기존 데이터가 복구되지 않고 신규 계정으로 독립 생성됩니다.

---

## 5. 장애 및 비상 조치 가이드

- **서버 삭제 실패 발생 시**: 클라이언트 단의 LocalStorage 및 Isolated Storage 데이터는 자동 삭제되지 않고 안전하게 유지됩니다. 이용자에게 "잠시 후 다시 시도해 주세요" 안내문을 표시하며, 데이터 유실이 발생하지 않습니다.
- **문의 창구**: 글로컬소프트 고객지원팀 (`glocalsoft@geullokeolsopeuteuui-Macmini.local`)
