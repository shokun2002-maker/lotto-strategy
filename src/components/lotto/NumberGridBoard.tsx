"use client";

import React from "react";
import { getBallColorStyle } from "./LottoBall";

interface NumberGridBoardProps {
  selectedNumbers: number[];
  onToggleNumber: (num: number) => void;
  maxSelectCount?: number;
}

export default function NumberGridBoard({
  selectedNumbers,
  onToggleNumber,
  maxSelectCount = 6,
}: NumberGridBoardProps) {
  const numbers = Array.from({ length: 45 }, (_, i) => i + 1);

  return (
    <div className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <span className="text-xs font-bold text-slate-500">
          1 ~ 45 번호 선택판
        </span>
        <span className="text-xs font-semibold text-slate-400">
          클릭하여 선택/해제
        </span>
      </div>

      {/* 5 columns x 9 rows responsive grid */}
      <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
        {numbers.map((num) => {
          const isSelected = selectedNumbers.includes(num);
          const colorStyles = getBallColorStyle(num);
          const isMaxReached = selectedNumbers.length >= maxSelectCount;
          const isDisabled = !isSelected && isMaxReached;

          return (
            <button
              key={num}
              type="button"
              onClick={() => onToggleNumber(num)}
              disabled={isDisabled}
              className={`
                h-11 sm:h-12 rounded-xl text-sm font-extrabold flex items-center justify-center
                transition-all duration-150 active:scale-95 cursor-pointer touch-manipulation
                ${
                  isSelected
                    ? `${colorStyles.bg} text-white ring-2 ring-blue-600 ring-offset-2 scale-[1.03] shadow-xs`
                    : "bg-slate-100/80 text-slate-700 hover:bg-slate-200/70 border border-slate-200/50"
                }
                ${isDisabled ? "opacity-35 cursor-not-allowed hover:bg-slate-100/80" : ""}
              `}
              aria-label={`로또 번호 ${num} ${isSelected ? "선택됨" : "미선택"}`}
            >
              <span>{num < 10 ? `0${num}` : num}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
