# LOTTO STRATEGY PG 심사 제출용 서비스 명세서 (Payment Provider Review Document)

본 문서는 결제대행사(PG사: 토스페이먼츠, 카카오페이, 네이버페이 등) 가맹 심사 제출용 서비스 구조 설명서입니다.

---

## 1. 서비스 개요
- **서비스명**: LOTTO STRATEGY (로또전략)
- **서비스 형태**: 모바일 퍼스트 웹 서비스 (Next.js App Router 기반)
- **서비스 목적**: 동행복권 로또 6/45 공개 과거 당첨 데이터를 바탕으로 통계 시각화, 번호 조합 생성, 개인 설정형 필터 전략 및 과거회차 시뮬레이션 기능 제공
- **운영 주체**: 글로컬소프트 (GlocalSoft)

---

## 2. 제공 서비스 범위 (핵심 기능)
1. **빠른추천 / 함께추천**: 기본 통계 알고리즘 및 선호 번호 기반 번호 조합 생성
2. **분석 전략 (6종)**: 균형형, 최근흐름형, 장기미출현형, 고정수/제외수 필터링
3. **나만의 커스텀 전략**: 6가지 가중치 파라미터를 조합하여 본인만의 필터 저장
4. **Cloud Sync**: LocalStorage ↔ Supabase Cloud 데이터 상호 동기화
5. **과거 시뮬레이션 백테스트**: 역대 1,236개 회차 데이터 기반 통계 검증

---

## 3. 서비스가 하지 않는 것 (명확한 불포함 범위)
- ❌ **복권 판매 안 함**: 실물 또는 전자 복권을 판매하지 않음
- ❌ **복권 구매대행 안 함**: 수수료 수취 및 복권 대리 구매 서비스를 제공하지 않음
- ❌ **당첨금 지급 안 함**: 상금 분배나 환급을 처리하지 않음
- ❌ **미래 당첨번호 예측/당첨 보장 안 함**: 무작위 확률 추첨의 특성을 밝히며 당첨 확률 증가나 수익을 절대 보장하지 않음

---

## 4. 유료 서비스 모델 및 상품 구조 (예정)
- **권한 체계**: FREE / PRO 요금제 구분
- **유료 상품 유형 (예정)**:
  1. `pro_monthly_sub`: 월간 자동갱신 정기구독 (PRO 멤버십)
  2. `pro-[N]day_pass`: 7일 / 30일 기간제 이용권 (Access Pass)
- **현재 가용성 상태**: `BILLING_AVAILABILITY = "under_review"` (PG 승인 전 모든 결제 기능 비활성화 및 `active = false` 상태 유지)

---

## 5. 결제 및 보안 아키텍처
- **Server Verification 필수**: 결제 UI 성공 여부와 상관없이 PG Server-to-Server 검증 후에만 권한 부여
- **Price Lock**: DB 정찰가 금액으로 서버에서 주문 검증 (클라이언트 가격 변조 차단)
- **RLS 보안**: 브라우저 클라이언트를 통한 결제/구독 상태 조작 시도 원천 차단 (`REVOKE ALL` & `GRANT SELECT`)

---

## 6. 정책 페이지 URL 목록
- 서비스 소개: `https://lotto-strategy.domain/service-info`
- 이용약관: `https://lotto-strategy.domain/terms`
- 개인정보처리방침: `https://lotto-strategy.domain/privacy`
- 환불/해지 정책: `https://lotto-strategy.domain/refund-policy`
- 면책고지: `https://lotto-strategy.domain/disclaimer`

---

## 7. PG사 사전 문의 항목
1. 본 서비스와 같은 로또 과거 통계 분석 및 조합 소프트웨어가 귀사의 가맹 제한 업종에 해당하는지 여부
2. 정기구독(Billing Key) 및 기간제 단건결제 승인 제출 시 필요한 추가 서류 명세
