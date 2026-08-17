import React from "react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import BottomNavigation from "@/components/common/BottomNavigation";
import ServiceDisclaimer from "@/components/common/ServiceDisclaimer";
import { Metadata } from "next";
import { Lock, ShieldCheck, Database, HardDrive, Cookie } from "lucide-react";

export const metadata: Metadata = {
  title: "개인정보처리방침 | LOTTO STRATEGY",
  description: "LOTTO STRATEGY 개인정보처리방침 안내 - 회원가입, Kakao OAuth, LocalStorage 및 클라우드 동기화 개인정보 보호 조치 명세",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      <Header title="개인정보처리방침" showBackButton={true} backHref="/my" />

      <main className="flex-1 w-full max-w-md mx-auto px-5 pt-6 pb-6 space-y-6">
        {/* Title Header */}
        <section className="w-full bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-xs">
            <Lock className="w-4 h-4" />
            <span>PRIVACY POLICY</span>
          </div>
          <h1 className="text-xl font-black text-slate-900">개인정보처리방침</h1>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            시행일: 2026년 8월 15일 | LOTTO STRATEGY는 이용자의 개인정보 수집을 최소화하며 안전하게 관리합니다.
          </p>
        </section>

        {/* Technical Infrastructure Summary */}
        <section className="w-full bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <h2 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>데이터 처리 및 보관 방식</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-800">
                <HardDrive className="w-3.5 h-3.5 text-blue-500" />
                <span>비회원 (LocalStorage)</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                서버로 데이터를 전송하지 않으며 이용자 브라우저 LocalStorage에만 보관됩니다.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-800">
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                <span>회원 (Supabase Cloud)</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Supabase Auth/DB 인프라를 통해 암호화 저장 및 양방향 Cloud Sync가 수행됩니다.
              </p>
            </div>
          </div>
        </section>

        {/* Content Articles */}
        <section className="w-full bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-5 text-xs text-slate-700 leading-relaxed font-medium">
          <article className="space-y-1.5">
            <h2 className="font-extrabold text-sm text-slate-900">1. 수집하는 개인정보 항목 및 방법</h2>
            <p className="pb-1">회사는 최소한의 정보만을 수집합니다:</p>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li><strong>이메일 회원가입 시:</strong> 이메일 주소, 암호화된 비밀번호 식별자</li>
              <li><strong>카카오 OAuth 로그인 시:</strong> 카카오 계정 고유 식별값(ID), 닉네임/프로필(선택)</li>
              <li><strong>서비스 이용 및 동기화 시:</strong> Supabase User UUID, 저장 번호 조합, 저장 커스텀 전략, 요금제 entitlement 상태</li>
            </ul>
          </article>

          <article className="space-y-1.5">
            <h2 className="font-extrabold text-sm text-slate-900">2. 개인정보의 수집 및 이용 목적</h2>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>회원 식별 및 로그인 세션 유지</li>
              <li>저장 번호 및 커스텀 전략 클라우드 자동 동기화 (Cloud Sync)</li>
              <li>FREE / PRO 요금제 권한 확인 및 기능 제한 적용</li>
            </ul>
          </article>

          <article className="space-y-1.5">
            <h2 className="font-extrabold text-sm text-slate-900">3. 쿠키(Cookie) 및 세션 활용</h2>
            <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              <Cookie className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-600 leading-relaxed">
                서비스는 Supabase Auth 세션 유지를 위해 필요 최소한의 보안 쿠키를 사용합니다. 브라우저 설정을 통해 쿠키 수신을 거부할 수 있으나, 이 경우 로그인 서비스 이용이 제한될 수 있습니다.
              </p>
            </div>
          </article>

          <article className="space-y-1.5">
            <h2 className="font-extrabold text-sm text-slate-900">4. 개인정보의 보유 및 파기</h2>
            <p>
              이용자는 MY 페이지 내 &apos;회원 탈퇴&apos; 기능을 통해 언제든지 본인의 계정 및 클라우드 동기화 데이터의 즉시 파기를 요청할 수 있습니다. 회원 탈퇴 시 Supabase 인증 프로필, 클라우드 저장 번호 및 전략, 이용권(Entitlement) 상태는 즉시 영구 삭제 처리되며, 기기 내 로컬 저장 데이터도 함께 정리됩니다.
            </p>
          </article>

          <article className="space-y-1.5">
            <h2 className="font-extrabold text-sm text-slate-900">5. 제3자 제공 및 위탁</h2>
            <p>
              회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 서비스의 원활한 운영을 위해 아래의 보안 인프라 제공업체에 저장을 위탁합니다:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li><strong>수탁업체:</strong> Supabase, Inc. (클라우드 인증 및 DB 인프라)</li>
            </ul>
          </article>

          <article className="space-y-1.5">
            <h2 className="font-extrabold text-sm text-slate-900">6. 개인정보 보호책임자</h2>
            <p>
              개인정보 보호 문의: 글로컬소프트 개인정보 보호팀 (glocalsoft@geullokeolsopeuteuui-Macmini.local)
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
