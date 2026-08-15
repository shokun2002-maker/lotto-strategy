import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-5">
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-extrabold text-slate-500 tracking-tight">
          로딩 중...
        </span>
      </div>
    </div>
  );
}
