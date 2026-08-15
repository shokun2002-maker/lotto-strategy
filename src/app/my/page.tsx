"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/common/Header";
import BottomNavigation from "@/components/common/BottomNavigation";
import LottoBall from "@/components/lotto/LottoBall";
import { getSavedCombinations } from "@/lib/lotto/storage";
import { getSavedStrategies } from "@/lib/lotto/strategy-storage";
import { analyzeUserProfile } from "@/lib/lotto/user-profile";
import { syncUserLottoData, getLastSyncedAt, SyncResult } from "@/lib/lotto/cloud-sync";
import { createClient } from "@/lib/supabase/client";
import { UserLottoProfile } from "@/types/lotto";
import { User as SupabaseUser } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProBadge from "@/components/subscription/ProBadge";
import { useEntitlement } from "@/components/subscription/EntitlementContext";
import {
  User,
  Zap,
  Sliders,
  Info,
  Layers,
  PieChart,
  BarChart3,
  TrendingUp,
  Sparkles,
  Pin,
  Ban,
  LogIn,
  UserPlus,
  LogOut,
  ShieldCheck,
  Cloud,
  CloudCheck,
  CloudOff,
  RefreshCw,
  Crown,
  ArrowRight,
} from "lucide-react";

export default function MyPage() {
  const router = useRouter();
  const { entitlement, plan, isPro } = useEntitlement();
  const [profile, setProfile] = useState<UserLottoProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  // Cloud Sync 상태
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  const loadLocalDataAndAnalyze = () => {
    const combinations = getSavedCombinations();
    const strategies = getSavedStrategies();
    const result = analyzeUserProfile(combinations, strategies);
    setProfile(result);
    setIsLoaded(true);
  };

  const handleRunCloudSync = async () => {
    setIsSyncing(true);
    const res = await syncUserLottoData();
    setSyncResult(res);
    setIsSyncing(false);

    if (res.success) {
      loadLocalDataAndAnalyze();
    }
  };

  useEffect(() => {
    loadLocalDataAndAnalyze();

    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        const u = data.user;
        setUser(u);
        if (u) {
          handleRunCloudSync();
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          const u = session?.user ?? null;
          setUser(u);
          if (u) {
            handleRunCloudSync();
          }
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    } catch {
      // Supabase 연동 방어
    }
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      setSyncResult(null);
      loadLocalDataAndAnalyze();
      router.refresh();
    } catch {
      // ignore
    }
  };

  const formatLastSyncTime = (isoString?: string | null) => {
    if (!isoString) return null;
    try {
      const d = new Date(isoString);
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    } catch {
      return null;
    }
  };

  const hasAnyData =
    profile &&
    (profile.totalSavedCombinations > 0 || profile.totalSavedStrategies > 0);

  const lastSyncTimeStr = formatLastSyncTime(syncResult?.lastSyncedAt || getLastSyncedAt());

  const isKakaoUser =
    user?.app_metadata?.provider === "kakao" ||
    (user?.app_metadata?.providers as string[])?.includes("kakao") ||
    user?.identities?.some((id) => id.provider === "kakao");

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.nickname ||
    user?.email ||
    (isKakaoUser ? "카카오 계정" : "사용자 계정");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      {/* Header */}
      <Header title="MY" showBackButton={false} />

      <main className="flex-1 w-full max-w-md mx-auto px-5 pt-6 pb-4 space-y-6">
        {/* Auth Account Status CTA & Cloud Sync Banner */}
        {user ? (
          <section className="w-full bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isKakaoUser
                      ? "bg-[#FEE500] text-[#191919]"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {isKakaoUser ? (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 3C6.477 3 2 6.477 2 10.764c0 2.76 1.83 5.183 4.582 6.554l-1.168 4.29c-.102.375.318.68.647.463l5.06-3.344c.29.025.582.037.879.037 5.523 0 10-3.477 10-7.764C22 6.477 17.523 3 12 3z" />
                    </svg>
                  ) : (
                    <ShieldCheck className="w-5 h-5" />
                  )}
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] font-bold text-slate-400">
                      로그인 계정
                    </span>
                    {isKakaoUser ? (
                      <span className="px-1.5 py-0.2 bg-[#FEE500] text-[#191919] text-[10px] font-black rounded flex items-center gap-0.5">
                        카카오
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 text-[10px] font-extrabold rounded">
                        이메일
                      </span>
                    )}
                    <ProBadge plan={plan} isPro={isPro} size="sm" />
                  </div>
                  <span className="text-sm font-extrabold text-white truncate block max-w-[180px] sm:max-w-[220px]">
                    {displayName}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 text-xs font-extrabold transition-all flex items-center gap-1 cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>로그아웃</span>
              </button>
            </div>

            {/* Membership Plan Status Indicator Bar */}
            <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold">
                <Crown className={`w-3.5 h-3.5 ${isPro ? "text-amber-400 fill-amber-400/20" : "text-slate-400"}`} />
                <span className={isPro ? "text-amber-300 font-extrabold" : "text-slate-300"}>
                  {isPro ? (
                    <>
                      PRO 멤버십 이용 중
                      {entitlement?.endsAt ? (
                        <span className="text-[10px] font-medium text-amber-200/80 ml-1">
                          (~{new Date(entitlement.endsAt).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })})
                        </span>
                      ) : null}
                    </>
                  ) : (
                    "FREE 요금제 이용 중"
                  )}
                </span>
              </div>

              <Link
                href="/pro"
                className="text-[11px] font-extrabold text-amber-300 hover:text-amber-200 bg-amber-950/60 hover:bg-amber-900 px-2.5 py-1 rounded-lg border border-amber-500/30 transition-all flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>{isPro ? "멤버십 안내" : "PRO 알아보기"}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Cloud Sync Status Indicator */}
            <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold">
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                    <span className="text-blue-300">클라우드 동기화 중...</span>
                  </>
                ) : syncResult?.success === false ? (
                  <>
                    <CloudOff className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="text-rose-300 text-[11px]">
                      동기화 실패 (로컬 안전 보관됨)
                    </span>
                  </>
                ) : (
                  <>
                    <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">
                      클라우드 동기화 완료 {lastSyncTimeStr ? `(${lastSyncTimeStr})` : ""}
                    </span>
                  </>
                )}
              </div>

              <button
                onClick={handleRunCloudSync}
                disabled={isSyncing}
                className="text-[11px] font-extrabold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
                <span>{syncResult?.success === false ? "다시 시도" : "동기화"}</span>
              </button>
            </div>
          </section>
        ) : (
          <section className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-blue-200 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 text-blue-600 font-extrabold text-xs mb-0.5">
                  <Cloud className="w-4 h-4 text-blue-600" />
                  <span>이 기기에 안전하게 저장 중</span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  계정으로 안전하게 이어서 사용하세요
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  로그인하면 다른 기기에서도 내 번호와 전략을 그대로 사용할 수 있습니다.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/signup"
                className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <UserPlus className="w-4 h-4" />
                <span>회원가입</span>
              </Link>
              <Link
                href="/login"
                className="h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>로그인</span>
              </Link>
            </div>
          </section>
        )}

        {/* Main Hero Copy */}
        <section className="space-y-1.5 pt-1">
          <div className="flex items-center gap-2 text-blue-600 font-extrabold text-xs">
            <User className="w-4 h-4" />
            <span>MY LOTTO PROFILE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
            나의 번호 <span className="text-blue-600">선택 스타일</span>
          </h1>
          <p className="text-sm font-medium text-slate-500">
            저장한 번호와 전략을 바탕으로 나의 이용 패턴을 살펴보세요.
          </p>
        </section>

        {!isLoaded ? (
          /* Loading State */
          <div className="w-full bg-white rounded-2xl p-8 border border-slate-200/80 animate-pulse text-center text-slate-400 text-sm">
            나의 번호 패턴을 분석하는 중...
          </div>
        ) : !hasAnyData ? (
          /* Total Empty State */
          <section className="w-full bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center space-y-5 my-2">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80">
              <PieChart className="w-8 h-8 stroke-[1.8]" />
            </div>

            <div className="space-y-1.5 max-w-xs">
              <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                아직 패턴을 분석할 데이터가 없어요
              </h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                번호를 저장하거나 나만의 전략을 사용하면 이곳에서 나의 이용 패턴을 한눈에 확인할 수 있습니다.
              </p>
            </div>

            <div className="pt-2 grid grid-cols-2 gap-2.5 w-full">
              <Link
                href="/quick"
                className="py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Zap className="w-4 h-4" />
                <span>번호 만들기</span>
              </Link>
              <Link
                href="/strategy"
                className="py-3 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Sliders className="w-4 h-4" />
                <span>전략 만들기</span>
              </Link>
            </div>
          </section>
        ) : (
          profile && (
            <>
              {/* Section 1: Activity Summary Cards (3 Cards) */}
              <section className="grid grid-cols-3 gap-2.5">
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">
                    저장 조합
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-slate-900">
                    {profile.totalSavedCombinations}
                    <span className="text-xs font-bold text-slate-400 ml-0.5">게임</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">
                    내 전략
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-blue-600">
                    {profile.totalSavedStrategies}
                    <span className="text-xs font-bold text-slate-400 ml-0.5">개</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">
                    전략 사용
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-600">
                    {profile.totalStrategyUsageCount}
                    <span className="text-xs font-bold text-slate-400 ml-0.5">회</span>
                  </div>
                </div>
              </section>

              {/* Section 2: Selection Ratio (Direct vs Recommended) */}
              <section className="w-full bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <PieChart className="w-4 h-4 text-blue-600" />
                    나의 선택 방식 (직접 선택 vs 시스템 추천)
                  </h2>
                </div>

                {profile.selectionRatio.hasData ? (
                  <div className="space-y-2 pt-1">
                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className="bg-blue-600 h-full transition-all duration-500"
                        style={{ width: `${profile.selectionRatio.userPickedPercentage}%` }}
                      />
                      <div
                        className="bg-slate-300 h-full transition-all duration-500"
                        style={{ width: `${profile.selectionRatio.recommendedPercentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs font-extrabold">
                      <div className="flex items-center gap-1.5 text-blue-700">
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                        <span>직접 선택 {profile.selectionRatio.userPickedPercentage}%</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        <span>시스템 추천 {profile.selectionRatio.recommendedPercentage}%</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-400 text-xs font-medium text-center">
                    아직 분석할 직접 선택 데이터가 없어요. 함께추천이나 전략에서 번호를 고르면 분석됩니다.
                  </div>
                )}
              </section>

              {/* Section 3: Favorite User-Picked Numbers (Top 5) */}
              <section className="w-full bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                <div className="space-y-0.5">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    자주 직접 고른 번호
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    함께추천이나 커스텀 전략에서 내가 직접 선택한 번호 기준
                  </p>
                </div>

                {profile.favoriteUserPickedNumbers.length > 0 ? (
                  <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1">
                    {profile.favoriteUserPickedNumbers.map((item) => (
                      <div key={item.number} className="flex flex-col items-center gap-1">
                        <LottoBall number={item.number} size="md" isUserPick={true} />
                        <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                          {item.count}회 선택
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-400 text-xs font-medium text-center">
                    함께추천이나 전략에서 번호를 직접 선택하면 자주 고른 번호 순위가 집계됩니다.
                  </div>
                )}
              </section>

              {/* Section 4: Favorite Base Strategy Usage */}
              <section className="w-full bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    자주 사용한 전략
                  </h2>
                </div>

                {profile.strategyUsage.hasData ? (
                  <div className="space-y-3 pt-1">
                    {profile.strategyUsage.items.map((item) => (
                      <div key={item.strategyId} className="space-y-1 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-700">
                          <span>{item.label}</span>
                          <span className="text-blue-600 font-extrabold">
                            {item.percentage}% ({item.count}회)
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-400 text-xs font-medium text-center">
                    전략에서 번호를 생성하면 전략별 사용 비중이 분석됩니다.
                  </div>
                )}
              </section>

              {/* Section 5: Number Range Distribution */}
              <section className="w-full bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                <div className="space-y-0.5">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    저장 번호 분포
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    내 번호에 저장된 전체 조합의 1~45 번호대 분포
                  </p>
                </div>

                {profile.rangeDistribution.hasData ? (
                  <div className="space-y-2.5 pt-1">
                    {profile.rangeDistribution.items.map((item) => (
                      <div key={item.rangeKey} className="space-y-1 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-700">
                          <span>{item.label} 번호대</span>
                          <span className="text-slate-900 font-extrabold">
                            {item.percentage}% ({item.count}개)
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-400 text-xs font-medium text-center">
                    저장된 조합 데이터가 없습니다.
                  </div>
                )}
              </section>

              {/* Section 6: Average Combination Stats */}
              <section className="w-full bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  저장 조합 평균 통계
                </h2>

                {profile.averageAnalysis.hasData ? (
                  <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-0.5">
                      <span className="text-[11px] font-extrabold text-slate-400 block">
                        평균 홀짝
                      </span>
                      <span className="text-sm sm:text-base font-black text-slate-900">
                        {profile.averageAnalysis.odd} : {profile.averageAnalysis.even}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-0.5">
                      <span className="text-[11px] font-extrabold text-slate-400 block">
                        평균 저고
                      </span>
                      <span className="text-sm sm:text-base font-black text-slate-900">
                        {profile.averageAnalysis.low} : {profile.averageAnalysis.high}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-0.5">
                      <span className="text-[11px] font-extrabold text-slate-400 block">
                        평균 합계
                      </span>
                      <span className="text-sm sm:text-base font-black text-blue-600">
                        {profile.averageAnalysis.sum}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-400 text-xs font-medium text-center">
                    저장된 번호 조합의 평균 수치 통계가 표시됩니다.
                  </div>
                )}
              </section>

              {/* Section 7: Custom Strategy Habits */}
              {profile.strategyHabits.hasData && (
                <section className="w-full bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-emerald-600" />
                    전략 설정 습관
                  </h2>

                  <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                    <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 space-y-1">
                      <div className="flex items-center gap-1 font-bold text-blue-800">
                        <Pin className="w-3.5 h-3.5 text-blue-600" />
                        <span>고정수 활용</span>
                      </div>
                      <p className="text-slate-600 font-semibold">
                        {profile.strategyHabits.withFixedNumbersCount} / {profile.strategyHabits.totalStrategies}개 전략 ({profile.strategyHabits.fixedPercentage}%)
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-100 space-y-1">
                      <div className="flex items-center gap-1 font-bold text-rose-800">
                        <Ban className="w-3.5 h-3.5 text-rose-600" />
                        <span>제외수 활용</span>
                      </div>
                      <p className="text-slate-600 font-semibold">
                        {profile.strategyHabits.withExcludedNumbersCount} / {profile.strategyHabits.totalStrategies}개 전략 ({profile.strategyHabits.excludedPercentage}%)
                      </p>
                    </div>
                  </div>
                </section>
              )}
            </>
          )
        )}

        {/* Disclaimer Note */}
        <section className="w-full bg-slate-100/70 border border-slate-200/60 rounded-xl p-3.5 flex items-start gap-2.5 text-slate-500 text-xs">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            이 분석은 저장된 번호와 이용 기록을 요약한 것으로 미래 추첨 결과나 당첨 가능성을 의미하지 않습니다.
          </p>
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
