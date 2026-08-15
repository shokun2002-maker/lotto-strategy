import React from "react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import BottomNavigation from "@/components/common/BottomNavigation";
import ServiceDisclaimer from "@/components/common/ServiceDisclaimer";
import { Metadata } from "next";
import { FileText, ShieldAlert, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "서비스 이용약관 | LOTTO STRATEGY",
  description: "LOTTO STRATEGY 서비스 이용약관 안내 - 로또 6/45 공개 과거 데이터 분석 도구 명세 및 이용조건",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      <Header title="서비스 이용약관" showBackButton={true} backHref="/my" />

      <main className="flex-1 w-full max-w-md mx-auto px-5 pt-6 pb-6 space-y-6">
        {/* Title Header */}
        <section className="w-full bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-blue-600 font-extrabold text-xs">
            <FileText className="w-4 h-4" />
            <span>TERMS OF SERVICE</span>
          </div>
          <h1 className="text-xl font-black text-slate-900">LOTTO STRATEGY 이용약관</h1>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            시행일: 2026년 8월 15일 | 본 약관은 이용자가 본 서비스를 이용함에 있어 필요한 권리, 의무 및 책임사항을 규정합니다.
          </p>
        </section>

        {/* Highlight Notice Box */}
        <section className="w-full bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>핵심 서비스 성격 고지</span>
          </div>
          <ul className="space-y-1 text-amber-900 font-medium pl-5 list-disc leading-relaxed">
            <li>LOTTO STRATEGY는 과거 공개 데이터를 활용한 <strong>통계 분석 및 번호 조합 전략 도구</strong>입니다.</li>
            <li>본 서비스는 <strong>복권을 판매하거나 구매를 대행하지 않습니다.</strong></li>
            <li>본 서비스는 <strong>당첨이나 당첨 확률의 상승을 결코 보장하지 않습니다.</strong></li>
          </ul>
        </section>

        {/* Content Articles */}
        <section className="w-full bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-5 text-xs text-slate-700 leading-relaxed font-medium">
          <article className="space-y-1.5">
            <h2 className="font-extrabold text-sm text-slate-900">제1조 (목적)</h2>
            <p>
              본 약관은 글로컬소프트(이하 "회사")가 제공하는 웹 서비스 "LOTTO STRATEGY"(이하 "서비스")의 이용조건, 절차 및 이용자와 회사 간의 권리와 의무를 규정함을 목적으로 합니다.
            </p>
          </article>

          <article className="space-y-1.5">
            <h2 className="font-extrabold text-sm text-slate-900">제2조 (용어의 정의)</h2>
            <ol className="list-decimal pl-4 space-y-1">
              <li>"서비스"라 함은 회사가 제공하는 로또 6/45 통계 분석, 커스텀 전략 설정, 번호 조합 생성 및 클라우드 동기화 기능을 의미합니다.</li>
              <li>"이용자"라 함은 본 약관에 따라 서비스를 이용하는 회원 및 비회원(Guest)을 말합니다.</li>
              <li>"FREE 요금제"라 함은 기본 분석 및 1개 전략 저장을 무료로 제공하는 서비스 등급입니다.</li>
              <li>"PRO 요금제"라 함은 커스텀 전략 다중 저장(최대 20개), 3·5게임 생성 등 고급 기능을 제공하는 서비스 등급입니다.</li>
            </ol>
          </article>

          <article className="space-y-1.5">
            <h2 className="font-extrabold text-sm text-slate-900">제3조 (서비스 범위 및 제한)</h2>
            <ol className="list-decimal pl-4 space-y-1">
              <li>서비스는 동행복권이 제공하는 공개 회차 데이터 기반으로 운영됩니다.</li>
              <li>모든 추천 번호는 통계 모형에 따른 수학적 알고리즘 조합이며, 미래의 무작위 추첨 결과를 예측하거나 당첨을 보장하지 않습니다.</li>
              <li>실제 복권의 구매는 동행복권 공식 판매처를 통해서만 가능하며, 서비스 내에서는 어떠한 복권 매매나 대행도 제공되지 않습니다.</li>
            </ol>
          </article>

          <article className="space-y-1.5">
            <h2 className="font-extrabold text-sm text-slate-900">제4조 (계정 및 데이터 보관)</h2>
            <ol className="list-decimal pl-4 space-y-1">
              <li>비회원의 저장 데이터는 이용자 브라우저의 LocalStorage에 보관됩니다.</li>
              <li>회원은 Supabase Auth 인프라를 통해 로그인할 수 있으며, 이메일 및 Kakao OAuth 세션을 통해 데이터를 클라우드와 상호 동기화할 수 있습니다.</li>
              <li>구독 해지 또는 요금제 변경만으로 저장 데이터가 즉시 삭제되지는 않으나, 이용자의 계정 삭제(회원 탈퇴), 서비스 종료, 관계 법령 또는 개인정보처리방침의 보관기간 도과 등에 따라 파기될 수 있습니다.</li>
              <li>이용자는 본인의 계정 및 기기 관리 책임을 집니다.</li>
            </ol>
          </article>

          <article className="space-y-1.5">
            <h2 className="font-extrabold text-sm text-slate-900">제5조 (유료서비스 적용 원칙 및 결제)</h2>
            <p>
              향후 유료서비스(PRO 정기구독 또는 기간제 이용권) 도입 시, 결제 완료 및 서버 검증(Server Verification)에 의해서만 권한이 부여되며, 회사는 유료서비스 제공 전 구체적인 요금과 조건을 명시합니다.
            </p>
          </article>

          <article className="space-y-1.5">
            <h2 className="font-extrabold text-sm text-slate-900">제6조 (면책 조항)</h2>
            <ol className="list-decimal pl-4 space-y-1">
              <li>회사는 천재지변, 데이터 원본 파손, 서비스 점검 등으로 인한 서비스 제공 불가 시 책임을 지지 않습니다.</li>
              <li>이용자가 서비스의 분석 결과를 바탕으로 결정한 복권 구매 행동 및 결과에 대해 회사는 일체의 손해배상 책임을 지지 않습니다.</li>
            </ol>
          </article>
        </section>

        {/* Disclaimer Component */}
        <ServiceDisclaimer variant="full" />
      </main>

      <Footer />
      <BottomNavigation />
    </div>
  );
}
