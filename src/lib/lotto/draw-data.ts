import { LottoDraw } from "@/types/lotto";
import rawDrawsData from "@/data/lotto-draws.json";

// JSON 캐시 및 오름차순 정렬 데이터
const allDraws: LottoDraw[] = (rawDrawsData as LottoDraw[]).sort(
  (a, b) => a.drawNo - b.drawNo
);

/**
 * 역대 전체 당첨 회차 조회 (1회부터 오름차순)
 */
export function getAllDraws(): LottoDraw[] {
  return allDraws;
}

/**
 * 가장 최신 추첨 회차 조회
 */
export function getLatestDraw(): LottoDraw | null {
  if (allDraws.length === 0) return null;
  return allDraws[allDraws.length - 1];
}

/**
 * 특정 회차 번호로 조회
 */
export function getDrawByNumber(drawNo: number): LottoDraw | undefined {
  return allDraws.find((d) => d.drawNo === drawNo);
}

/**
 * 가장 최근 N개 회차 조회 (최신회차가 배열 첫 번째에 위치하도록 내림차순 정렬)
 */
export function getRecentDraws(count: number): LottoDraw[] {
  if (count <= 0) return [];
  const reversed = [...allDraws].reverse();
  return reversed.slice(0, count);
}
