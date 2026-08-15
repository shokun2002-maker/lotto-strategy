import React from "react";
import { Info, AlertTriangle, ShieldCheck } from "lucide-react";

interface ServiceDisclaimerProps {
  variant?: "compact" | "full";
  className?: string;
}

export default function ServiceDisclaimer({
  variant = "compact",
  className = "",
}: ServiceDisclaimerProps) {
  if (variant === "compact") {
    return (
      <div
        className={`w-full bg-slate-100/80 border border-slate-200/70 rounded-xl p-3 flex items-start gap-2.5 text-slate-500 text-xs ${className}`}
      >
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-medium">
          LOTTO STRATEGY는 과거 공개 데이터를 분석하는 전략 분석 도구이며 복권을 직접 판매하지 않고 당첨을 보장하지 않습니다.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`w-full bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3.5 ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
          서비스 성격 및 법적 면책 고지 (Legal Disclaimer)
        </h3>
      </div>

      <div className="space-y-2.5 text-xs text-slate-600 font-medium leading-relaxed">
        <div className="flex items-start gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-800">과거 데이터 분석 도구:</strong> 본 서비스는 동행복권의 로또 6/45 공개 과거 추첨 데이터를 바탕으로 통계 및 사용자 맞춤 전략 설정을 제공하는 단순 참고 분석 소프트웨어입니다.
          </p>
        </div>

        <div className="flex items-start gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-800">복권 미판매 및 미구매대행:</strong> LOTTO STRATEGY는 복권을 직접 판매하거나 구매를 대행하지 않으며, 실제 복권 구매는 동행복권 공식 판매처를 통해 이용자가 직접 진행해야 합니다.
          </p>
        </div>

        <div className="flex items-start gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-800">당첨 확률 미보장:</strong> 로또 추첨은 매회 독립적인 무작위 확률로 진행되며, 과거 출현 데이터나 통계 전략이 미래의 추첨 결과나 당첨 가능성을 결코 보장하지 않습니다.
          </p>
        </div>

        <div className="flex items-start gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-800">이용자 독립 책임:</strong> 제공되는 추천 번호 및 분석 결과 활용에 따른 복권 구매 여부와 모든 선택의 책임은 이용자 본인에게 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
