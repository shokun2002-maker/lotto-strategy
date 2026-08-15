"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

interface KakaoLoginButtonProps {
  nextUrl?: string;
  onError?: (errorMessage: string) => void;
}

export default function KakaoLoginButton({
  nextUrl = "/my",
  onError,
}: KakaoLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleKakaoLogin = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          redirectTo,
          scopes: "",
        },
      });

      if (error) {
        if (onError) {
          onError(error.message);
        }
        setIsLoading(false);
      }
    } catch (err: any) {
      if (onError) {
        onError(err?.message || "카카오 로그인 중 오류가 발생했습니다.");
      }
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleKakaoLogin}
      disabled={isLoading}
      className="w-full h-12 rounded-xl bg-[#FEE500] hover:bg-[#FADA0A] active:scale-[0.98] text-[#191919] font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-2xs transition-all duration-200 disabled:opacity-70 cursor-pointer border border-[#FEE500]/50"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-[#191919]" />
          <span>카카오 연결 중...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12 3C6.477 3 2 6.477 2 10.764c0 2.76 1.83 5.183 4.582 6.554l-1.168 4.29c-.102.375.318.68.647.463l5.06-3.344c.29.025.582.037.879.037 5.523 0 10-3.477 10-7.764C22 6.477 17.523 3 12 3z" />
          </svg>
          <span>카카오로 계속하기</span>
        </>
      )}
    </button>
  );
}
