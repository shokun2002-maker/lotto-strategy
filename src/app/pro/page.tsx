"use client";

import React, { useState } from "react";
import Header from "@/components/common/Header";
import BottomNavigation from "@/components/common/BottomNavigation";
import ProBadge from "@/components/subscription/ProBadge";
import { useEntitlement } from "@/components/subscription/EntitlementContext";
import { PROVIDER_CAPABILITIES } from "@/lib/billing/capabilities";
import {
  Crown,
  Check,
  X,
  Sliders,
  Sparkles,
  CreditCard,
  Info,
  Calendar,
  Zap,
  Lock,
  Wallet,
  Smartphone,
  Building2,
} from "lucide-react";

export default function ProPricingPage() {
  const { plan, isPro } = useEntitlement();
  const [selectedCategory, setSelectedCategory] = useState<"subscription" | "access_pass">("subscription");

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

  const productPreviewList = [
    {
      id: "pro_monthly_sub",
      title: "PRO 월간 정기구독",
      type: "subscription",
      description: "매월자동 갱신으로 제한 없는 나만의 전략 활용",
      tag: "BEST 선택",
      isPopular: true,
    },
    {
      id: "pro_30day_pass",
      title: "PRO 30일 이용권",
      type: "access_pass",
      description: "30일 동안 정기구독 부담 없이 PRO 혜택 이용",
      tag: "단건 패스",
      isPopular: false,
    },
    {
      id: "pro_7day_pass",
      title: "PRO 7일 체험 패스",
      type: "access_pass",
      description: "7일간 가볍게 PRO 기능을 직접 경험",
      tag: "체험 패스",
      isPopular: false,
    },
  ];

  const supportedPaymentMethods = [
    { name: "신용/체크카드", icon: CreditCard },
    { name: "카카오페이", icon: Wallet },
    { name: "토스페이", icon: Zap },
    { name: "네이버페이", icon: Wallet },
    { name: "계좌이체 / 가상계좌", icon: Building2 },
    { name: "휴대폰 소액결제", icon: Smartphone },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      {/* Header */}
      <Header title="PRO 멤버십 & 이용권" showBackButton={true} backHref="/my" />

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
              월 정기구독부터 7일/30일 기간제 이용권까지 원하는 방식으로 PRO 혜택을 자유롭게 선택하세요.
            </p>
          </div>
        </section>

        {/* Product Category Selection Preview Card */}
        <section className="w-full bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-1">
                MEMBERSHIP & ACCESS PASS
              </span>
              <h2 className="text-xl font-black text-slate-900">플랜 및 이용권 선택</h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Crown className="w-5 h-5 fill-amber-400 text-amber-600" />
            </div>
          </div>

          {/* Product Category Toggle */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-extrabold">
            <button
              onClick={() => setSelectedCategory("subscription")}
              className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                selectedCategory === "subscription"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>월 정기구독</span>
            </button>
            <button
              onClick={() => setSelectedCategory("access_pass")}
              className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                selectedCategory === "access_pass"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>기간제 이용권</span>
            </button>
          </div>

          {/* Product Cards */}
          <div className="space-y-3 pt-1">
            {productPreviewList
              .filter((item) =>
                selectedCategory === "subscription"
                  ? item.type === "subscription"
                  : item.type === "access_pass"
              )
              .map((prod) => (
                <div
                  key={prod.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 relative"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{prod.title}</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                        {prod.tag}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      준비 중
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {prod.description}
                  </p>

                  <button
                    disabled={true}
                    className="w-full h-10 rounded-xl bg-slate-200 text-slate-500 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed mt-1"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>결제 서비스 준비 중</span>
                  </button>
                </div>
              ))}
          </div>
        </section>

        {/* Supported Payment Methods Preview */}
        <section className="w-full bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="space-y-0.5">
            <h3 className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>지원 예정 결제 수단</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              PG 승인 완료 후 지원될 결제 옵션 프리뷰
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {supportedPaymentMethods.map((pm) => {
              const Icon = pm.icon;
              return (
                <div
                  key={pm.name}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2 text-slate-500 font-semibold opacity-80"
                >
                  <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{pm.name}</span>
                </div>
              );
            })}
          </div>
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
            현재 표시된 가격은 개발 및 테스트용 임시 fixture 금액이며 실제 판매가격은 미확정 상태입니다. 정식 PG 결제 심사 및 승인이 완료되면 카카오페이, 토스, 네이버페이가 순차적으로 연결됩니다.
          </p>
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
