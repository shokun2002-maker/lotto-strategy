"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowLeft, LogIn, LogOut, User as UserIcon } from "lucide-react";
import { getNextDrawInfo } from "@/lib/lotto/draw-schedule";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

interface HeaderProps {
  roundNumber?: number;
  dDayText?: string;
  showBackButton?: boolean;
  title?: string;
  backHref?: string;
}

export default function Header({
  roundNumber,
  dDayText,
  showBackButton = false,
  title,
  backHref = "/",
}: HeaderProps) {
  const router = useRouter();
  const nextDraw = getNextDrawInfo();
  const currentRound = roundNumber ?? nextDraw.drawNo;
  const currentDDay = dDayText ?? nextDraw.dDayText;

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        setUser(data.user);
      });

      const { data: authListener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user ?? null);
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    } catch {
      // Supabase 환경변수가 아직 없을 때 방어
    }
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      router.push("/");
      router.refresh();
    } catch {
      // ignore
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-100/80 transition-all">
      <div className="max-w-md mx-auto px-5 h-14 flex items-center justify-between">
        {/* Left Side: Back button or Brand logo */}
        <div className="flex items-center gap-2.5">
          {showBackButton ? (
            <Link
              href={backHref}
              className="p-1.5 -ml-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              aria-label="뒤로가기"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
              {title && (
                <span className="font-bold text-slate-900 text-base">
                  {title}
                </span>
              )}
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs shadow-blue-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold tracking-tight text-slate-900 text-lg">
                LOTTO <span className="text-blue-600 font-black">STRATEGY</span>
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Round Badge Info & User Account Link */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/60 text-xs font-semibold text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <span>제 {currentRound}회</span>
            <span className="text-slate-300">•</span>
            <span className="text-blue-600 font-bold">{currentDDay}</span>
          </div>

          {/* User Auth Quick Action */}
          {user ? (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="로그아웃"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <Link
              href="/login"
              className="p-1.5 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1 text-xs font-extrabold"
              title="로그인"
            >
              <LogIn className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
