"use client";

import React, { useState } from "react";
import Header from "@/components/common/Header";
import BottomNavigation from "@/components/common/BottomNavigation";
import LottoBall from "@/components/lotto/LottoBall";
import CustomNumberSelector from "@/components/lotto/CustomNumberSelector";
import AnalysisSummaryCard from "@/components/lotto/AnalysisSummaryCard";
import { LOTTO_STRATEGIES } from "@/lib/lotto/strategies";
import { generateBalancedNumbers } from "@/lib/lotto/strategies/balanced";
import { generateRecentTrendNumbers } from "@/lib/lotto/strategies/recent-trend";
import { generateLongAbsenceNumbers } from "@/lib/lotto/strategies/long-absence";
import { generateCustomNumbers } from "@/lib/lotto/strategies/custom";
import { saveCombination, isCombinationSaved } from "@/lib/lotto/storage";
import { getLatestDraw, getAllDraws } from "@/lib/lotto/draw-data";
import { StrategyGenerationResult, LottoStrategyId } from "@/types/lotto";
import {
  Sliders,
  RefreshCw,
  Info,
  Sparkles,
  Bookmark,
  Check,
  CheckCircle2,
  Database,
  TrendingUp,
  Clock,
  Scale,
  Settings2,
  ChevronDown,
  ChevronUp,
  Pin,
  Ban,
} from "lucide-react";

