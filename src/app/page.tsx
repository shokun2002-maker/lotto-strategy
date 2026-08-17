"use client";

import React, { useState } from "react";
import Header from "@/components/common/Header";
import BottomNavigation from "@/components/common/BottomNavigation";
import ActionCard from "@/components/home/ActionCard";
import LottoPreviewCard from "@/components/home/LottoPreviewCard";
import DisclaimerNotice from "@/components/home/DisclaimerNotice";
import PwaInstallGuideModal from "@/components/common/PwaInstallGuideModal";
import { Zap, Sparkles, Sliders, Smartphone, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      {/* Top Fixed/Sticky Header */}
      <Header dDayText="추첨까지 D-3" />

      {/* Main Container - App layout constrained to max-w-md on desktop */}
      <main className="flex-1 w-full max-w-md mx-auto px-5 pt-6 pb-4 space-y-6">
        {/* Main Hero Copy */}
        <section className="space-y-2 pt-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
            이번 주 번호를
            <br />
            <span className="text-blue-600">어떻게 만들어볼까요?</span>
          </h1>
          <p className="text-sm font-medium text-slate-500">
            데이터 분석과 개인화 전략으로 만드는 나만의 조합
          </p>
        </section>

        {/* Beta Welcome Entry Banner */}
        <section className="w-full bg-linear-to-r from-amber-400 via-amber-300 to-yellow-300 text-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2 border border-amber-300">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-yellow-300 text-[10px] font-black tracking-wide">
              무료 베타 안내
            </span>
            <button
              onClick={() => setIsPwaModalOpen(true)}
              className="text-[11px] font-extrabold text-slate-900 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>홈 화면 설치 방법</span>
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-0.5">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              별도의 앱 설치 없이 지금 바로 이용!
            </h2>
            <p className="text-xs font-semibold text-slate-800 leading-snug">
              카카오톡 화면에서도 모든 추천·저장 기능을 바로 체험해 보세요.
            </p>
          </div>

          <div className="pt-1">
            <Link
              href="/quick"
              className="py-2 px-3.5 rounded-xl bg-slate-900 text-white text-xs font-extrabold inline-flex items-center gap-1.5 hover:bg-slate-800 transition-all shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 text-yellow-400 fill-current" />
              <span>빠른 추천 바로 시작하기</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </section>

        {/* Lotto Ball Sample Preview Card */}
        <LottoPreviewCard />

        {/* Core Feature Action Cards */}
        <section className="space-y-3.5 pt-1">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              추천 방식 선택
            </h2>
          </div>

          <div className="space-y-3">
            {/* 빠른추천 */}
            <ActionCard
              title="빠른추천"
              description="바로 번호 만들기"
              subText="설정 없이 바로 조합되는 데이터 알고리즘"
              href="/quick"
              icon={Zap}
              accentColor="blue"
            />

            {/* 함께추천 */}
            <ActionCard
              title="함께추천"
              description="내가 고르고 나머지는 추천받기"
              subText="선호 번호를 고르고 맞춤 조합 완성"
              href="/together"
              icon={Sparkles}
              accentColor="indigo"
              badgeText="인기"
            />

            {/* 나의 전략 */}
            <ActionCard
              title="나의 전략"
              description="내 방식으로 번호 만들기"
              subText="고정수·제외수 및 개인화 규칙 적용"
              href="/strategy"
              icon={Sliders}
              isPro={true}
              accentColor="emerald"
            />
          </div>
        </section>

        {/* Disclaimer Notice */}
        <section className="pt-2">
          <DisclaimerNotice />
        </section>
      </main>

      {/* PWA Installation Guide Modal */}
      <PwaInstallGuideModal
        isOpen={isPwaModalOpen}
        onClose={() => setIsPwaModalOpen(false)}
      />

      {/* Fixed Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
