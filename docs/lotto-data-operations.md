# Weekly Lotto Data Operations Guide & Checklist

본 문서는 LOTTO STRATEGY 서비스의 매주 주간 로또 당첨 데이터 점검, 검증, 수집, 회귀 테스트 및 상용 반영 가이드라인입니다.

---

## 📅 주간 운영 일정 (Weekly Schedule)
- **추첨 시각**: 매주 토요일 오후 8시 35분경 (SBS 방송)
- **공식 데이터 발표**: 매주 토요일 오후 8시 45분 ~ 9시 00분 사이
- **데이터 갱신 권장 시각**: 매주 토요일 오후 9시 00분 이후

---

## 📋 11단계 주간 권장 운영 흐름 (Weekly Operations Workflow)

- [ ] **1. 주간 운영 상태 점검**:
  ```bash
  npm run lotto:check
  ```
  - 읽기 전용으로 현재 로컬 상태, 원격 상태, 데이터셋 무결성, 회귀 검증을 종합 점검합니다.
  - `src/data/lotto-draws.json` 파일은 절대 수정되지 않습니다.

- [ ] **2. UPDATE_AVAILABLE 확인**:
  - `lotto:check` 결과가 `UPDATE_AVAILABLE` 상태인지 확인합니다.
  - `WAITING`인 경우 공식 데이터 발표 전이므로 지연 후 재점검합니다.

- [ ] **3. 업데이트 드라이런 (Dry-Run)**:
  ```bash
  npm run lotto:update:dry
  ```
  - 파일 수정 없이 수집 예정 데이터 항목을 가상 출력합니다.

- [ ] **4. 공식 결과 육안 확인**:
  - 드라이런 출력 결과(회차 번호, 추첨일, 당첨번호 6개, 보너스 번호)를 동행복권 공식 결과와 육안으로 비교합니다.

- [ ] **5. 실제 업데이트 실행**:
  ```bash
  npm run lotto:update
  ```
  - 원자적(Atomic) 파일 교체로 `src/data/lotto-draws.json`을 안전하게 갱신합니다.

- [ ] **6. 업데이트 후 회귀 테스트 실행**:
  ```bash
  npm run lotto:regression
  ```
  - 8가지 핵심 기능(최신회차 전환, 다음회차 계산, 당첨대조, 저장조합 등수판정, 최근흐름/장기미출현 통계 등)이 모두 PASS(9/9)인지 검증합니다.

- [ ] **7. 프로덕션 빌드 검증**:
  ```bash
  npm run build
  ```

- [ ] **8. Git Diff 점검**:
  ```bash
  git diff src/data/lotto-draws.json
  ```
  - 기존 1회~이전 최신회차 데이터 수정 없이, 오름차순으로 신규 회차 1건만 정확히 추가되었는지 점검합니다.

- [ ] **9. 사람 승인 (Human Operator Approval)**:
  - 검증 결과를 운영자가 최종 확인하고 승인합니다.

- [ ] **10. Git 커밋 및 푸시**:
  ```bash
  git add README.md src/data/lotto-draws.json
  git commit -m "data: update lotto draw XXXX"
  git push
  ```

- [ ] **11. Vercel Production 자동 배포 확인**:
  - Vercel Dashboard Build Log 0 Error 및 상용 웹 사이트 스모크 테스트를 진행합니다.

---

## 🛠️ 운영 상태 분류 및 대응 지침

- **`WAITING`**: 원격 미발표 상태 (`exitCode 0`). 10분~15분 대기 후 `npm run lotto:check` 재실행.
- **`UPDATE_AVAILABLE`**: 신규 회차 확인 및 검증 통과 (`exitCode 0`). 주간 업데이트 진행.
- **`LOCAL_INVALID`**: 로컬 데이터셋 무결성 오류 (`exitCode 1`). `git checkout`으로 파일 복구.
- **`REMOTE_INVALID`**: 원격 데이터 검증 실패 또는 미래 날짜 (`exitCode 1`). 동행복권 공식 포털 직접 확인.
- **`NETWORK_ERROR`**: 네트워크 연결 실패 (`exitCode 2`). 네트워크 연결 확인 후 재시도.
- **`UP_TO_DATE`**: 로컬 데이터셋이 이미 최신 상태 (`exitCode 0`). 추가 조치 불필요.

---

## 🤖 GitHub Actions 준비
- `.github/workflows/check-lotto-data.yml`을 통해 주기적으로 `npm run lotto:check`를 자동 실행하여 주간 상태를 모니터링할 수 있습니다.
- 자동 커밋 및 자동 배포는 실행되지 않으며, 점검 및 보고만 수행합니다.
