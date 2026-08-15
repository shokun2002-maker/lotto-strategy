import React from "react";
import Link from "next/link";
import Header from "@/components/common/Header";
import BottomNavigation from "@/components/common/BottomNavigation";
import { HelpCircle, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      <Header title="페이지 없음" showBackButton={true} backHref="/" />

      <main className="flex-1 max-w-md mx-auto w-full px-5 flex flex-col items-center justify-center text-center space-y-5 my-auto py-12">
        <div className="w-16 h-16 rounded-3xl bg-amber-100/80 border border-amber-200 text-amber-600 flex items-center justify-center shadow-xs">
          <HelpCircle className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-black text-amber-600 uppercase tracking-widest block">
            404 NOT FOUND
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            요청하신 페이지를 찾을 수 없어요
          </h1>
          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
            주소가 잘못 입력되었거나 삭제 또는 이동되었을 수 있습니다. 아래 버튼을 눌러 홈으로 이동해 주세요.
          </p>
        </div>

        <div className="pt-2 w-full max-w-xs space-y-2">
          <Link
            href="/"
            className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Home className="w-4 h-4 text-amber-400" />
            <span>메인 홈으로 돌아가기</span>
          </Link>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
