import React from "react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import BottomNavigation from "@/components/common/BottomNavigation";
import ServiceDisclaimer from "@/components/common/ServiceDisclaimer";
import { Metadata } from "next";
import { AlertTriangle, ShieldCheck, Scale, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "면책 고지 | LOTTO STRATEGY",
  description: "LOTTO STRATEGY 법적 면책 고지 - 과거 데이터 분석 도구 성격, 당첨 미보장 및 자율적 복권 구매 고지",
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      <Header title="면책 고지" showBackButton={true} backHref="/my" />

      <main className="flex-1 w-full max-w-md mx-auto px-5 pt-6 pb-6 space-y-6">
        {/* Header Title */}
        <section className="w-full bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-600 font-extrabold text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>DISCLAIMER</span>
          </div>
          <h1 className="text-xl font-black text-slate-900">법적 면책 고지 (Legal Disclaimer)</h1>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            LOTTO STRATEGY 이용 시 반드시 숙지해야 하는 서비스 이용 관련 법적 면책사항 안내입니다.
          </p>
        </section>

        {/* Detailed Disclaimer Card Component */}
        <ServiceDisclaimer variant="full" />

        {/* Additional Q&A Disclaimer List */}
        <section className="w-full bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
            <Scale className="w-4 h-4 text-blue-600" />
            <span>자주 묻는 면책 관련 사항</span>
          </h2>

          <div className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>추천받은 번호로 구매하면 1등 당첨 확률이 높아지나요?</span>
              </h3>
              <p className="text-slate-600 font-medium leading-relaxed pl-5">
                아닙니다. 로또 6/45의 추첨 방식은 기계식 독립 무작위 추출입니다. 과거에 특정 번호가 자주 나왔다고 해서 다음 추첨에서 해당 번호가 나올 확률이 물리적으로 증가하지 않습니다. 본 서비스의 추천 번호는 사용자의 필터링 선호도를 반영한 단순 통계 참고 조합입니다.
              </p>
            </div>

            <div className="space-y-1 border-t border-slate-100 pt-3">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>서비스에서 바로 로또 복권을 구매할 수 있나요?</span>
              </h3>
              <p className="text-slate-600 font-medium leading-relaxed pl-5">
                아닙니다. 본 서비스는 복권 판매업이나 결제 대행을 수행하지 않습니다. 조합된 번호를 저장하고 확인하는 분석 소프트웨어이며, 실제 복권 구매는 동행복권 온/오프라인 공식 판매처를 통해 이용자가 직접 진행하셔야 합니다.
              </p>
            </div>

            <div className="space-y-1 border-t border-slate-100 pt-3">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>복권 구매 관련 연령 및 책임 안내</span>
              </h3>
              <p className="text-slate-600 font-medium leading-relaxed pl-5">
                대한민국 복권 및 복권기금법에 따라 만 19세 미만 청소년은 복권을 구매할 수 없습니다. 이용자는 본인의 책임하에 건전하고 절제된 복권 문화를 준수해야 합니다.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <BottomNavigation />
    </div>
  );
}
