import {
  SavedLottoCombination,
  LottoDraw,
  LottoMatchResult,
} from "@/types/lotto";
import { getDrawByNumber } from "./draw-data";
import { matchLottoCombination } from "./matcher";

export type SavedCombinationDrawStatus =
  | "unspecified" // targetDrawNo 없음 (legacy)
  | "waiting"     // targetDrawNo는 있지만 실제 LottoDraw 미확보 (추첨 전/결과 대기)
  | "completed";  // 실제 LottoDraw 존재 (추첨 완료/결과 대조 완료)

export interface SavedCombinationResult {
  status: SavedCombinationDrawStatus;
  targetDrawNo?: number;
  draw?: LottoDraw;
  match?: LottoMatchResult;
}

/**
 * 저장된 번호 조합의 회차 결과 상태 및 당첨 대조 결과를 파생 계산하는 함수 (derived computation)
 */
export function getSavedCombinationResult(
  combination: SavedLottoCombination
): SavedCombinationResult {
  if (!combination.targetDrawNo || typeof combination.targetDrawNo !== "number") {
    return {
      status: "unspecified",
    };
  }

  const drawNo = combination.targetDrawNo;
  const actualDraw = getDrawByNumber(drawNo);

  if (!actualDraw) {
    return {
      status: "waiting",
      targetDrawNo: drawNo,
    };
  }

  const match = matchLottoCombination(combination.numbers, actualDraw);

  return {
    status: "completed",
    targetDrawNo: drawNo,
    draw: actualDraw,
    match,
  };
}
