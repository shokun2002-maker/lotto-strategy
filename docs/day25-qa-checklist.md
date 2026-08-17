# Day 25 Integration QA Checklist

본 문서는 LOTTO STRATEGY 서비스의 Day 25 "실사용자 관점 전체 통합 QA 및 버그 수정" 종합 검증 항목 및 상태 기록입니다.

---

## 📋 1. Guest First 전체 흐름 (Pass / Fail / Blocked)

- [x] **PASS**: 비로그인 Guest 상태에서 홈 화면 진입 가능
- [x] **PASS**: 빠른추천 1게임 생성 및 내 번호 저장 동작
- [x] **PASS**: 함께추천 번호 선택 후 조합 생성 및 저장 동작
- [x] **PASS**: 전략추천 (균형형, 최근흐름형, 장기미출현형) 3종 정상 생성 및 저장
- [x] **PASS**: 내 번호 페이지(`/numbers`) 진입 시 저장 조합 표시
- [x] **PASS**: 브라우저 새로고침 시 LocalStorage 데이터 100% 유지
- [x] **PASS**: 주요 기능 이용 중 회원가입/로그인 강제 리다이렉트 발생 안 함 (FREE 권한 정상 동작)

---

## 📋 2. 빠른추천 (Quick Recommendation) QA

- [x] **PASS**: 번호 범위 1~45 엄격 유지
- [x] **PASS**: 정확히 6개 번호 생성 및 중복 없음
- [x] **PASS**: 오름차순 정렬 반환
- [x] **PASS**: 번호 조합 분석 카드 (홀짝, 저고, 합계, 연속번호, 구간분포) 정상 출력
- [x] **PASS**: 연속 '새 번호 만들기' 실행 시 예외/오류 없음
- [x] **PASS**: '제1238회 내 번호에 저장' 클릭 시 `/numbers`에 정상 동기화 및 중복 방지 동작

---

## 📋 3. 함께추천 (Together Recommendation) QA

- [x] **PASS**: 사용자 직접 선택 번호(1~6개)가 최종 6개 결과에 반드시 포함
- [x] **PASS**: 6개 초과 선택 불가 (최대 6개 방어 및 비활성화)
- [x] **PASS**: '선택 초기화' 버튼 클릭 시 선택 상태 및 생성 결과 깔끔히 초기화
- [x] **PASS**: 최종 결과 6개 오름차순 정렬 및 'MY' / '추천' 배지 정상 구분
- [x] **PASS**: 저장 버튼 클릭 시 `userPickedNumbers` 및 `recommendedNumbers` 구분 저장

---

## 📋 4. 전략 3종 추천 (Balanced, Recent Trend, Long Absence) QA

- [x] **PASS**: 균형형(Balanced) 생성 성공 및 `strategyId="balanced"` 유지
- [x] **PASS**: 최근흐름형(Recent Trend) 생성 성공 및 제1237회까지의 최근 30회 통계 반영
- [x] **PASS**: 장기미출현형(Long Absence) 생성 성공 및 미출현 기간 상위 번호 반영
- [x] **PASS**: 전략별 전용 배지 정상 표시 (내 번호 목록 및 분석 카드)
- [x] **PASS**: 다음 대상 회차(제1238회) 및 D-Day 정상 표시

---

## 📋 5. 커스텀 전략 (Custom Strategy) QA

- [x] **PASS**: 고정수(포함수), 제외수, 합계범위, 홀짝, 저고, 구간분산 옵션 설정 가능
- [x] **PASS**: 커스텀 전략 신규 저장, 이름 중복 방지, 전략 수정 및 삭제 정상
- [x] **PASS**: 전략 실행 시 `usageCount` 및 `lastUsedAt` 정상 갱신
- [x] **PASS**: **FREE 회원 권한 제어**: 커스텀 전략 저장 최대 1개 제한 정상 동작
- [x] **PASS**: **PRO 회원 권한 제어**: 다중 커스텀 전략 저장 허용
- [x] **PASS**: 기존 저장 데이터 자동 삭제 없음 (안전 유지)

---

## 📋 6. 내 번호 (My Numbers) QA

- [x] **PASS**: 최신 저장순 (createdAt 내림차순) 및 회차별 그룹핑 표시
- [x] **PASS**: 출처 배지 (`quick`, `together`, `strategy`, `manual`) 및 전략 배지 정상 표시
- [x] **PASS**: 조합 개별 삭제 및 '전체 삭제' 정상 동작
- [x] **PASS**: 브라우저 새로고침 후 LocalStorage 보존
- [x] **PASS**: **제1237회 (완료 회차) 당첨 대조**: 실제 당첨번호 대조, 일치 번호 하이라이트, 등수(1등~5등/낙첨) 및 일치 수 정확히 표시
- [x] **PASS**: **제1238회 (진행 예정 회차)**: "결과 대기" / "추첨 전" 상태 정상 표시

---

## 📋 7. 회원가입 및 이메일 로그인 (Email Auth) QA

- [x] **PASS**: 이메일 회원가입 및 이메일 로그인 정상
- [x] **PASS**: 잘못된 비밀번호 / 유효하지 않은 이메일 입력 시 한국어 오류 메시지 정상 출력
- [x] **PASS**: 새로고침 시 Supabase 세션 유지
- [x] **PASS**: 로그아웃 시 세션 정리 및 메인 화면 이동

---

## 📋 8. 카카오 OAuth (Kakao Login) QA

