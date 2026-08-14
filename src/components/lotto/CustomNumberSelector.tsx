"use client";

import React, { useState } from "react";
import { getBallColorStyle } from "./LottoBall";
import { Pin, Ban } from "lucide-react";

interface CustomNumberSelectorProps {
  fixedNumbers: number[];
  excludedNumbers: number[];
  onChangeFixed: (nums: number[]) => void;
  onChangeExcluded: (nums: number[]) => void;
}

export default function CustomNumberSelector({
  fixedNumbers,
  excludedNumbers,
  onChangeFixed,
  onChangeExcluded,
}: CustomNumberSelectorProps) {
  const [activeTab, setActiveTab] = useState<"fixed" | "excluded">("fixed");
  const numbers = Array.from({ length: 45 }, (_, i) => i + 1);

  const handleToggle = (num: number) => {
    if (activeTab === "fixed") {
      if (fixedNumbers.includes(num)) {
        onChangeFixed(fixedNumbers.filter((n) => n !== num));
      } else {
        if (fixedNumbers.length >= 3) return;
        onChangeFixed([...fixedNumbers, num].sort((a, b) => a - b));
      }
    } else {
      if (excludedNumbers.includes(num)) {
        onChangeExcluded(excludedNumbers.filter((n) => n !== num));
      } else {
        if (excludedNumbers.length >= 5) return;
        onChangeExcluded([...excludedNumbers, num].sort((a, b) => a - b));
      }
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
      {/* Selection Mode Tabs (고정수 vs 제외수) */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100/80 border border-slate-200/60">
        <button
          type="button"
          onClick={() => setActiveTab("fixed")}
          className={`
            py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer
            ${
              activeTab === "fixed"
                ? "bg-white text-blue-700 shadow-2xs border border-blue-200/70"
                : "text-slate-500 hover:text-slate-800"
            }
          `}
        >
          <Pin className="w-3.5 h-3.5 text-blue-600" />
          <span>고정수 선택 ({fixedNumbers.length}/3)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("excluded")}
          className={`
            py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer
            ${
              activeTab === "excluded"
                ? "bg-white text-rose-700 shadow-2xs border border-rose-200/70"
                : "text-slate-500 hover:text-slate-800"
            }
          `}
        >
          <Ban className="w-3.5 h-3.5 text-rose-600" />
          <span>제외수 선택 ({excludedNumbers.length}/5)</span>
        </button>
      </div>

      {/* Helper Guidance Header */}
      <div className="flex items-center justify-between px-1 text-xs">
        <span className="font-semibold text-slate-500">
          {activeTab === "fixed"
            ? "반드시 포함할 번호를 터치하세요 (0~3개)"
            : "조합에서 제외할 번호를 터치하세요 (0~5개)"}
        </span>
        <span className="font-bold text-slate-400">
          {activeTab === "fixed" ? `${fixedNumbers.length}/3` : `${excludedNumbers.length}/5`}
        </span>
      </div>

      {/* 5 cols x 9 rows Number Grid */}
      <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
        {numbers.map((num) => {
          const isFixed = fixedNumbers.includes(num);
          const isExcluded = excludedNumbers.includes(num);

          let isDisabled = false;
          let btnStyle = "bg-slate-100/80 text-slate-700 hover:bg-slate-200/70 border border-slate-200/50";

          if (activeTab === "fixed") {
            if (isExcluded) {
              isDisabled = true; // 제외수는 고정수로 선택 불가
            } else if (isFixed) {
              const color = getBallColorStyle(num);
              btnStyle = `${color.bg} text-white ring-2 ring-blue-600 ring-offset-2 scale-[1.03] shadow-xs`;
            } else if (fixedNumbers.length >= 3) {
              isDisabled = true;
            }
          } else {
            // activeTab === 'excluded'
            if (isFixed) {
              isDisabled = true; // 고정수는 제외수로 선택 불가
            } else if (isExcluded) {
              btnStyle = "bg-rose-500 text-white ring-2 ring-rose-600 ring-offset-2 scale-[1.03] shadow-xs";
            } else if (excludedNumbers.length >= 5) {
              isDisabled = true;
            }
          }

          return (
            <button
              key={num}
              type="button"
              onClick={() => handleToggle(num)}
              disabled={isDisabled}
              className={`
                h-11 sm:h-12 rounded-xl text-sm font-extrabold flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer touch-manipulation relative
                ${btnStyle}
                ${isDisabled ? "opacity-30 cursor-not-allowed hover:bg-slate-100/80" : ""}
              `}
              aria-label={`로또 번호 ${num}`}
            >
              <span>{num < 10 ? `0${num}` : num}</span>
              {isFixed && activeTab === "excluded" && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  고
                </span>
              )}
              {isExcluded && activeTab === "fixed" && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  제
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Options Summary Chips */}
      <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-500 flex items-center gap-1">
            <Pin className="w-3.5 h-3.5 text-blue-600" />
            고정수 ({fixedNumbers.length}/3):
          </span>
          <div className="flex items-center gap-1 font-extrabold text-blue-600">
            {fixedNumbers.length === 0 ? (
              <span className="text-slate-400 font-medium">선택 없음</span>
            ) : (
              fixedNumbers.map((n) => <span key={n} className="bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{n < 10 ? `0${n}` : n}</span>)
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-500 flex items-center gap-1">
            <Ban className="w-3.5 h-3.5 text-rose-600" />
            제외수 ({excludedNumbers.length}/5):
          </span>
          <div className="flex items-center gap-1 font-extrabold text-rose-600">
            {excludedNumbers.length === 0 ? (
              <span className="text-slate-400 font-medium">선택 없음</span>
            ) : (
              excludedNumbers.map((n) => <span key={n} className="bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">{n < 10 ? `0${n}` : n}</span>)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
