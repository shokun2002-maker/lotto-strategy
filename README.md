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
