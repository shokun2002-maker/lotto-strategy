import { NumberStatistics } from "@/types/lotto";
import { getAllDraws, getLatestDraw, getRecentDraws } from "./draw-data";

/**
 * 1~45 번호 전체에 대한 통계 계산 함수
 */
export function calculateAllNumberStatistics(): NumberStatistics[] {
  const allDraws = getAllDraws();
  const latestDraw = getLatestDraw();
  const latestDrawNo = latestDraw ? latestDraw.drawNo : 0;

  const recent10Draws = getRecentDraws(10);
  const recent30Draws = getRecentDraws(30);
  const recent50Draws = getRecentDraws(50);
  const recent100Draws = getRecentDraws(100);

  // 1~45 번호별 통계 초기화
  const statsMap: Map<number, NumberStatistics> = new Map();
  for (let i = 1; i <= 45; i++) {
    statsMap.set(i, {
      number: i,
      totalAppearances: 0,
      recent10: 0,
      recent30: 0,
      recent50: 0,
      recent100: 0,
      lastAppearanceDraw: null,
      drawsSinceLastAppearance: 0,
    });
  }

  // 1. 전체 회차 스캔 (역대 총 출현 및 마지막 출현 회차 기록)
  for (const draw of allDraws) {
    for (const num of draw.numbers) {
      const stat = statsMap.get(num);
      if (stat) {
        stat.totalAppearances++;
        if (stat.lastAppearanceDraw === null || draw.drawNo > stat.lastAppearanceDraw) {
          stat.lastAppearanceDraw = draw.drawNo;
        }
      }
    }
  }

  // 2. 최근 10/30/50/100회 구간 스캔
  const countOccurrences = (drawsWindow: typeof allDraws, fieldKey: "recent10" | "recent30" | "recent50" | "recent100") => {
    for (const draw of drawsWindow) {
      for (const num of draw.numbers) {
        const stat = statsMap.get(num);
        if (stat) {
          stat[fieldKey]++;
        }
      }
    }
  };

  countOccurrences(recent10Draws, "recent10");
  countOccurrences(recent30Draws, "recent30");
  countOccurrences(recent50Draws, "recent50");
  countOccurrences(recent100Draws, "recent100");

  // 3. 미출현 회차 수 계산
  for (let i = 1; i <= 45; i++) {
    const stat = statsMap.get(i)!;
    if (stat.lastAppearanceDraw !== null) {
      stat.drawsSinceLastAppearance = latestDrawNo - stat.lastAppearanceDraw;
    } else {
      stat.drawsSinceLastAppearance = latestDrawNo;
    }
  }

  return Array.from(statsMap.values()).sort((a, b) => a.number - b.number);
}

// 싱글톤 캐시
let cachedStats: NumberStatistics[] | null = null;

export function getAllNumberStatistics(): NumberStatistics[] {
  if (!cachedStats) {
    cachedStats = calculateAllNumberStatistics();
  }
  return cachedStats;
}

/**
 * 특정 번호의 통계 정보 조회
 */
export function getNumberStatistics(num: number): NumberStatistics | undefined {
  const stats = getAllNumberStatistics();
  return stats.find((s) => s.number === num);
}

/**
 * 특정 구간(전체/10/30/50/100회)에서 가장 자주 출현한 번호 상위 N개 조회
 */
export function getMostFrequentNumbers(
  windowSize: 10 | 30 | 50 | 100 | "all" = "all",
  topCount = 6
): NumberStatistics[] {
  const stats = [...getAllNumberStatistics()];

  const sortKey = {
    10: "recent10" as const,
    30: "recent30" as const,
    50: "recent50" as const,
    100: "recent100" as const,
    all: "totalAppearances" as const,
  }[windowSize];

  return stats
    .sort((a, b) => b[sortKey] - a[sortKey] || a.number - b.number)
    .slice(0, topCount);
}

/**
 * 가장 오래 동안 출현하지 않은 (미출현 회차 수 상위) 번호 N개 조회
 */
export function getLongestAbsentNumbers(topCount = 6): NumberStatistics[] {
  const stats = [...getAllNumberStatistics()];
  return stats
    .sort((a, b) => b.drawsSinceLastAppearance - a.drawsSinceLastAppearance || a.number - b.number)
    .slice(0, topCount);
}
