# LOTTO STRATEGY

데이터 분석과 나만의 맞춤 전략으로 로또 번호를 조합하고 관리하는 모바일 퍼스트 스마트 웹 서비스 MVP입니다.

## 📊 역대 당첨 데이터 명세 (Day 6)

- **데이터 출처**: 대한민국 동행복권 (공식 6/45 로또 당첨 결과 파이프라인 수집 데이터)
- **데이터 기준 회차**: **제1회 (2002-12-07)** ~ **제1236회 (2026-08-08)**
- **총 회차 수**: **1,236개** 전체 회차 결손/중복 없음
- **마지막 업데이트 날짜**: 2026년 8월 15일
- **데이터 저장 파일**: `src/data/lotto-draws.json`

### 🔄 데이터 업데이트 방법
새로운 회차 추첨이 완료되면 아래 명령을 통해 최신 회차 데이터를 추가 또는 업데이트할 수 있습니다:

```bash
npx tsx -e '
async function updateDraws() {
  const res = await fetch("https://smok95.github.io/lotto/results/all.json");
  const raw = await res.json();
  const formatted = raw.map(i => ({
    drawNo: Number(i.draw_no),
    drawDate: i.date.split("T")[0],
    numbers: [...i.numbers].sort((a,b)=>a-b),
    bonus: Number(i.bonus_no)
  })).sort((a,b)=>a.drawNo-b.drawNo);
  require("fs").writeFileSync("src/data/lotto-draws.json", JSON.stringify(formatted, null, 2));
  console.log("Updated to latest draw:", formatted[formatted.length-1].drawNo);
}
updateDraws();
'
```

### 🧪 데이터 및 통계 검증 실행
```bash
npx tsx -e '
import { getAllDraws } from "./src/lib/lotto/draw-data";
import { validateDrawData } from "./src/lib/lotto/data-validator";
import { calculateAllNumberStatistics } from "./src/lib/lotto/statistics";

const draws = getAllDraws();
console.log(validateDrawData(draws));
console.log(calculateAllNumberStatistics().length, "numbers statistics validated!");
'
```

## 🚀 Getting Started

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드 검증
npm run build
```
