"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquare, X, Send, AlertTriangle, CheckCircle2 } from "lucide-react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const pathname = usePathname();
  const [category, setCategory] = useState<"general" | "bug" | "ux" | "feature">("general");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [lastSubmittedTime, setLastSubmittedTime] = useState<number>(0);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 2) {
      setStatusMsg({ type: "error", text: "의견 내용을 최소 2자 이상 입력해 주세요." });
      return;
    }

    const now = Date.now();
    if (now - lastSubmittedTime < 5000) {
      const waitSec = Math.ceil((5000 - (now - lastSubmittedTime)) / 1000);
      setStatusMsg({
        type: "error",
        text: `피드백 연속 전송 방지를 위해 ${waitSec}초 후 다시 시도해 주세요.`,
      });
      return;
    }

    setSubmitting(true);
    setStatusMsg(null);

    try {
      // 환경 정보 요약 파싱
      const deviceType = window.innerWidth <= 640 ? "Mobile" : "Desktop";
      const os = navigator.userAgent.includes("iPhone")
        ? "iOS"
        : navigator.userAgent.includes("Android")
        ? "Android"
        : "Other OS";
      const browser = navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome")
        ? "Safari"
        : navigator.userAgent.includes("Chrome")
        ? "Chrome"
        : "Browser";
      const appMode = window.matchMedia("(display-mode: standalone)").matches ? "Standalone PWA" : "Browser Web";

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          message,
          page: pathname,
          deviceType,
          os,
          browser,
          appMode,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatusMsg({ type: "error", text: data.error || "의견 전송에 실패했습니다. 잠시 후 다시 시도해 주세요." });
        setSubmitting(false);
        return;
      }

      setStatusMsg({ type: "success", text: "소중한 의견을 공유해 주셔서 감사합니다!" });
      setLastSubmittedTime(Date.now());
      setMessage("");
      setTimeout(() => {
        setStatusMsg(null);
        onClose();
      }, 1500);
    } catch {
      setStatusMsg({ type: "error", text: "네트워크 오류로 의견 전송에 실패했습니다." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden space-y-4 p-5 sm:p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">베타 의견 보내기</h2>
              <p className="text-[11px] text-slate-500 font-medium">서비스 개선을 위한 의견을 자유롭게 남겨주세요</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">분류</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "general", label: "일반 / 기타" },
                { key: "bug", label: "오류 / 버그" },
                { key: "ux", label: "사용 불편함" },
                { key: "feature", label: "기능 제안" },
              ].map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key as "general" | "bug" | "ux" | "feature")}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    category === cat.key
                      ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message Textarea */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700">의견 내용</label>
              <span className="text-[10px] text-slate-400 font-medium">{message.length} / 2,000자</span>
            </div>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="개선이 필요한 부분이나 버그 현상을 자유롭게 작성해 주세요."
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-all resize-none"
            />
          </div>

          {/* Privacy Warning Notice */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 flex items-start gap-2 text-[11px] text-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-tight font-medium">
              비밀번호, 카드번호, 주민등록번호 등 민감한 개인정보는 작성하지 말아 주세요.
            </p>
          </div>

          {/* Status Message Toast */}
          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                statusMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {statusMsg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-extrabold shadow-xs shadow-blue-500/30 hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? "전송 중..." : "의견 보내기"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
