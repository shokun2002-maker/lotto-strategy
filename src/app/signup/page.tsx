"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import BottomNavigation from "@/components/common/BottomNavigation";
import { createClient } from "@/lib/supabase/client";
import { formatAuthError } from "@/lib/supabase/auth-errors";
import { UserPlus, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    // 1차 클라이언트 입력 검증
    if (!email.trim()) {
      setErrorMessage("이메일을 입력해주세요.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }

    if (password !== passwordConfirm) {
      setErrorMessage("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        setErrorMessage(formatAuthError(error));
        setIsLoading(false);
        return;
      }

      // 이메일 확인 메일 수신 필요 여부 체크
      if (data.user && data.session === null) {
        setSuccessNotice(
          "가입 확인 메일을 보냈어요! 이메일의 수신함을 확인해 인증을 완료해주세요."
        );
      } else {
        // 이메일 확인이 켜져 있지 않은 경우 즉시 세션 생성 완료
        setSuccessNotice("회원가입이 완료되었습니다. 내 프로필로 이동합니다.");
        setTimeout(() => {
          router.push("/my");
        }, 1000);
      }
    } catch (err) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      {/* Header */}
      <Header showBackButton={true} title="회원가입" backHref="/login" />

      <main className="flex-1 w-full max-w-md mx-auto px-5 pt-8 pb-4 space-y-6">
        {/* Title Area */}
        <section className="space-y-2 pt-1 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 mx-auto sm:mx-0 mb-3">
            <UserPlus className="w-6 h-6 stroke-[2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
            회원가입
          </h1>
          <p className="text-sm font-semibold text-slate-500">
            내 번호와 전략을 안전하게 이어서 사용하세요.
          </p>
        </section>

        {/* Sign Up Form Card */}
        <section className="w-full bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successNotice && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold space-y-1 animate-fadeIn">
              <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>회원가입 안내</span>
              </div>
              <p className="leading-relaxed">{successNotice}</p>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-extrabold text-slate-700 block">
                이메일 계정
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
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
              <label htmlFor="password" className="text-xs font-extrabold text-slate-700 block">
                비밀번호 (8자 이상)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 8자 이상"
                  className="w-full h-12 pl-10 pr-3.5 rounded-xl border border-slate-200 text-slate-900 font-bold text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:font-normal placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password Confirm Field */}
            <div className="space-y-1.5">
              <label htmlFor="passwordConfirm" className="text-xs font-extrabold text-slate-700 block">
                비밀번호 확인
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="passwordConfirm"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="비밀번호 다시 입력"
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
                    <span>회원가입 처리 중...</span>
                  </>
                ) : (
                  <>
                    <span>회원가입</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Navigation */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <p className="text-xs font-semibold text-slate-500">
              이미 계정이 있으신가요?{" "}
              <Link
                href="/login"
                className="text-blue-600 font-extrabold hover:underline ml-1"
              >
                로그인
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
