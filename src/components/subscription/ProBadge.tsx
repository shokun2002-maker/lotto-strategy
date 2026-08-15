"use client";

import React from "react";
import { UserPlan } from "@/types/subscription";
import { Crown, Sparkles } from "lucide-react";

interface ProBadgeProps {
  plan?: UserPlan;
  isPro?: boolean;
  size?: "sm" | "md" | "lg";
  showFree?: boolean;
  className?: string;
}

export default function ProBadge({
  plan = "free",
  isPro = false,
  size = "sm",
  showFree = true,
  className = "",
}: ProBadgeProps) {
  const activePro = isPro || plan === "pro";

  if (!activePro && !showFree) return null;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1 rounded-md",
    md: "px-2.5 py-1 text-xs gap-1.5 rounded-lg",
    lg: "px-3 py-1.5 text-sm gap-2 rounded-xl",
  }[size];

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  }[size];

  if (activePro) {
    return (
      <span
        className={`inline-flex items-center font-black bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-xs tracking-wider ${sizeClasses} ${className}`}
      >
        <Crown className={`${iconSizes} fill-amber-200 text-amber-100 shrink-0`} />
        <span>PRO</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-extrabold bg-slate-800 text-slate-300 border border-slate-700 tracking-wider ${sizeClasses} ${className}`}
    >
      <Sparkles className={`${iconSizes} text-slate-400 shrink-0`} />
      <span>FREE</span>
    </span>
  );
}
