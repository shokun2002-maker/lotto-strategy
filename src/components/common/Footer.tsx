import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-slate-400 text-xs py-8 px-5 mt-auto border-t border-slate-800">
      <div className="max-w-md mx-auto space-y-4">
        {/* Brand & Subtitle */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 font-black text-white text-sm tracking-tight">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>LOTTO STRATEGY</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            로또 6/45 공개 과거 데이터 기반 번호 조합 및 전략 분석 도구
          </p>
        </div>

        {/* Policy Page Links */}
        <nav className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-bold text-slate-300">
          <Link href="/service-info" className="hover:text-amber-400 transition-colors">
            서비스 소개
          </Link>
          <span className="text-slate-700">|</span>
          <Link href="/terms" className="hover:text-amber-400 transition-colors">
            이용약관
          </Link>
          <span className="text-slate-700">|</span>
          <Link href="/privacy" className="hover:text-amber-400 font-extrabold text-slate-200 hover:underline transition-colors">
            개인정보처리방침
          </Link>
          <span className="text-slate-700">|</span>
          <Link href="/refund-policy" className="hover:text-amber-400 transition-colors">
            환불/해지 정책
          </Link>
          <span className="text-slate-700">|</span>
          <Link href="/disclaimer" className="hover:text-amber-400 transition-colors">
            면책고지
          </Link>
        </nav>

        {/* Company / Operating Info */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[10px] text-slate-400 font-medium leading-relaxed">
          <p>운영 주체: 글로컬소프트 (GlocalSoft)</p>
          <p>
            LOTTO STRATEGY는 복권 판매업체 또는 구매 대행업체가 아니며, 당첨을 보장하지 않습니다. 복권 구매는 이용자 본인의 자율적 판단에 따릅니다.
          </p>
          <p className="text-slate-400 pt-1">
            © 2026 LOTTO STRATEGY. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
