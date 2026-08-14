"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

interface HeaderProps {
  roundNumber?: number;
  dDayText?: string;
  showBackButton?: boolean;
  title?: string;
  backHref?: string;
}

export default function Header({
  roundNumber = 1133,
  dDayText = "추첨까지 D-3",
  showBackButton = false,
  title,
  backHref = "/",
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-100/80 transition-all">
      <div className="max-w-md mx-auto px-5 h-14 flex items-center justify-between">
        {/* Left Side: Back button or Brand logo */}
        <div className="flex items-center gap-2.5">
          {showBackButton ? (
            <Link
              href={backHref}
              className="p-1.5 -ml-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              aria-label="뒤로가기"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
              {title && (
                <span className="font-bold text-slate-900 text-base">
                  {title}
                </span>
              )}
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs shadow-blue-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold tracking-tight text-slate-900 text-lg">
                LOTTO <span className="text-blue-600 font-black">STRATEGY</span>
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Round Badge Info */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/60 text-xs font-semibold text-slate-600">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          <span>제 {roundNumber}회</span>
          <span className="text-slate-300">•</span>
          <span className="text-blue-600 font-bold">{dDayText}</span>
        </div>
      </div>
    </header>
  );
}
