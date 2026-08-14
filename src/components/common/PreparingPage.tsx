"use client";

import React from "react";
import Header from "@/components/common/Header";
import BottomNavigation from "@/components/common/BottomNavigation";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

interface PreparingPageProps {
  title: string;
  description: string;
}

export default function PreparingPage({ title, description }: PreparingPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      <Header />

      <main className="flex-1 w-full max-w-md mx-auto px-5 pt-8 pb-4 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-xs">
          <Clock className="w-8 h-8 stroke-[1.8]" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">
            {description}
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>홈으로 돌아가기</span>
          </Link>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
