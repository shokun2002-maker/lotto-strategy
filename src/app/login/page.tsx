"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import BottomNavigation from "@/components/common/BottomNavigation";
import KakaoLoginButton from "@/components/auth/KakaoLoginButton";
import { createClient } from "@/lib/supabase/client";
import { formatAuthError } from "@/lib/supabase/auth-errors";
import { LogIn, Mail, Lock, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // URL Query parameter에서 OAuth error 추출 및 안내
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const err = searchParams.get("error");
      if (err) {
        setErrorMessage(formatAuthError(err));
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage("이메일을 입력해주세요.");
      return;
    }

    if (!password) {
      setErrorMessage("비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(formatAuthError(error));
        setIsLoading(false);
        return;
      }

      // 로그인 성공 시 /my 이동
      router.push("/my");
      router.refresh();
    } catch (err) {
      setErrorMessage(formatAuthError(err));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      {/* Header */}
      <Header showBackButton={true} title="로그인" backHref="/" />

      <main className="flex-1 w-full max-w-md mx-auto px-5 pt-8 pb-4 space-y-6">
        {/* Title Area */}
        <section className="space-y-2 pt-1 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 mx-auto sm:mx-0 mb-3">
            <LogIn className="w-6 h-6 stroke-[2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
            로그인
          </h1>
          <p className="text-sm font-semibold text-slate-500">
            저장한 번호와 나의 전략을 이어서 확인하세요.
          </p>
        </section>

        {/* Login Card */}
        <section className="w-full bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Social Login Button */}
          <div className="space-y-3.5">
            <KakaoLoginButton
              nextUrl="/my"
              onError={(msg) => setErrorMessage(formatAuthError(msg))}
            />
            <div className="relative flex items-center justify-center pt-1">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-xs font-bold text-slate-400 shrink-0">
                또는
              </span>
              <div className="border-t border-slate-200 w-full" />
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="loginEmail" className="text-xs font-extrabold text-slate-700 block">
                이메일 계정
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="loginEmail"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full h-12 pl-10 pr-3.5 rounded-xl border border-slate-200 text-slate-900 font-bold text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:font-normal placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="loginPassword" className="text-xs font-extrabold text-slate-700 block">
                비밀번호
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="loginPassword"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 입력"
                  className="w-full h-12 pl-10 pr-3.5 rounded-xl border border-slate-200 text-slate-900 font-bold text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:font-normal placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-200 disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>로그인 처리 중...</span>
                  </>
                ) : (
                  <>
                    <span>로그인</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Navigation */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <p className="text-xs font-semibold text-slate-500">
              아직 계정이 없으신가요?{" "}
              <Link
                href="/signup"
                className="text-blue-600 font-extrabold hover:underline ml-1"
              >
                회원가입
              </Link>
            </p>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
