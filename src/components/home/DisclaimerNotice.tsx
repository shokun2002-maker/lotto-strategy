"use client";

import React from "react";
import { Info } from "lucide-react";

export default function DisclaimerNotice() {
  return (
    <div className="w-full bg-slate-100/70 border border-slate-200/60 rounded-xl p-3.5 flex items-start gap-2.5 text-slate-500 text-xs">
      <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
      <p className="leading-relaxed font-medium">
        번호 조합 및 분석 정보는 참고용이며 실제 당첨을 예측하거나 보장하지 않습니다.
      </p>
    </div>
  );
}
