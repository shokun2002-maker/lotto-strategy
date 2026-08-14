import { LottoDraw } from "@/types/lotto";

export interface ValidationReport {
  isValid: boolean;
  totalDraws: number;
  firstDrawNo: number;
  latestDrawNo: number;
  latestDrawDate: string;
  missingDraws: number[];
  duplicateDraws: number[];
  errors: string[];
}

/**
 * 역대 당첨 데이터 무결성 검증 함수
 */
export function validateDrawData(draws: LottoDraw[]): ValidationReport {
  const errors: string[] = [];
  const seenDrawNos = new Set<number>();
  const duplicateDraws: number[] = [];

  if (!Array.isArray(draws) || draws.length === 0) {
    return {
      isValid: false,
      totalDraws: 0,
      firstDrawNo: 0,
      latestDrawNo: 0,
      latestDrawDate: "",
      missingDraws: [],
      duplicateDraws: [],
      errors: ["회차 데이터가 비어 있습니다."],
    };
  }

  // 회차 번호 오름차순 정렬 복사본
  const sorted = [...draws].sort((a, b) => a.drawNo - b.drawNo);

  const firstDrawNo = sorted[0].drawNo;
  const latestDrawNo = sorted[sorted.length - 1].drawNo;
  const latestDrawDate = sorted[sorted.length - 1].drawDate;

  // 1. 각 회차 필드 단위 검증
  for (let i = 0; i < sorted.length; i++) {
    const draw = sorted[i];

    // drawNo 검증
    if (typeof draw.drawNo !== "number" || draw.drawNo <= 0 || !Number.isInteger(draw.drawNo)) {
      errors.push(`[회차 ${draw.drawNo}] 잘못된 회차 번호 형식입니다.`);
    }

    // 회차 중복 검증
    if (seenDrawNos.has(draw.drawNo)) {
      duplicateDraws.push(draw.drawNo);
      errors.push(`[회차 ${draw.drawNo}] 중복된 회차가 존재합니다.`);
    }
    seenDrawNos.add(draw.drawNo);

    // numbers 검증
    if (!Array.isArray(draw.numbers) || draw.numbers.length !== 6) {
      errors.push(`[회차 ${draw.drawNo}] 당첨번호가 6개가 아닙니다. (개수: ${draw.numbers?.length})`);
    } else {
      const numSet = new Set<number>();
      for (const n of draw.numbers) {
        if (typeof n !== "number" || n < 1 || n > 45 || !Number.isInteger(n)) {
          errors.push(`[회차 ${draw.drawNo}] 번호 ${n}은(는) 1~45 범위를 벗어났습니다.`);
        }
        if (numSet.has(n)) {
          errors.push(`[회차 ${draw.drawNo}] 당첨번호에 중복된 숫자 ${n}이(가) 있습니다.`);
        }
        numSet.add(n);
      }

      // bonus 검증
      if (typeof draw.bonus !== "number" || draw.bonus < 1 || draw.bonus > 45 || !Number.isInteger(draw.bonus)) {
        errors.push(`[회차 ${draw.drawNo}] 보너스 번호 ${draw.bonus}은(는) 1~45 범위를 벗어났습니다.`);
      }
      if (numSet.has(draw.bonus)) {
        errors.push(`[회차 ${draw.drawNo}] 보너스 번호 ${draw.bonus}이(가) 본번호 6개와 중복됩니다.`);
      }
    }

    // drawDate 검증
    if (!draw.drawDate || isNaN(Date.parse(draw.drawDate))) {
      errors.push(`[회차 ${draw.drawNo}] 추첨일 날짜 ${draw.drawDate}가 유효하지 않습니다.`);
    }
  }

  // 2. 회차 연속성 및 누락 검증 (1회부터 최신회차까지)
  const missingDraws: number[] = [];
  for (let current = 1; current <= latestDrawNo; current++) {
    if (!seenDrawNos.has(current)) {
      missingDraws.push(current);
      errors.push(`[누락 회차] 제 ${current}회차가 누락되었습니다.`);
    }
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    totalDraws: draws.length,
    firstDrawNo,
    latestDrawNo,
    latestDrawDate,
    missingDraws,
    duplicateDraws,
    errors,
  };
}
