"use client";

import React, { useState } from "react";
import Header from "@/components/common/Header";
import BottomNavigation from "@/components/common/BottomNavigation";
import LottoBall from "@/components/lotto/LottoBall";
import AnalysisSummaryCard from "@/components/lotto/AnalysisSummaryCard";
import { LOTTO_STRATEGIES } from "@/lib/lotto/strategies";
import { generateBalancedNumbers, BalancedGenerationResult } from "@/lib/lotto/strategies/balanced";
import { saveCombination, isCombinationSaved } from "@/lib/lotto/storage";
import { getLatestDraw, getAllDraws } from "@/lib/lotto/draw-data";
import {
  Sliders,
  RefreshCw,
  Info,
  Sparkles,
  Bookmark,
  Check,
  CheckCircle2,
  Lock,
  Database,
} from "lucide-react";

export default function StrategyPage() {
  const [result, setResult] = useState<BalancedGenerationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "duplicate">("idle");

  const latestDraw = getLatestDraw();
  const totalDrawCount = getAllDraws().length;

  const handleGenerateBalanced = () => {
    setIsGenerating(true);

    setTimeout(() => {
      const newResult = generateBalancedNumbers();
      setResult(newResult);

      if (isCombinationSaved(newResult.numbers)) {
        setSaveStatus("duplicate");
      } else {
        setSaveStatus("idle");
      }

      setIsGenerating(false);

      // Scroll to result view
      window.scrollTo({ top: 400, behavior: "smooth" });
    }, 150);
  };

  const handleSave = () => {
    if (!result) return;
    if (saveStatus === "saved" || saveStatus === "duplicate") return;

    const res = saveCombination({
      numbers: result.numbers,
      source: "strategy",
      recommendedNumbers: result.numbers,
    });

    if (res.success) {
      setSaveStatus("saved");
    } else if (res.isDuplicate) {
      setSaveStatus("duplicate");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      {/* Header */}
      <Header />

      <main className="flex-1 w-full max-w-md mx-auto px-5 pt-6 pb-4 space-y-6">
        {/* Main Copy */}
        <section className="space-y-1.5 pt-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
            어떤 방식으로
            <br />
            <span className="text-blue-600">번호를 구성해볼까요?</span>
          </h1>
          <p className="text-sm font-medium text-slate-500">
            원하는 구성 방식을 선택해 번호를 만들어보세요.
          </p>
        </section>

        {/* Data Status Summary Badge */}
        {latestDraw && (
          <section className="w-full bg-white rounded-xl p-3.5 border border-slate-200/70 shadow-xs flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="font-semibold text-slate-700">
                <span>데이터 연동 </span>
                <span className="text-blue-600 font-extrabold">제1회 ~ 제{latestDraw.drawNo}회</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
              총 {totalDrawCount.toLocaleString()}개 회차
            </span>
          </section>
        )}

        {/* Strategy Selection Cards List */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              전략 선택
            </h2>
          </div>

          <div className="space-y-3">
            {LOTTO_STRATEGIES.map((strategy) => {
              const isActive = strategy.status === "active";
              const isBalanced = strategy.id === "balanced";

              return (
                <div
                  key={strategy.id}
                  className={`
                    w-full bg-white rounded-2xl p-5 border transition-all duration-200 shadow-xs
                    ${
                      isActive
                        ? "border-blue-200/90 shadow-blue-500/5 hover:border-blue-300"
                        : "border-slate-200/60 opacity-75"
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                          {strategy.name}
                        </h3>

                        {isActive ? (
                          <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-extrabold">
                            사용 가능
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center gap-0.5">
                            <Lock className="w-3 h-3 text-slate-400" />
                            {strategy.badgeText || "준비 중"}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 font-medium mt-1">
                        {strategy.shortDescription}
                      </p>
                    </div>
                  </div>

                  {isActive && isBalanced && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                        {strategy.detailDescription}
                      </p>
                      <button
                        onClick={handleGenerateBalanced}
                        disabled={isGenerating}
                        className="w-full sm:w-auto px-4 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-70"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`}
                        />
                        <span>균형형으로 만들기</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Balanced Strategy Generation Result Section */}
        {result && (
          <section className="w-full bg-white rounded-2xl p-5 border border-blue-200 shadow-md shadow-blue-500/5 space-y-5 transition-all animate-fadeIn">
            {/* Header Status */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-blue-700 font-extrabold text-sm">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>균형형 조합 완충</span>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                균형 조건 충족 완료
              </span>
            </div>

            {/* 6 Lotto Balls Grid */}
            <div className="flex items-center justify-between gap-1.5 sm:gap-2 py-2">
              {result.numbers.map((num) => (
                <LottoBall key={num} number={num} size="lg" />
              ))}
            </div>

            {/* Strategy Concept Guidance Text */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100/80 text-xs text-blue-900 leading-relaxed font-medium space-y-1">
              <div className="flex items-center gap-1 font-bold text-blue-800">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>균형형 구성 특징</span>
              </div>
              <p className="text-slate-600">
                균형형은 홀짝과 저고가 한쪽으로 크게 치우치지 않고, 여러 번호 구간에 분산되도록 조합합니다.
              </p>
            </div>

            {/* Action Buttons: Save + Re-generate */}
            <div className="space-y-2.5 pt-1">
              <button
                onClick={handleSave}
                disabled={saveStatus === "saved" || saveStatus === "duplicate"}
                className={`
                  w-full h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all duration-200 cursor-pointer
                  ${
                    saveStatus === "saved"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : saveStatus === "duplicate"
                      ? "bg-slate-100 text-slate-500 border-slate-200"
                      : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200/80 active:scale-[0.98]"
                  }
                `}
              >
                {saveStatus === "saved" ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>✓ 내 번호에 저장했어요</span>
                  </>
                ) : saveStatus === "duplicate" ? (
                  <>
                    <Check className="w-4 h-4 text-slate-400" />
                    <span>이미 저장된 번호예요</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 text-blue-600" />
                    <span>내 번호에 저장</span>
                  </>
                )}
              </button>

              <button
                onClick={handleGenerateBalanced}
                disabled={isGenerating}
                className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`}
                />
                <span>균형형으로 다시 만들기</span>
              </button>
            </div>
          </section>
        )}

        {/* Analysis Summary Card */}
        {result && <AnalysisSummaryCard analysis={result.analysis} title="이번 조합의 구성" />}

        {/* Disclaimer Note */}
        <section className="w-full bg-slate-100/70 border border-slate-200/60 rounded-xl p-3.5 flex items-start gap-2.5 text-slate-500 text-xs">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            이 조건은 번호의 구성 방식을 정하는 기준이며 당첨 가능성을 의미하지 않습니다.
          </p>
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
