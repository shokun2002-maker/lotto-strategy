"use client";

import React, { useState } from "react";
import Header from "@/components/common/Header";
import BottomNavigation from "@/components/common/BottomNavigation";
import LottoBall from "@/components/lotto/LottoBall";
import NumberGridBoard from "@/components/lotto/NumberGridBoard";
import AnalysisSummaryCard from "@/components/lotto/AnalysisSummaryCard";
import { generateRandomNumbers } from "@/lib/lotto/generator";
import { analyzeLottoNumbers } from "@/lib/lotto/analyzer";
import { LottoAnalysis } from "@/types/lotto";
import { RefreshCw, RotateCcw, Info, Sparkles, CheckCircle2 } from "lucide-react";

export default function TogetherPage() {
  // 사용자가 직접 선택한 번호 목록 (0~6개)
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  
  // 최종 생성된 6개 번호 분석 결과
  const [analysis, setAnalysis] = useState<LottoAnalysis | null>(null);
  
  // 생성 중 스피너 상태
  const [isGenerating, setIsGenerating] = useState(false);

  // 번호 선택/해제 토글
  const handleToggleNumber = (num: number) => {
    setSelectedNumbers((prev) => {
      if (prev.includes(num)) {
        return prev.filter((n) => n !== num);
      } else {
        if (prev.length >= 6) return prev;
        return [...prev, num].sort((a, b) => a - b);
      }
    });
  };

  // 선택 초기화 (처음부터 다시)
  const handleReset = () => {
    setSelectedNumbers([]);
    setAnalysis(null);
  };

  // 추천 받기 (또는 다시 추천)
  const handleGenerate = () => {
    if (selectedNumbers.length === 0) return;

    setIsGenerating(true);

    setTimeout(() => {
      const finalNums = generateRandomNumbers({
        includeNumbers: selectedNumbers,
      });
      setAnalysis(analyzeLottoNumbers(finalNums));
      setIsGenerating(false);

      // 결과 영역으로 부드러운 스크롤 이동
      window.scrollTo({ top: 400, behavior: "smooth" });
    }, 150);
  };

  // 선택 개수에 따른 동적 버튼 문구
  const getButtonText = () => {
    const count = selectedNumbers.length;
    if (count === 0) return "먼저 원하는 번호를 선택해주세요";
    if (count === 6) return "내 조합 확인하기";
    const remain = 6 - count;
    return `나머지 ${remain}개 추천받기`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      {/* Header */}
      <Header showBackButton={true} title="함께추천" backHref="/" />

      <main className="flex-1 w-full max-w-md mx-auto px-5 pt-6 pb-4 space-y-6">
        {/* Main Copy */}
        <section className="space-y-1.5 pt-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
            마음에 둔 번호가 있나요?
            <br />
            <span className="text-blue-600">나머지를 채워드릴게요</span>
          </h1>
          <p className="text-sm font-medium text-slate-500">
            원하는 번호를 고르면 나머지를 함께 채워드려요.
          </p>
        </section>

        {/* Selected Numbers Status Header Bar */}
        <section className="w-full bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>내가 고른 번호 ({selectedNumbers.length}/6)</span>
            </div>

            {selectedNumbers.length > 0 && (
              <button
                onClick={handleReset}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>선택 초기화</span>
              </button>
            )}
          </div>

          {/* Display Currently Selected Ball Chips */}
          <div className="min-h-[44px] flex items-center gap-2 overflow-x-auto py-1">
            {selectedNumbers.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium px-1">
                아래 번호판에서 1~6개의 번호를 탭해보세요.
              </p>
            ) : (
              selectedNumbers.map((num) => (
                <LottoBall key={num} number={num} size="sm" isUserPick={true} />
              ))
            )}
          </div>
        </section>

        {/* 1~45 Number Grid Board */}
        <NumberGridBoard
          selectedNumbers={selectedNumbers}
          onToggleNumber={handleToggleNumber}
          maxSelectCount={6}
        />

        {/* Generate / Action Button */}
        <button
          onClick={handleGenerate}
          disabled={selectedNumbers.length === 0 || isGenerating}
          className={`
            w-full h-13 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-sm
            transition-all duration-200 active:scale-[0.98] cursor-pointer
            ${
              selectedNumbers.length > 0
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }
          `}
          aria-label={getButtonText()}
        >
          <RefreshCw
            className={`w-5 h-5 ${isGenerating ? "animate-spin" : ""}`}
          />
          <span>{getButtonText()}</span>
        </button>

        {/* Recommendation Result Display Section */}
        {analysis && (
          <section className="w-full bg-white rounded-2xl p-5 border border-blue-200 shadow-md shadow-blue-500/5 space-y-5 transition-all animate-fadeIn">
            {/* Header Result Status & Legend */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-blue-700 font-extrabold text-sm">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>함께 완성된 조합</span>
              </div>

              {/* Visual Legend */}
              <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  내가 선택
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                  추천
                </span>
              </div>
            </div>

            {/* 6 Lotto Balls Grid with MY / 추천 Badges */}
            <div className="flex items-center justify-between gap-1.5 sm:gap-2 py-2">
              {analysis.numbers.map((num) => {
                const isUserPick = selectedNumbers.includes(num);
                return (
                  <LottoBall
                    key={num}
                    number={num}
                    size="lg"
                    isUserPick={isUserPick}
                    badgeText={isUserPick ? "MY" : "추천"}
                  />
                );
              })}
            </div>

            {/* Action Buttons: Again vs Reset */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`}
                />
                <span>선택 유지 후 다시 추천</span>
              </button>

              <button
                onClick={handleReset}
                className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>다시 선택하기</span>
              </button>
            </div>
          </section>
        )}

        {/* Analysis Summary Card (when analysis exists) */}
        {analysis && <AnalysisSummaryCard analysis={analysis} />}

        {/* Disclaimer Note */}
        <section className="w-full bg-slate-100/70 border border-slate-200/60 rounded-xl p-3.5 flex items-start gap-2.5 text-slate-500 text-xs">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            번호 조합 및 분석 정보는 참고용이며 실제 당첨을 예측하거나 보장하지 않습니다.
          </p>
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
