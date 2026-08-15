import React from "react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import BottomNavigation from "@/components/common/BottomNavigation";
import ServiceDisclaimer from "@/components/common/ServiceDisclaimer";
import { Metadata } from "next";
import { RefreshCw, ShieldAlert, CreditCard, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "환불 및 해지 정책 | LOTTO STRATEGY",
  description: "LOTTO STRATEGY 유료 서비스 구독 해지 및 환불 정책 가이드라인 - PG 심사 및 출시 전 사전 안내",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      <Header title="환불 / 해지 정책" showBackButton={true} backHref="/my" />

      <main className="flex-1 w-full max-w-md mx-auto px-5 pt-6 pb-6 space-y-6">
        {/* Title Header */}
        <section className="w-full bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-600 font-extrabold text-xs">
            <RefreshCw className="w-4 h-4" />
            <span>REFUND & CANCELLATION POLICY</span>
          </div>
          <h1 className="text-xl font-black text-slate-900">환불 및 구독 해지 정책</h1>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            시행예정일: 정식 결제 서비스 출시일 | 본 정책은 유료서비스 이용 시 적용될 환불 및 해지 기준의 기본 가이드라인입니다.
          </p>
        </section>

        {/* Current Status Alert Box */}
        <section className="w-full bg-blue-50 border border-blue-200/80 rounded-2xl p-4 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-blue-900">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>결제 서비스 출시 준비 중 안내</span>
          </div>
          <p className="text-blue-900/90 font-medium leading-relaxed">
            현재 LOTTO STRATEGY는 결제 서비스 연동 전 단계이며, 실제 실결제가 발생하지 않는 <strong>"결제 서비스 준비 중"</strong> 상태입니다. 정식 PG 계약 및 심사 완료 시 최종 세부 환불 규정이 확정 고지됩니다.
          </p>
        </section>

        {/* Policy Articles */}
        <section className="w-full bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-5 text-xs text-slate-700 leading-relaxed font-medium">
          <article className="space-y-1.5">
            <h2 className="font-extrabold text-sm text-slate-900">1. 정기구독 해지 및 이용 기간</h2>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>월간 정기구독 결제 후 구독 해지 신청 시, 즉시 이용 권한이 중단되지 않고 <strong>해당 결제 주기 만료일(current_period_end)까지 PRO 혜택이 정상 유지</strong>됩니다.</li>
              <li>해지 신청 시 다음 결제 주기의 자동 결제가 차단됩니다.</li>
            </ul>
          </article>

          <article className="space-y-1.5">
            <h2 className="font-extrabold text-sm text-slate-900">2. 단건 및 기간제 이용권(Access Pass) 환불 기준</h2>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>기간제 이용권(7일/30일 패스 등) 및 단건 이용권의 청약철회 및 환불은 전자상거래 등에서의 소비자보호에 관한 법률 등 관계 법령 및 PG사 정책에 따라 산정됩니다.</li>
              <li>서비스 미사용 건 및 중도 해지 환불 수수료 적용 기준은 정식 결제 오픈 시 최종 고지됩니다.</li>
            </ul>
          </article>

          <article className="space-y-1.5">
            <h2 className="font-extrabold text-sm text-slate-900">3. 데이터 보존 및 삭제 정책</h2>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-amber-900 font-medium">
              구독 해지 또는 요금제 변경만으로 저장 데이터가 즉시 삭제되지는 않습니다. 단, 이용자의 계정 삭제(회원 탈퇴), 서비스 종료, 관계 법령 또는 개인정보처리방침의 보관기간 도과 등에 따라 삭제될 수 있습니다.
            </div>
          </article>

          <article className="space-y-1.5">
            <h2 className="font-extrabold text-sm text-slate-900">4. 환불 신청 절차</h2>
            <p>
              정식 결제 오픈 후 고객센터 또는 [/my] 내 구독 관리 메뉴를 통해 해지 및 환불을 신청할 수 있습니다.
            </p>
          </article>
        </section>

        <ServiceDisclaimer variant="compact" />
      </main>

      <Footer />
      <BottomNavigation />
    </div>
  );
}
