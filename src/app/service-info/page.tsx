import React from "react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import BottomNavigation from "@/components/common/BottomNavigation";
import ServiceDisclaimer from "@/components/common/ServiceDisclaimer";
import { Metadata } from "next";
import { Sparkles, Sliders, CheckCircle2, XCircle, Database, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "서비스 소개 | LOTTO STRATEGY",
  description: "LOTTO STRATEGY 서비스 기능 명세 및 소개 - 로또 6/45 공개 과거 데이터 분석 및 나만의 맞춤 전략 조합 도구",
};

export default function ServiceInfoPage() {
  const coreFeatures = [
    { name: "빠른추천", desc: "기본 통계 알고리즘에 따른 1초 맞춤 조합 생성" },
    { name: "함께추천", desc: "이용자가 직접 포함하고 싶은 선호 번호 선택 조합" },
    { name: "균형형 전략", desc: "홀짝 비율, 고저 비율, 합계 구간이 균형 잡힌 전략" },
    { name: "최근흐름형 전략", desc: "최근 10~20회차 자주 출현한 번호 비중 강화" },
    { name: "장기미출현형 전략", desc: "오랫동안 나오지 않은 이월/콜드 번호 조합" },
    { name: "고정수 / 제외수", desc: "반드시 포함하거나 제외할 번호 직접 필터링" },
    { name: "나만의 커스텀 전략", desc: "6가지 가중치 파라미터를 조합하여 나만의 전략 저장" },
    { name: "클라우드 자동 동기화", desc: "LocalStorage ↔ Supabase Cloud 데이터 상호 동기화" },
    { name: "과거 시뮬레이션 백테스트", desc: "역대 1,236개 회차 데이터를 바탕으로 전략 검증" },
  ];

  const excludedScope = [
    "실제 복권 매매 및 판매 행위",
    "복권 구매 대행 및 수수료 수취",
    "당첨금 지급 및 상금 분배",
    "미래 당첨 번호 일점 예측 및 1등 적중 보장",
    "투기 및 재산상 수익 유도",
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      <Header title="서비스 소개" showBackButton={true} backHref="/my" />

      <main className="flex-1 w-full max-w-md mx-auto px-5 pt-6 pb-6 space-y-6">
        {/* Title Hero */}
        <section className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 text-white rounded-3xl p-6 shadow-lg space-y-3 relative overflow-hidden">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>SMART LOTTO STRATEGY TOOL</span>
          </div>
          <h1 className="text-2xl font-black text-white leading-tight">
            데이터 분석과 나만의 전략으로 <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
              스마트하게 조합하세요
            </span>
          </h1>
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            LOTTO STRATEGY는 대한민국 동행복권 로또 6/45의 제1회부터 현재까지 공개된 역대 당첨 데이터를 통계적으로 시각화하고 나만의 필터 전략을 만드는 스마트 웹 서비스입니다.
          </p>
        </section>

        {/* Feature List Grid */}
        <section className="w-full bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>주요 핵심 기능 명세</span>
          </h2>

          <div className="space-y-2.5 divide-y divide-slate-100">
            {coreFeatures.map((feat, idx) => (
              <div key={feat.name} className={idx > 0 ? "pt-2.5" : ""}>
                <div className="flex items-center gap-1.5 font-extrabold text-xs text-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{feat.name}</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium pl-5 pt-0.5">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Excluded Scope Warning Card */}
        <section className="w-full bg-rose-50/70 border border-rose-200/80 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-rose-800 font-black text-xs">
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>서비스 미제공 범위 (하지 않는 것)</span>
          </div>

          <ul className="space-y-1.5 text-xs text-rose-900 font-medium pl-1">
            {excludedScope.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Data Source Notice */}
        <section className="w-full bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2 text-xs">
          <div className="flex items-center gap-2 font-extrabold text-slate-800">
            <Database className="w-4 h-4 text-blue-500" />
            <span>데이터 출처 및 무결성</span>
          </div>
          <p className="text-slate-600 leading-relaxed font-medium">
            동행복권 공식 공개 API 및 검증 데이터 1,236회차 전체를 수집하여 무결성을 검증한 데이터셋(`src/data/lotto-draws.json`)을 기반으로 운영됩니다.
          </p>
        </section>

        <ServiceDisclaimer variant="full" />
      </main>

      <Footer />
      <BottomNavigation />
    </div>
  );
}
