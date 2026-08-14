"use client";

import React, { useState } from "react";
import Header from "@/components/common/Header";
import BottomNavigation from "@/components/common/BottomNavigation";
import LottoBall from "@/components/lotto/LottoBall";
import AnalysisSummaryCard from "@/components/lotto/AnalysisSummaryCard";
import { generateRandomNumbers } from "@/lib/lotto/generator";
import { analyzeLottoNumbers } from "@/lib/lotto/analyzer";
import { LottoAnalysis } from "@/types/lotto";
import { RefreshCw, Info, Sparkles } from "lucide-react";

export default function QuickRecommendationPage() {
  // 초기 페이지 진입 시 자동으로 1개 조합 생성 및 분석
  const [analysis, setAnalysis] = useState<LottoAnalysis>(() => {
    const initialNums = generateRandomNumbers();
    return analyzeLottoNumbers(initialNums);
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);

    setTimeout(() => {
      const newNumbers = generateRandomNumbers();
      setAnalysis(analyzeLottoNumbers(newNumbers));
      setIsGenerating(false);
    }, 150);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      {/* Header with Back Button */}
      <Header showBackButton={true} title="빠른추천" backHref="/" />

      <main className="flex-1 w-full max-w-md mx-auto px-5 pt-6 pb-4 space-y-6">
        {/* Main Copy Area */}
        <section className="space-y-1.5 pt-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
            버튼 한 번으로
            <br />
            <span className="text-blue-600">번호를 만들어보세요</span>
          </h1>
          <p className="text-sm font-medium text-slate-500">
            설정 없이 간단하게 6개의 번호를 조합합니다.
          </p>
        </section>

        {/* Lotto Ball Display Box */}
        <section className="w-full bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              추천 번호 조합
            </span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              자동 생성을 완료했습니다
            </span>
          </div>

          {/* 6 Lotto Balls Grid */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 py-2">
            {analysis.numbers.map((num) => (
              <LottoBall key={num} number={num} size="lg" />
            ))}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full h-13 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-base flex items-center justify-center gap-2 shadow-sm transition-all duration-200 disabled:opacity-70 cursor-pointer"
            aria-label="새 번호 만들기"
          >
            <RefreshCw
              className={`w-5 h-5 ${isGenerating ? "animate-spin" : ""}`}
            />
            <span>새 번호 만들기</span>
          </button>
        </section>

        {/* Reusable Analysis Summary Card */}
        <AnalysisSummaryCard analysis={analysis} />

        {/* Disclaimer Note */}
        <section className="w-full bg-slate-100/70 border border-slate-200/60 rounded-xl p-3.5 flex items-start gap-2.5 text-slate-500 text-xs">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            이 분석은 생성된 번호 조합의 구성 특징을 보여주는 정보이며, 당첨 가능성을 의미하지 않습니다.
          </p>
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
