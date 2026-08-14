import { getLatestDraw } from "./draw-data";

export interface NextDrawInfo {
  drawNo: number; // 다음 대상 회차 (예: 1237)
  drawDate: string; // 다음 추첨일 "YYYY-MM-DD" (예: "2026-08-15")
  formattedDate: string; // "YYYY.MM.DD" (예: "2026.08.15")
  dDayText: string; // "D-3", "오늘 추첨", "결과 대기"
}

/**
 * YYYY-MM-DD 포맷에 N일을 더하는 날짜 유틸리티
 */
export function addDaysToDate(dateString: string, days: number): string {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  d.setDate(d.getDate() + days);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 다음 대상 추첨 회차 및 추첨일 정보 산출 함수
 */
export function getNextDrawInfo(nowDate?: Date): NextDrawInfo {
  const latestDraw = getLatestDraw();

  if (!latestDraw) {
    return {
      drawNo: 1,
      drawDate: "2002-12-07",
      formattedDate: "2002.12.07",
      dDayText: "추첨 예정",
    };
  }

  const nextDrawNo = latestDraw.drawNo + 1;
  const nextDrawDate = addDaysToDate(latestDraw.drawDate, 7);
  const formattedDate = nextDrawDate.replace(/-/g, ".");

  // D-Day 계산
  const today = nowDate ? new Date(nowDate) : new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(nextDrawDate);
  targetDate.setHours(0, 0, 0, 0);

  const diffMs = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  let dDayText = "";
  if (diffDays === 0) {
    dDayText = "오늘 추첨";
  } else if (diffDays > 0) {
    dDayText = `D-${diffDays}`;
  } else {
    dDayText = "결과 대기";
  }

  return {
    drawNo: nextDrawNo,
    drawDate: nextDrawDate,
    formattedDate,
    dDayText,
  };
}
