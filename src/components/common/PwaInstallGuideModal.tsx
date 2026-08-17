"use client";

import React, { useState } from "react";
import { Smartphone, X, Check, Copy, Info } from "lucide-react";

interface PwaInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PwaInstallGuideModal({ isOpen, onClose }: PwaInstallGuideModalProps) {
  const [activeTab, setActiveTab] = useState<"ios" | "android">(() => {
    if (typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent)) {
      return "android";
    }
    return "ios";
  });

  const [isKakaoInApp] = useState<boolean>(() => {
    if (typeof navigator !== "undefined") {
      return /KAKAOTALK/i.test(navigator.userAgent);
    }
    return false;
  });

  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText("https://lotto-strategy.vercel.app");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden space-y-4 p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">홈 화면에 앱 설치하기</h2>
              <p className="text-[11px] text-slate-500 font-medium">스마트폰 홈 화면에서 전용 앱처럼 사용하세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* KakaoTalk In-App Notice */}
        {isKakaoInApp && (
          <div className="bg-blue-50 border border-blue-200/80 rounded-2xl p-3.5 space-y-1.5 text-xs text-blue-900">
            <div className="flex items-center gap-1.5 font-bold text-blue-700">
              <Info className="w-4 h-4 shrink-0 text-blue-600" />
              <span>카카오톡 화면 이용 안내</span>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
              현재 카카오톡 화면에서도 <strong>모든 추천 및 저장 기능</strong>을 바로 사용하실 수 있습니다!
              홈 화면 앱 설치를 원하실 경우 아래 주소를 복사하여 <strong>Safari</strong>나 <strong>Chrome</strong> 브라우저에서 열어주세요.
            </p>
            <div className="pt-1 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value="https://lotto-strategy.vercel.app"
                className="flex-1 px-2.5 py-1.5 rounded-xl bg-white border border-blue-200 text-[11px] font-mono text-slate-700 select-all"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-1 shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "복사됨" : "주소 복사"}</span>
              </button>
            </div>
          </div>
        )}

        {/* OS Selector Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setActiveTab("ios")}
            className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${
              activeTab === "ios"
                ? "bg-white text-blue-600 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            아이폰 (iOS / Safari)
          </button>
          <button
            onClick={() => setActiveTab("android")}
            className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${
              activeTab === "android"
                ? "bg-white text-blue-600 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            안드로이드 (Android / Chrome)
          </button>
        </div>

        {/* Instructions Body */}
        {activeTab === "ios" ? (
          <div className="space-y-2.5 text-xs text-slate-700 font-medium">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center shrink-0">1</span>
              <p className="leading-snug">
                <strong>Safari 브라우저</strong>로 접속합니다. <br />
                <span className="text-[11px] text-slate-500">(카카오톡에서는 Safari로 열기를 실행해 주세요)</span>
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center shrink-0">2</span>
              <p className="leading-snug">
                하단 중앙의 <strong>공유 버튼([↑])</strong>을 선택합니다.
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center shrink-0">3</span>
              <p className="leading-snug">
                메뉴 목록을 내려 <strong>&apos;홈 화면에 추가&apos;</strong> 항목을 누릅니다.
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center shrink-0">4</span>
              <p className="leading-snug">
                우측 상단 <strong>&apos;추가&apos;</strong>를 누르면 노란색 <strong>로또전략</strong> 앱 아이콘이 생성됩니다.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 text-xs text-slate-700 font-medium">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center shrink-0">1</span>
              <p className="leading-snug">
                <strong>Chrome 브라우저</strong>로 접속합니다.
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center shrink-0">2</span>
              <p className="leading-snug">
                우측 상단의 <strong>메뉴 버튼(⋮)</strong>을 선택합니다.
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center shrink-0">3</span>
              <p className="leading-snug">
                <strong>&apos;앱 설치&apos;</strong> 또는 <strong>&apos;홈 화면에 추가&apos;</strong>를 누릅니다.
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center shrink-0">4</span>
              <p className="leading-snug">
                팝업의 <strong>&apos;설치&apos;</strong>를 확인하면 스마트폰 홈 화면에 아이콘이 추가됩니다.
              </p>
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-900 text-white text-xs font-extrabold hover:bg-slate-800 transition-all"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
}
