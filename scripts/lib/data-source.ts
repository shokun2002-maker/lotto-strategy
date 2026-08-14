import { LottoDraw } from "../../src/types/lotto";

export interface FetchResult {
  draw: LottoDraw | null;
  status: "success" | "not_found" | "error";
  message?: string;
}

/**
 * 타임아웃을 적용한 fetch 래퍼 함수
 */
async function fetchWithTimeout(url: string, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * 지연(delay) 유틸리티 (ms)
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 단일 회차 수집 (Retry 3회 지원)
 * 1순위: 동행복권 공식 common.do API
 * 2순위: smok95 github lotto API mirror
 */
export function normalizeDraw(raw: any, expectedDrawNo?: number): LottoDraw | null {
  if (!raw) return null;

  let drawNo = 0;
  let drawDate = "";
  let numbers: number[] = [];
  let bonus = 0;

  // 1. 동행복권 공식 API 포맷 정제
  if (raw.returnValue === "success" || raw.drwNo) {
    drawNo = Number(raw.drwNo);
    drawDate = String(raw.drwNoDate || "");
    numbers = [
      Number(raw.drwtNo1),
      Number(raw.drwtNo2),
      Number(raw.drwtNo3),
      Number(raw.drwtNo4),
      Number(raw.drwtNo5),
      Number(raw.drwtNo6),
    ];
    bonus = Number(raw.bnusNo);
  }
  // 2. smok95 mirror 포맷 정제
  else if (raw.draw_no || raw.drawNo) {
    drawNo = Number(raw.draw_no || raw.drawNo);
    drawDate = String(raw.date || raw.drawDate || "").split("T")[0];
    numbers = Array.isArray(raw.numbers) ? raw.numbers.map(Number) : [];
    bonus = Number(raw.bonus_no || raw.bonus);
  }

  // 검증: drawNo
  if (!drawNo || !Number.isInteger(drawNo) || drawNo <= 0) return null;
  if (expectedDrawNo && drawNo !== expectedDrawNo) return null;

  // 검증: drawDate 유효성 (YYYY-MM-DD)
  if (!drawDate || isNaN(Date.parse(drawDate))) return null;

  // 검증: numbers (정확히 6개, 1~45, 중복 없음, 오름차순 정렬)
  if (!Array.isArray(numbers) || numbers.length !== 6) return null;
  const numSet = new Set<number>();
  for (const n of numbers) {
    if (!Number.isInteger(n) || n < 1 || n > 45) return null;
    if (numSet.has(n)) return null;
    numSet.add(n);
  }
  const sortedNumbers = [...numbers].sort((a, b) => a - b);

  // 검증: bonus (1~45, 본번호 미포함)
  if (!Number.isInteger(bonus) || bonus < 1 || bonus > 45) return null;
  if (numSet.has(bonus)) return null;

  return {
    drawNo,
    drawDate,
    numbers: sortedNumbers,
    bonus,
  };
}

/**
 * 단일 회차 수집 실행 (공식 API 우선 + Mirror Fallback + 3회 Retry)
 */
export async function fetchDraw(
  drawNo: number,
  maxRetries = 3,
  timeoutMs = 10000
): Promise<FetchResult> {
  const officialUrl = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${drawNo}`;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetchWithTimeout(officialUrl, timeoutMs);
      if (res.ok) {
        const json = await res.json();
        if (json.returnValue === "fail") {
          return { status: "not_found", draw: null, message: `제${drawNo}회 결과가 아직 발표되지 않았습니다.` };
        }
        const normalized = normalizeDraw(json, drawNo);
        if (normalized) {
          return { status: "success", draw: normalized };
        }
      }
    } catch {
      // 재시도
    }

    if (attempt < maxRetries) {
      await delay(500 * attempt);
    }
  }

  // Fallback: Mirror 수집
  try {
    const mirrorUrl = `https://smok95.github.io/lotto/results/all.json`;
    const res = await fetchWithTimeout(mirrorUrl, timeoutMs);
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list)) {
        const targetRaw = list.find((item: any) => Number(item.draw_no) === drawNo);
        if (targetRaw) {
          const normalized = normalizeDraw(targetRaw, drawNo);
          if (normalized) {
            return { status: "success", draw: normalized };
          }
        }
      }
    }
  } catch (err: any) {
    return { status: "error", draw: null, message: `네트워크 또는 파싱 오류: ${err?.message || err}` };
  }

  return { status: "not_found", draw: null, message: `제${drawNo}회 완료 데이터 미존재` };
}
