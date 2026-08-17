import { LottoDraw } from "@/types/lotto";
import rawDrawsData from "@/data/lotto-draws.json";

// JSON 캐시 및 오름차순 정렬 데이터
const allDraws: LottoDraw[] = (rawDrawsData as LottoDraw[]).sort(
  (a, b) => a.drawNo - b.drawNo
);

/**
 * 역대 전체 당첨 회차 조회 (1회부터 오름차순)
 */
export function getAllDraws(drawsContext?: LottoDraw[]): LottoDraw[] {
  if (drawsContext) {
    return [...drawsContext].sort((a, b) => a.drawNo - b.drawNo);
  }
  return allDraws;
}

/**
 * 가장 최신 추첨 회차 조회
 */
export function getLatestDraw(drawsContext?: LottoDraw[]): LottoDraw | null {
  const target = getAllDraws(drawsContext);
  if (target.length === 0) return null;
  return target[target.length - 1];
}

/**
 * 특정 회차 번호로 조회
 */
export function getDrawByNumber(
  drawNo: number,
  drawsContext?: LottoDraw[]
): LottoDraw | undefined {
  const target = getAllDraws(drawsContext);
  return target.find((d) => d.drawNo === drawNo);
}

/**
 * 가장 최근 N개 회차 조회 (최신회차가 배열 첫 번째에 위치하도록 내림차순 정렬)
 */
export function getRecentDraws(
  count: number,
  drawsContext?: LottoDraw[]
): LottoDraw[] {
  if (count <= 0) return [];
  const target = getAllDraws(drawsContext);
  const reversed = [...target].reverse();
  return reversed.slice(0, count);
}