export default function StrategyPage() {
  const [result, setResult] = useState<StrategyGenerationResult | null>(null);
  const [selectedStrategyId, setSelectedStrategyId] = useState<LottoStrategyId>("balanced");
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "duplicate">("idle");

  // 나만의 커스텀 전략 설정 상태
  const [showCustomSection, setShowCustomSection] = useState(false);
  const [fixedNumbers, setFixedNumbers] = useState<number[]>([]);
  const [excludedNumbers, setExcludedNumbers] = useState<number[]>([]);
  const [customBaseStrategy, setCustomBaseStrategy] = useState<LottoStrategyId>("balanced");

  const latestDraw = getLatestDraw();
  const totalDrawCount = getAllDraws().length;

  // 일반 3개 기본 전략 생성
  const handleGenerateStrategy = (strategyId: LottoStrategyId) => {
    setSelectedStrategyId(strategyId);
    setIsGenerating(true);

    setTimeout(() => {
      let newResult: StrategyGenerationResult;
      if (strategyId === "recent-trend") {
        newResult = generateRecentTrendNumbers();
      } else if (strategyId === "long-absence") {
        newResult = generateLongAbsenceNumbers();
      } else {
        newResult = generateBalancedNumbers();
      }

      setResult(newResult);

      if (isCombinationSaved(newResult.numbers)) {
        setSaveStatus("duplicate");
      } else {
        setSaveStatus("idle");
      }

      setIsGenerating(false);
      window.scrollTo({ top: 400, behavior: "smooth" });
    }, 150);
  };

  // 나만의 커스텀 전략 번호 생성 (고정수 + 제외수 + 기본전략)
  const handleGenerateCustom = () => {
    setIsGenerating(true);

    setTimeout(() => {
      const newResult = generateCustomNumbers({
        baseStrategy: customBaseStrategy,
        fixedNumbers,
        excludedNumbers,
      });

      setResult(newResult);

      if (isCombinationSaved(newResult.numbers)) {
        setSaveStatus("duplicate");
      } else {
        setSaveStatus("idle");
      }

      setIsGenerating(false);
      window.scrollTo({ top: 500, behavior: "smooth" });
    }, 150);
  };

  const handleSave = () => {
    if (!result) return;
    if (saveStatus === "saved" || saveStatus === "duplicate") return;

    const res = saveCombination({
      numbers: result.numbers,
      source: "strategy",
      strategyId: result.strategyId,
      userPickedNumbers: result.metadata.fixedNumbers ?? [],
      recommendedNumbers: result.numbers.filter(
        (n) => !(result.metadata.fixedNumbers ?? []).includes(n)
      ),
    });

    if (res.success) {
      setSaveStatus("saved");
    } else if (res.isDuplicate) {
      setSaveStatus("duplicate");
    }
  };

  const getStrategyIcon = (id: LottoStrategyId) => {
    switch (id) {
      case "balanced":
        return Scale;
      case "recent-trend":
        return TrendingUp;
      case "long-absence":
        return Clock;
      default:
        return Sliders;
    }
  };

  const getStrategyTitle = (id: LottoStrategyId) => {
    switch (id) {
      case "recent-trend":
        return "최근흐름형 조합";
      case "long-absence":
        return "장기미출현형 조합";
      default:
        return "균형형 조합";
    }
  };

  const getBallBadgeText = (num: number) => {
    if (!result) return undefined;
    if (result.metadata.fixedNumbers?.includes(num)) {
      return "고정";
    }
    if (result.featuredNumbers.includes(num)) {
      if (result.strategyId === "recent-trend") return "최근";
      if (result.strategyId === "long-absence") return "미출현";
    }
    return undefined;
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

        {/* Basic 3 Strategy Selection Cards */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              기본 전략 선택
            </h2>
          </div>

          <div className="space-y-3">
            {LOTTO_STRATEGIES.map((strategy) => {
              const IconComponent = getStrategyIcon(strategy.id);

              return (
                <div
                  key={strategy.id}
                  className="w-full bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-blue-200 transition-all duration-200 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80 shrink-0 mt-0.5">
                        <IconComponent className="w-5 h-5 stroke-[2]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                            {strategy.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-extrabold">
                            사용 가능
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          {strategy.shortDescription}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                    <button
                      onClick={() => handleGenerateStrategy(strategy.id)}
                      disabled={isGenerating}
                      className="w-full sm:w-auto px-4 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-70"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${
                          isGenerating && selectedStrategyId === strategy.id ? "animate-spin" : ""
                        }`}
                      />
                      <span>{strategy.name}로 만들기</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Custom Strategy Option Accordion / Card */}
        <section className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <button
            onClick={() => setShowCustomSection(!showCustomSection)}
            className="w-full p-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80 shrink-0">
                <Settings2 className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                    나만의 맞춤 전략 만들기
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-extrabold">
                    맞춤 설정
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  고정수·제외수와 기본 전략을 자유롭게 조합합니다.
                </p>
              </div>
            </div>

            <div className="text-slate-400">
              {showCustomSection ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </button>

          {showCustomSection && (
            <div className="p-5 pt-2 border-t border-slate-100 space-y-5 bg-slate-50/50">
              {/* 1. Custom Number Selector (Fixed & Excluded) */}
              <CustomNumberSelector
                fixedNumbers={fixedNumbers}
                excludedNumbers={excludedNumbers}
                onChangeFixed={setFixedNumbers}
                onChangeExcluded={setExcludedNumbers}
              />

              {/* 2. Base Strategy Choice */}
              <div className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
                <span className="text-xs font-bold text-slate-500 block">
                  3. 나머지 번호를 구성할 기본 전략 방식
                </span>

                <div className="grid grid-cols-3 gap-2">
                  {LOTTO_STRATEGIES.map((st) => {
                    const isSelected = customBaseStrategy === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setCustomBaseStrategy(st.id)}
                        className={`
                          py-2.5 px-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex flex-col items-center justify-center gap-1
                          ${
                            isSelected
                              ? "bg-blue-50 text-blue-700 border-blue-300 shadow-2xs"
                              : "bg-slate-50 text-slate-600 border-slate-200/70 hover:bg-slate-100"
                          }
                        `}
                      >
                        <span>{st.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Summary Info Banner */}
              <div className="w-full bg-white rounded-xl p-3.5 border border-slate-200/70 text-xs flex items-center justify-between">
                <div className="space-y-0.5 text-slate-600 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-blue-700 font-bold">
                      <Pin className="w-3 h-3" />
                      고정 {fixedNumbers.length}개
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 text-rose-700 font-bold">
                      <Ban className="w-3 h-3" />
                      제외 {excludedNumbers.length}개
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleGenerateCustom}
                  disabled={isGenerating}
                  className="px-4 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-70"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`}
                  />
                  <span>내 전략으로 번호 만들기</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Strategy Generation Result Section */}
        {result && (
          <section className="w-full bg-white rounded-2xl p-5 border border-blue-200 shadow-md shadow-blue-500/5 space-y-5 transition-all animate-fadeIn">
            {/* Header Status */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-blue-700 font-extrabold text-sm">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>{getStrategyTitle(result.strategyId)}</span>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                조합 생성 완료
              </span>
            </div>

            {/* 6 Lotto Balls Grid */}
            <div className="flex items-center justify-between gap-1.5 sm:gap-2 py-2">
              {result.numbers.map((num) => {
                const isFixed = result.metadata.fixedNumbers?.includes(num);
                return (
                  <LottoBall
                    key={num}
                    number={num}
                    size="lg"
                    isUserPick={isFixed}
                    badgeText={getBallBadgeText(num)}
                  />
                );
              })}
            </div>

            {/* Strategy Concept Guidance & Featured Stats */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100/80 text-xs text-blue-900 leading-relaxed font-medium space-y-2">
              <div className="flex items-center gap-1 font-bold text-blue-800">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>전략 구성 특징</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {result.metadata.description}
              </p>

              {/* Featured Stat Chips */}
              {result.metadata.featuredStats && result.metadata.featuredStats.length > 0 && (
                <div className="pt-1.5 flex flex-wrap gap-1.5">
                  {result.metadata.featuredStats.map((st) => (
                    <span
                      key={st.number}
                      className="inline-flex items-center gap-1 bg-white/90 border border-blue-200/70 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-2xs"
                    >
                      <span className="text-blue-600 font-black">{st.number}번</span>
                      <span className="text-slate-400">•</span>
                      <span>{st.label}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons: Save + Re-generate + Modify Condition */}
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

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    if (result.metadata.fixedNumbers || result.metadata.excludedNumbers) {
                      handleGenerateCustom();
                    } else {
                      handleGenerateStrategy(result.strategyId);
                    }
                  }}
                  disabled={isGenerating}
                  className="h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`}
                  />
                  <span>같은 조건으로 다시 만들기</span>
                </button>

                <button
                  onClick={() => {
                    setShowCustomSection(true);
                    window.scrollTo({ top: 250, behavior: "smooth" });
                  }}
                  className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Settings2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>조건 수정하기</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Analysis Summary Card */}
        {result && <AnalysisSummaryCard analysis={result.analysis} title="이번 조합의 구성" />}

        {/* Disclaimer Note */}
        <section className="w-full bg-slate-100/70 border border-slate-200/60 rounded-xl p-3.5 flex items-start gap-2.5 text-slate-500 text-xs">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            과거 출현 기록을 활용한 번호 구성 방식이며 미래 추첨 결과를 예측하거나 보장하지 않습니다.
          </p>
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