- [x] **PASS**: 카카오 로그인 버튼 클릭 시 OAuth 인증 페이지 정상 이동
- [x] **PASS**: 카카오 동의 후 콜백(`/auth/callback`) 처리 및 `/my` 정상 리다이렉트
- [x] **PASS**: `/my` 페이지에서 카카오 프로필 닉네임 및 "Kakao" 인증 배지 표시
- [x] **PASS**: 이메일 미제공 카카오 계정 로그인 시 안전 처리 (OAuth provider metadata 활용)
- [x] **PASS**: Client Secret / REST API Key 등 민감정보 클라이언트 코드 노출 0건

---

## 📋 9. 클라우드 동기화 (Cloud Sync) QA

- [x] **PASS**: Guest 상태에서 번호 저장 후 로그인 시, LocalStorage 데이터가 Supabase DB로 자동 동기화 (`upsert`)
- [x] **PASS**: 로그인 상태에서 신규 번호 저장 시 DB 및 LocalStorage 양쪽 즉시 반영
- [x] **PASS**: 로그아웃 시 LocalStorage 데이터 100% 보존
- [x] **PASS**: 동일 조합 중복 병합 (Merge) 정책 정상 작동
- [x] **PASS**: 오프라인/네트워크 실패 시 LocalStorage 우선 작동하여 데이터 유실 없음

---

## 📋 10. FREE / PRO 권한 및 RLS 보안 (Feature Gate & RLS) QA

- [x] **PASS**: Guest / Auth 레코드 없음 / plan="free" $\rightarrow$ **FREE** 요금제 판정
- [x] **PASS**: plan="pro" $\rightarrow$ **PRO** 요금제 판정
- [x] **PASS**: **FREE 제한**: 추천 3/5게임 생성 제한, 커스텀 전략 1개 제한
- [x] **PASS**: **PRO 권한**: 3/5게임 생성 해제, 다중 커스텀 전략 저장 허용
- [x] **PASS**: **RLS 보안**: 브라우저 콘솔에서 `user_entitlements` 직접 UPDATE 시도 시 RLS 차단 (Permission Denied)

---

## 📋 11. 마이페이지 (/my) QA

- [x] **PASS**: 사용자 프로필 (이메일/닉네임), 인증 방식 배지, FREE/PRO 요금제 배지 표시
- [x] **PASS**: Cloud Sync 연결 상태 및 동기화 버튼 정상
- [x] **PASS**: 저장 조합 수, 저장 전략 수, 총 사용 횟수 요약 통계 정확
- [x] **PASS**: 로그아웃 기능 정상 작동
- [x] **PASS**: 모바일 폭(360px~430px)에서 카드 깨짐 없음

---

## 📋 12. 정책 페이지 및 컴플라이언스 QA

- [x] **PASS**: `/terms`, `/privacy`, `/refund-policy`, `/service-info`, `/disclaimer` 5개 라우트 정상 접근
- [x] **PASS**: 하단 Footer 통합 링크 정상 작동
- [x] **PASS**: 당첨 보장 표현, 과장 광고, 영구 보장 문구 없음
- [x] **PASS**: 미확정 결제 가격/환불에 대한 법적 면책 문구 적절히 배치

---

## 📋 13. SEO, robots.txt, sitemap.xml & UX Boundaries QA

- [x] **PASS**: `/robots.txt` 정상 응답 및 크롤러 수집 제어 설정 확인
- [x] **PASS**: `/sitemap.xml` Production 도메인 (`https://lotto-strategy.vercel.app`) 기본 바인딩 확인 (`localhost` 노출 방지)
- [x] **PASS**: 404 Custom Not-Found 페이지 (`src/app/not-found.tsx`) 정상 작동
- [x] **PASS**: Client Error Boundary (`src/app/error.tsx`) 및 Loading UI (`src/app/loading.tsx`) 정상 작동

---

## 📋 14. 모바일 UX 및 반응형 레이아웃 QA

- [x] **PASS**: 360px (작은 모바일): 가로 스크롤 없음, LottoBall 6개 찌그러짐 없음
- [x] **PASS**: 390px (표준 모바일): 하단 네비게이션 가림 없음, 터치 영역 충분
- [x] **PASS**: 430px (대형 모바일): 카드 패딩 및 폰트 레이아웃 안정적
- [x] **PASS**: Modal 팝업 가독성 및 닫기 동작 정상

---

## 📋 15. 브라우저 및 런타임 콘솔 (Browser & Console) QA

- [x] **PASS**: Chrome Desktop / Chrome Mobile Responsive 테스트 통과
- [x] **PASS**: Safari / WebKit CSS 호환성 (flex/grid, gap, border-radius) 확인
- [x] **PASS**: Uncaught Exception, React Hydration Error 0건
- [x] **PASS**: React Unique `key` Warning 0건
- [x] **PASS**: 민감정보(Secret Key, Service Role Key) 콘솔/네트워크 로그 노출 0건

---

## 📋 16. 성능 및 데이터 파이프라인 (Performance & Data Pipeline) QA

- [x] **PASS**: 불필요한 무한 리렌더링 및 중복 JSON 파싱 없음
- [x] **PASS**: `npm run lotto:check` 실행결과 PASS (`status: WAITING`, `exitCode: 0`)
- [x] **PASS**: `npm run lotto:regression` 실행결과 PASS (`9/9 PASS`, `exitCode: 0`)
- [x] **PASS**: `npm run lotto:validate` 실행결과 PASS (`무결성 100% 검증 통과`, `exitCode: 0`)
- [x] **PASS**: `BILLING_AVAILABILITY = "under_review"` 정합성 유지 (실결제 버튼 및 PG SDK 미출력)
