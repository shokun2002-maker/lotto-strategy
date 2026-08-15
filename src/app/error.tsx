"use client";

import React, { useEffect } from "react";
import Header from "@/components/common/Header";
import BottomNavigation from "@/components/common/BottomNavigation";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error internally for debugging without exposing raw trace to user UI
    console.error("Application runtime error caught by boundary:", error.message);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      <Header title="오류 발생" showBackButton={true} backHref="/" />

      <main className="flex-1 max-w-md mx-auto w-full px-5 flex flex-col items-center justify-center text-center space-y-5 my-auto py-12">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shadow-xs">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-black text-rose-600 uppercase tracking-widest block">
            TEMPORARY ERROR
          </span>
          <h1 className="text-xl font-black text-slate-900">
            일시적인 오류가 발생했어요
          </h1>
          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
            요청을 처리하는 도중 일시적인 네트워크 오류가 발생했습니다. 아래 버튼을 눌러 다시 시도해 주세요.
          </p>
        </div>

        <div className="pt-2 w-full max-w-xs space-y-2">
          <button
            onClick={() => reset()}
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>다시 시도하기</span>
          </button>

          <Link
            href="/"
            className="w-full h-10 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>홈으로 이동</span>
          </Link>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
