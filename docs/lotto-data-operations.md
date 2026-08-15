# Weekly Lotto Data Operations Guide & Checklist

본 문서는 LOTTO STRATEGY 서비스의 매주 주간 로또 당첨 데이터 수집, 검증, 파일 원자적 교체 및 상용 반영 가이드라인입니다.

---

## 📅 주간 운영 일정 (Weekly Schedule)
- **추첨 시각**: 매주 토요일 오후 8시 35분경 (SBS 방송)
- **공식 데이터 발표**: 매주 토요일 오후 8시 45분 ~ 9시 00분 사이
- **데이터 갱신 권장 시각**: 매주 토요일 오후 9시 00분 이후

---

## 📋 11단계 주간 운영 체크리스트 (Weekly Operations Checklist)

- [ ] **1. 추첨 완료 확인**: 동행복권 공식 포털 또는 방송을 통해 당첨 결과 발표 확인
- [ ] **2. 사전 사전검증 모드 (Dry-Run) 실행**:
  ```bash
  npm run lotto:update:dry
  ```
  - `Status: not_available_yet`인 경우: 원격 API 미반영 상태이므로 10분 후 재시도
  - `Status: updated`인 경우: 수집 회차 및 당첨번호 일치 여부 확인
- [ ] **3. 데이터 무결성 1차 검증**:
  ```bash
  npm run lotto:validate
  ```
- [ ] **4. 실제 업데이트 실행**:
  ```bash
  npm run lotto:update
  ```
- [ ] **5. JSON 파일 변경사항 (git diff) 점검**:
  ```bash
  git diff src/data/lotto-draws.json
  ```
  - 이전 1회 ~ 기존 최신 회차 데이터는 절대 수정되지 않았는지 확인
  - 신규 회차 1건만 정확히 오름차순으로 추가되었는지 확인
- [ ] **6. 프로덕션 빌드 검증**:
  ```bash
  npm run build
  ```
- [ ] **7. Git 커밋 및 푸시**:
  ```bash
  git add README.md src/data/lotto-draws.json
  git commit -m "data: update lotto draw XXXX"
  git push
  ```
- [ ] **8. Vercel Production 자동 배포 상태 확인**: Vercel Dashboard Build Log 0 Error 확인
- [ ] **9. 상용 웹 사이트 스모크 테스트**:
  - 최신 완료 회차가 신규 회차로 업데이트되었는지 확인
  - 다음 대상 회차(`drawNo + 1`) 및 D-Day 카운트다운 정상 표기 확인
- [ ] **10. 저장 번호 결과 판정 회귀 확인**: `/numbers` 페이지에서 신규 회차 대상 저장 조합 당첨 등수 자동 판정 확인
- [ ] **11. 전략 통계 및 백테스트 회귀 확인**: 최근흐름형/장기미출현형 통계에 신규 회차가 반영되었는지 확인

---

## 🛠️ 안전 수칙 및 예외 대응 (Fail-Safe & Disaster Recovery)

### 1. 원격 API 미공개 시 (`not_available_yet`)
- 오류로 취급하지 않으며, 파일 및 Git 변경 없이 0으로 정상 종료됩니다.
- 결과 발표 지연 시 10분~15분 간격으로 `npm run lotto:update:dry`를 재실행합니다.

### 2. 네트워크 및 수집 오류 발생 시 (`network_error`)
- 안전을 위해 기존 `src/data/lotto-draws.json` 파일은 100% 보존됩니다.
- 임시 파일(`src/data/lotto-draws.tmp.json`)은 자동으로 안전하게 삭제 처리됩니다.

### 3. 이전 회차 복구 (Rollback)
- 만약 잘못된 커밋이 발생한 경우 Git restore로 복구합니다:
  ```bash
  git checkout HEAD~1 -- src/data/lotto-draws.json
  ```

---

## 🤖 향후 자동화 (Vercel Cron / GitHub Actions) 준비
- 업데이트 핵심 로직은 `scripts/lib/update-pipeline.ts`의 `runUpdatePipeline()` 함수로 완전 분리되어 있어, CLI 인가 없이도 Vercel Cron Route Handler 또는 GitHub Actions workflow에서 즉시 호출 가능합니다.
