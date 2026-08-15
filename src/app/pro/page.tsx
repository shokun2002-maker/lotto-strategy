"use client";

import React from "react";
import Header from "@/components/common/Header";
import BottomNavigation from "@/components/common/BottomNavigation";
import ProBadge from "@/components/subscription/ProBadge";
import { useEntitlement } from "@/components/subscription/EntitlementContext";
import {
  Crown,
  Check,
  X,
  Zap,
  Sliders,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Info,
} from "lucide-react";

export default function ProPricingPage() {
  const { plan, isPro } = useEntitlement();

  const comparisonFeatures = [
    {
      name: "빠른추천 번호 생성",
      free: "지원",
      pro: "지원",
      isIncludedFree: true,
    },
    {
      name: "함께추천 번호 선택",
      free: "지원",
      pro: "지원",
      isIncludedFree: true,
    },
    {
      name: "기본 분석 전략 (6종)",
      free: "지원",
      pro: "지원",
      isIncludedFree: true,
    },
    {
      name: "클라우드 데이터 자동 동기화",
      free: "지원",
      pro: "지원",
      isIncludedFree: true,
    },
    {
      name: "나만의 커스텀 전략 저장",
      free: "최대 1개",
      pro: "최대 20개",
      isIncludedFree: false,
    },
    {
      name: "3게임 / 5게임 번호 일괄 생성",
      free: "미지원 (1게임만)",
      pro: "전체 지원",
      isIncludedFree: false,
    },
    {
      name: "고급 개인 번호 패턴 분석",
      free: "기본 요약",
      pro: "전체 상세 분석",
      isIncludedFree: false,
    },
    {
      name: "회차별 백테스트 상세 리포트",
      free: "기본 요약",
      pro: "전체 회차 분석",
      isIncludedFree: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      {/* Header */}
      <Header title="PRO 멤버십" showBackButton={true} backHref="/my" />

      <main className="flex-1 w-full max-w-md mx-auto px-5 pt-6 pb-4 space-y-6">
        {/* Hero Banner */}
        <section className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 text-white rounded-3xl p-6 shadow-lg space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ProBadge plan={plan} isPro={isPro} size="md" />
              <span className="text-xs font-semibold text-slate-300">현재 이용 플랜</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>LOTTO STRATEGY PREMIUM</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              나만의 전략을 더 <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400">
                깊이 있게 활용하세요
              </span>
            </h1>
            <p className="text-xs text-slate-300 font-medium leading-relaxed pt-1">
              PRO 멤버십으로 나만의 맞춤 전략을 무제한에 가깝게 저장하고, 3·5게임 생성 및 고급 분석을 이용해 보세요.
            </p>
          </div>
        </section>

        {/* Pricing / Payment Status Card */}
        <section className="w-full bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-1">
                PRO MEMBERSHIP
              </span>
              <h2 className="text-xl font-black text-slate-900">PRO 멤버십 구독</h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Crown className="w-5 h-5 fill-amber-400 text-amber-600" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-extrabold text-slate-800">월간 이용권</span>
              <div className="text-right">
                <span className="text-xs font-bold text-amber-600 bg-amber-100/80 px-2 py-0.5 rounded-md">
                  결제 기능 준비 중
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              정식 결제 기능이 오픈되면 카드/간편결제를 통해 손쉽게 PRO 구독을 시작할 수 있습니다.
            </p>
          </div>

          <button
            disabled={true}
            className="w-full h-12 rounded-xl bg-slate-200 text-slate-500 font-extrabold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <CreditCard className="w-4 h-4" />
            <span>결제 기능 준비 중</span>
          </button>
        </section>

        {/* FREE vs PRO Comparison Feature List */}
        <section className="w-full bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>FREE vs PRO 혜택 비교</span>
          </h2>

          <div className="divide-y divide-slate-100">
            {comparisonFeatures.map((item) => (
              <div key={item.name} className="py-3 space-y-1.5">
                <span className="text-xs font-extrabold text-slate-800 block">
                  {item.name}
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* FREE Col */}
                  <div
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      item.isIncludedFree
                        ? "bg-slate-50 border-slate-200 text-slate-700"
                        : "bg-slate-50/50 border-slate-100 text-slate-400"
                    }`}
                  >
                    <span className="font-bold text-[11px]">FREE</span>
                    <div className="flex items-center gap-1 font-extrabold">
                      {item.isIncludedFree ? (
                        <Check className="w-3.5 h-3.5 text-slate-600" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-slate-300" />
                      )}
                      <span>{item.free}</span>
                    </div>
                  </div>

                  {/* PRO Col */}
                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-amber-900 flex items-center justify-between font-extrabold">
                    <span className="text-[11px] text-amber-700 font-extrabold">PRO</span>
                    <div className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-amber-600" />
                      <span>{item.pro}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Notice Section */}
        <section className="w-full bg-slate-100/70 border border-slate-200/60 rounded-xl p-3.5 flex items-start gap-2.5 text-slate-500 text-xs">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            기존에 저장한 번호와 커스텀 전략 데이터는 요금제 변경이나 이용 중에도 삭제되지 않고 안전하게 보관됩니다.
          </p>
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
