"use client";

import React from "react";

export interface LottoBallProps {
  number: number;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  badgeText?: string;
  isUserPick?: boolean;
  className?: string;
}

/**
 * 로또 번호 1~45를 원형 UI로 표현하는 재사용 가능한 컴포넌트
 */
export const getBallColorStyle = (num: number) => {
  if (num >= 1 && num <= 10) {
    return {
      bg: "bg-amber-500",
      text: "text-white",
      border: "border-amber-400",
      lightBg: "bg-amber-50 text-amber-700 border-amber-200",
    };
  } else if (num >= 11 && num <= 20) {
    return {
      bg: "bg-blue-500",
      text: "text-white",
      border: "border-blue-400",
      lightBg: "bg-blue-50 text-blue-700 border-blue-200",
    };
  } else if (num >= 21 && num <= 30) {
    return {
      bg: "bg-rose-500",
      text: "text-white",
      border: "border-rose-400",
      lightBg: "bg-rose-50 text-rose-700 border-rose-200",
    };
  } else if (num >= 31 && num <= 40) {
    return {
      bg: "bg-slate-600",
      text: "text-white",
      border: "border-slate-500",
      lightBg: "bg-slate-100 text-slate-700 border-slate-300",
    };
  } else if (num >= 41 && num <= 45) {
    return {
      bg: "bg-emerald-500",
      text: "text-white",
      border: "border-emerald-400",
      lightBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }
  
  return {
    bg: "bg-slate-400",
    text: "text-white",
    border: "border-slate-300",
    lightBg: "bg-slate-50 text-slate-600 border-slate-200",
  };
};

export default function LottoBall({
  number,
  size = "md",
  selected = false,
  badgeText,
  isUserPick,
  className = "",
}: LottoBallProps) {
  const styles = getBallColorStyle(number);

  const sizeClasses = {
    sm: "w-6.5 h-6.5 sm:w-7 sm:h-7 text-[11px] sm:text-xs font-bold",
    md: "w-8 h-8 sm:w-9 sm:h-9 text-xs sm:text-sm font-extrabold",
    lg: "w-9.5 h-9.5 sm:w-11 sm:h-11 text-sm sm:text-base font-extrabold",
  }[size];

  // User pick visual highlight ring
  const userPickRingClass = isUserPick
    ? "ring-2 ring-blue-600 ring-offset-2"
    : "";

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <div
        className={`
          inline-flex items-center justify-center rounded-full transition-all duration-200 shadow-xs
          ${sizeClasses}
          ${styles.bg} ${styles.text}
          ${selected ? "ring-2 ring-offset-2 ring-blue-600 scale-105" : ""}
          ${userPickRingClass}
          ${className}
        `}
        aria-label={`로또 번호 ${number}`}
      >
        <span>{number}</span>
      </div>

      {badgeText && (
        <span
          className={`
            text-[10px] font-black px-1.5 py-0.2 rounded-md leading-tight tracking-tight
            ${
              isUserPick
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-500 border border-slate-200/80"
            }
          `}
        >
          {badgeText}
        </span>
      )}
    </div>
  );
}
