"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/common/Header";
import BottomNavigation from "@/components/common/BottomNavigation";
import LottoBall from "@/components/lotto/LottoBall";
import AnalysisSummaryCard from "@/components/lotto/AnalysisSummaryCard";
import { generateRandomNumbers } from "@/lib/lotto/generator";
import { analyzeLottoNumbers } from "@/lib/lotto/analyzer";
import { saveCombination, isCombinationSaved } from "@/lib/lotto/storage";
import { getNextDrawInfo } from "@/lib/lotto/draw-schedule";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { LottoAnalysis } from "@/types/lotto";
import { RefreshCw, Info, Sparkles, Bookmark, Check } from "lucide-react";

export default function QuickRecommendationPage() {
  const nextDraw = getNextDrawInfo();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        setUser(data.user);
      });
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
      return () => {
        authListener.subscription.unsubscribe();
      };
    } catch {
      // fallback
    }
  }, []);

  // 초기 페이지 진입 시 자동으로 1개 조합 생성 및 분석
  const [analysis, setAnalysis] = useState<LottoAnalysis>(() => {
    const initialNums = generateRandomNumbers();
    return analyzeLottoNumbers(initialNums);
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "duplicate">("idle");

  // 현재 번호가 변경되면 이미 저장된 번호인지 확인하여 상태 동기화
  useEffect(() => {
    if (isCombinationSaved(analysis.numbers, nextDraw.drawNo)) {
      setSaveStatus("duplicate");
    } else {
      setSaveStatus("idle");
    }
  }, [analysis.numbers, nextDraw.drawNo]);

  const handleGenerate = () => {
    setIsGenerating(true);

    setTimeout(() => {
      const newNumbers = generateRandomNumbers();
      setAnalysis(analyzeLottoNumbers(newNumbers));
      setSaveStatus("idle");
      setIsGenerating(false);
    }, 150);
  };

  const handleSave = () => {
    if (saveStatus === "saved" || saveStatus === "duplicate") return;

    const result = saveCombination(
      {
        numbers: analysis.numbers,
        source: "quick",
        targetDrawNo: nextDraw.drawNo,
      },
      user?.id
    );

    if (result.success) {
      setSaveStatus("saved");
    } else if (result.isDuplicate) {
      setSaveStatus("duplicate");
    }
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
              제{nextDraw.drawNo}회 추천 번호
            </span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              자동 생성을 완료했습니다
            </span>
          </div>

          {/* 6 Lotto Balls Grid */}
          <div className="flex items-center justify-between gap-1 sm:gap-2 py-2">
            {analysis.numbers.map((num) => (
              <LottoBall key={num} number={num} size="md" />
            ))}
          </div>

          {/* Buttons: Generate + Save to My Numbers */}
          <div className="space-y-2.5 pt-1">
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

            {/* Save Button */}
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
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80 active:scale-[0.98]"
                }
              `}
            >
              {saveStatus === "saved" ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>✓ 제{nextDraw.drawNo}회 내 번호에 저장했어요</span>
                </>
              ) : saveStatus === "duplicate" ? (
                <>
                  <Check className="w-4 h-4 text-slate-400" />
                  <span>이미 저장된 번호예요</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 text-slate-500" />
                  <span>제{nextDraw.drawNo}회 내 번호에 저장</span>
                </>
              )}
            </button>
          </div>
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
