"use client";

import React, { useState } from "react";
import { LottoAnalysis } from "@/types/lotto";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AnalysisSummaryCardProps {
  analysis: LottoAnalysis;
  title?: string;
  className?: string;
}

export default function AnalysisSummaryCard({
  analysis,
  title = "조합 살펴보기",
  className = "",
}: AnalysisSummaryCardProps) {
  const [showRangeDetails, setShowRangeDetails] = useState(false);

  const consecutiveText =
    analysis.consecutivePairs.length > 0
      ? analysis.consecutivePairs.map((pair) => `${pair[0]}·${pair[1]}`).join(", ")
      : "없음";

  return (
    <section className={`w-full bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 ${className}`}>
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="font-bold text-slate-900 text-base">{title}</h2>
        <span className="text-xs font-semibold text-slate-400">특성 요약</span>
      </div>

      {/* 2x2 Feature Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Odd/Even */}
        <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100">
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            홀짝 비율
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-slate-900">
              {analysis.oddCount} : {analysis.evenCount}
            </span>
            <span className="text-xs font-medium text-slate-500">
              (홀 {analysis.oddCount} · 짝 {analysis.evenCount})
            </span>
          </div>
        </div>

        {/* Low/High */}
        <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100">
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            저고 비율 (1~22 / 23~45)
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-slate-900">
              {analysis.lowCount} : {analysis.highCount}
            </span>
            <span className="text-xs font-medium text-slate-500">
              (저 {analysis.lowCount} · 고 {analysis.highCount})
            </span>
          </div>
        </div>

        {/* Sum */}
        <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100">
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            번호 합계
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-slate-900">
              {analysis.sum}
            </span>
            <span className="text-xs font-medium text-slate-500">점</span>
          </div>
        </div>

        {/* Consecutive */}
        <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100">
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            연속번호
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-black text-slate-900 truncate">
              {consecutiveText}
            </span>
          </div>
        </div>
      </div>

      {/* Range Distribution Toggle Details */}
      <div className="pt-1">
        <button
          onClick={() => setShowRangeDetails(!showRangeDetails)}
          className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold flex items-center justify-between transition-colors"
        >
          <span>구간별 분포 {showRangeDetails ? "접기" : "상세보기"}</span>
          {showRangeDetails ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showRangeDetails && (
          <div className="mt-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 grid grid-cols-5 gap-1.5 text-center">
            <div>
              <span className="text-[10px] font-semibold text-amber-700 block mb-1">
                1~10
              </span>
              <span className="text-sm font-black text-slate-800">
                {analysis.ranges.band1}개
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-blue-700 block mb-1">
                11~20
              </span>
              <span className="text-sm font-black text-slate-800">
                {analysis.ranges.band2}개
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-rose-700 block mb-1">
                21~30
              </span>
              <span className="text-sm font-black text-slate-800">
                {analysis.ranges.band3}개
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-700 block mb-1">
                31~40
              </span>
              <span className="text-sm font-black text-slate-800">
                {analysis.ranges.band4}개
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-emerald-700 block mb-1">
                41~45
              </span>
              <span className="text-sm font-black text-slate-800">
                {analysis.ranges.band5}개
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
