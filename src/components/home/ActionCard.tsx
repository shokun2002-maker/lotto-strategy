"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface ActionCardProps {
  title: string;
  description: string;
  subText?: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isPro?: boolean;
  badgeText?: string;
  accentColor?: "blue" | "indigo" | "emerald";
}

export default function ActionCard({
  title,
  description,
  subText,
  href,
  icon: Icon,
  isPro = false,
  badgeText,
  accentColor = "blue",
}: ActionCardProps) {
  const colorStyles = {
    blue: {
      iconBg: "bg-blue-50 text-blue-600 border-blue-100",
      badge: "bg-blue-600 text-white",
      hoverBorder: "hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5",
    },
    indigo: {
      iconBg: "bg-indigo-50 text-indigo-600 border-indigo-100",
      badge: "bg-indigo-600 text-white",
      hoverBorder: "hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/5",
    },
    emerald: {
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      badge: "bg-emerald-600 text-white",
      hoverBorder: "hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-500/5",
    },
  }[accentColor];

  return (
    <Link
      href={href}
      className={`
        group relative block w-full bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs
        transition-all duration-200 active:scale-[0.98] ${colorStyles.hoverBorder}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          {/* Icon Badge */}
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorStyles.iconBg} transition-transform group-hover:scale-105`}
          >
            <Icon className="w-6 h-6 stroke-[2]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                {title}
              </h3>

              {isPro && (
                <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black tracking-wider shadow-2xs">
                  PRO
                </span>
              )}

              {badgeText && !isPro && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                  {badgeText}
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-slate-600 mt-0.5">
              {description}
            </p>
          </div>
        </div>

        {/* Action Arrow Icon */}
        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all mt-1">
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </div>
      </div>

      {subText && (
        <p className="text-xs text-slate-400 font-medium mt-3 pt-3 border-t border-slate-100 flex items-center gap-1">
          <span>{subText}</span>
        </p>
      )}
    </Link>
  );
}
