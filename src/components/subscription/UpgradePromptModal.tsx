"use client";

import React from "react";
import Link from "next/link";
import { Crown, Sparkles, X, ArrowRight, CheckCircle2 } from "lucide-react";

interface UpgradePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  featureName?: string;
}

export default function UpgradePromptModal({
  isOpen,
  onClose,
  title = "PRO에서 사용할 수 있는 기능이에요",
  description = "나만의 전략 저장, 3·5게임 생성, 고급 분석을 자유롭게 이용할 수 있어요.",
  featureName,
}: UpgradePromptModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Crown Banner */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Crown className="w-8 h-8 fill-amber-100 text-amber-50" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-extrabold border border-amber-200">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>LOTTO STRATEGY PRO</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 leading-tight">
              {title}
            </h3>
          </div>

          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs">
            {featureName ? (
              <>
                <strong className="text-slate-800 font-bold">[{featureName}]</strong> 기능은 PRO 요금제에서 지원됩니다. {description}
              </>
            ) : (
              description
            )}
          </p>
        </div>

        {/* Highlighted Benefits */}
        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/70 space-y-2 text-xs text-slate-700 font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
            <span>나만의 맞춤 전략 다중 저장</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
            <span>3게임 / 5게임 번호 일괄 생성</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
            <span>고급 개인 분석 & 백테스트</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2 pt-1">
          <Link
            href="/pro"
            onClick={onClose}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <span>PRO 알아보기</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={onClose}
            className="w-full h-10 rounded-xl text-slate-500 hover:bg-slate-100 font-bold text-xs transition-all cursor-pointer"
          >
            다음에 하기
          </button>
        </div>
      </div>
    </div>
  );
}
