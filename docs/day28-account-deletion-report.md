# Day 28 QA Summary Report: Self Account Deletion & Pre-Launch Operations Stability

## Executive Summary
Day 28에서는 **출시 직전 회원 탈퇴(Self Account Deletion), Fail-Closed 환경변수 검증, 거래/구독 기록 보존 Guard(409), 원자적(Atomic) 데이터 파기, 계정 관리 UX 및 운영 안정성**에 관한 모든 요구사항을 완벽히 보완 및 검증하였습니다.

- **서버 측 전용 탈퇴 API**: `/api/account/delete/route.ts` (POST 전용, 세션 인증 필수)
- **Supabase URL & Service Role Fail-Closed**: `NEXT_PUBLIC_SUPABASE_URL` 또는 `SUPABASE_SERVICE_ROLE_KEY`가 없을 경우 공개키/placeholder URL fallback을 절대 사용하지 않고 즉시 500 오류로 차단합니다.
- **거래/구독 기록 존재 시 탈퇴 차단 (409 Conflict)**: `subscriptions` 또는 `payments` 테이블에 해당 사용자 레코드가 존재하는 경우 법적/회계 기록 보존을 위해 `409` 응답으로 탈퇴를 즉시 차단합니다.
- **조회 실패 Fail-Closed**: `subscriptions` 또는 `payments` DB 조회 실패 시 레코드가 없다고 추측하지 않고 즉시 `500` 반환 후 삭제를 차단합니다.
- **부분 삭제(Partial Deletion) 방지**: 거래/구독 기록이 없는 계정에 한해 `admin.deleteUser(userId)`를 단일 원자적 동작으로 수행하며, DB FK ON DELETE CASCADE로 조합, 전략, 이용권 데이터가 한 번에 파기됩니다.
- **로컬 데이터 선택적 완전 정리**: `clearDeletedUserLocalData(deletedUserId)`를 통해 탈퇴 성공 시에만 해당 `userId` 소유의 Active/Isolated 데이터 및 Ownership 메타데이터를 삭제하며, 타 계정 및 Guest 데이터는 100% 보존합니다.

---

## 1. QA 시나리오 (A ~ H) 검증 결과

| 시나리오 ID | 테스트 항목 및 내용 | 검증 결과 | 상세 설명 |
| :--- | :--- | :---: | :--- |
| **Test A** | Supabase URL 환경변수 없음 | **PASS** | 500 에러 반환 (`"서버 환경 설정 오류..."`). Cloud/Local/Auth 데이터 변경 없음. |
| **Test B** | Service Role Key 없음 | **PASS** | 500 에러 반환. Cloud/Local/Auth 데이터 변경 없음. |
| **Test C** | `subscriptions` 레코드 존재 | **PASS** | 409 Conflict 반환 (`"구독 또는 결제 기록이 있는 계정은..."`). Auth 및 데이터 100% 보존. |
| **Test D** | `payments` 레코드 존재 | **PASS** | 409 Conflict 반환. Auth 및 모든 데이터 100% 보존. |
| **Test E** | 두 테이블 DB 조회 오류 시 | **PASS** | 500 에러 반환. `deleteUser` 실행 금지 및 데이터 100% 보존. |
| **Test F** | 거래/구독 기록 모두 없음 (정상) | **PASS** | `deleteUser` 성공 $\rightarrow$ DB Cascade 자동 파기 $\rightarrow$ API 200 $\rightarrow$ 로컬 정리 $\rightarrow$ 세션 종료. |
| **Test G** | 타 계정 Isolated 데이터 보존 | **PASS** | 동일 브라우저 내 타 계정 소유 `isolated-combinations` 항목 및 Guest 데이터 100% 보존됨. |
| **Test H** | Billing `under_review` 정상 탈퇴 | **PASS** | 거래 레코드가 없는 일반 계정의 경우 결제 차단 오류 없이 정상 탈퇴 완료. |

---

## 2. 주요 보완 명세

### 2-1. URL & Service Role Fail-Closed
- `createAdminSupabaseClient()`에서 `NEXT_PUBLIC_SUPABASE_URL` 또는 `SUPABASE_SERVICE_ROLE_KEY` 미존재 시 `null`을 반환하여 admin client 생성을 원천 차단.
- 콘솔에는 Secret 값 없이 에러 원인만 출력하며, 클라이언트에는 표준 500 한국어 안내 메시지만 전달.

### 2-2. 거래 레코드 파기 방지 Guard (409 Conflict)
- `subscriptions` 및 `payments` 테이블 레코드 존재 여부를 Service Role로 1차 조회.
- 하나라도 존재 시 계정 및 Cloud 데이터 파기, 로컬 Cleanup, 로그아웃을 모두 차단하고 409 에러 반환.

### 2-3. 원자적 파기 (Atomic Cascade Deletion)
- 거래 기록이 없는 계정에 한해 `admin.deleteUser(userId)`를 단일 트랜잭션/원자적 동작으로 실행.
- PostgreSQL FK `ON DELETE CASCADE`에 의해 `saved_combinations`, `saved_custom_strategies`, `user_entitlements`가 동시 파기됨.

---

## 3. 빌드 및 회귀 검증

1. `npm run build`: PASS (`Compiled successfully` / 23 static/dynamic pages generation)
2. `npm run lotto:check`: PASS (`status: WAITING`, `exitCode: 0`)
3. `npm run lotto:regression`: PASS (`9/9 PASS`, `exitCode: 0`)
4. `npm run lotto:validate`: PASS (`로컬 데이터 무결성 100% 검증 통과`, `exitCode: 0`)
5. `npx eslint`: PASS (`0 errors`)
6. `git diff -- src/data/lotto-draws.json`: 출력 없음 (프로덕션 데이터 100% 보존)
