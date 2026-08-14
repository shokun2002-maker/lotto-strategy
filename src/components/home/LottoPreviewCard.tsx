"use client";

import React, { useState } from "react";
import LottoBall from "../lotto/LottoBall";
import { RefreshCw, Sparkles } from "lucide-react";

export default function LottoPreviewCard() {
  const [numbers, setNumbers] = useState<number[]>([7, 14, 22, 28, 33, 41]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Generate 6 random non-repeating numbers from 1 to 45
    setTimeout(() => {
      const newNumbers: number[] = [];
      while (newNumbers.length < 6) {
        const r = Math.floor(Math.random() * 45) + 1;
        if (!newNumbers.includes(r)) {
          newNumbers.push(r);
        }
      }
      newNumbers.sort((a, b) => a - b);
      setNumbers(newNumbers);
      setIsRefreshing(false);
    }, 300);
  };

  return (
    <div className="w-full bg-gradient-to-b from-blue-50/70 to-indigo-50/40 border border-blue-100 rounded-2xl p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-white/80 px-2.5 py-1 rounded-full border border-blue-200/50">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>전략 샘플 프리뷰</span>
        </div>

        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors p-1"
          aria-label="샘플 번호 새로고침"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
          <span>새로고침</span>
        </button>
      </div>

      <div className="flex items-center justify-between gap-1 sm:gap-2 py-1 px-1 bg-white/90 rounded-xl p-3 border border-slate-200/50 shadow-2xs">
        {numbers.map((num) => (
          <LottoBall key={num} number={num} size="md" />
        ))}
      </div>
    </div>
  );
}
