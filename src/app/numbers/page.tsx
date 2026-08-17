"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/common/Header";
import BottomNavigation from "@/components/common/BottomNavigation";
import LottoBall from "@/components/lotto/LottoBall";
import { getSavedCombinations, deleteCombination, clearAllCombinations } from "@/lib/lotto/storage";
import { getNextDrawInfo, addDaysToDate } from "@/lib/lotto/draw-schedule";
import { getSavedCombinationResult } from "@/lib/lotto/saved-result";
import { getDrawByNumber } from "@/lib/lotto/draw-data";
import { SavedLottoCombination } from "@/types/lotto";
import Link from "next/link";
import { Trash2, Plus, Hash, Calendar, CheckCircle2, Clock, Zap, Sliders, ChevronDown, ChevronUp, Check, X } from "lucide-react";

export default function NumbersPage() {
  const [items, setItems] = useState<SavedLottoCombination[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [collapsedDraws, setCollapsedDraws] = useState<Record<string, boolean>>({});

  const nextDraw = getNextDrawInfo();

  useEffect(() => {
    setItems(getSavedCombinations());
    setIsLoaded(true);
  }, []);

  const toggleGroupCollapse = (keyStr: string) => {
    setCollapsedDraws((prev) => ({
      ...prev,
      [keyStr]: !prev[keyStr],
    }));
  };

  const handleDeleteItem = (id: string) => {
    const updated = deleteCombination(id);
    setItems(updated);
    setDeletingId(null);
  };

  const handleClearAll = () => {
    if (items.length === 0) return;
    if (window.confirm("저장된 모든 번호를 삭제하시겠습니까?")) {
      clearAllCombinations();
      setItems([]);
      setDeletingId(null);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}.${month}.${day}`;
    } catch {
      return isoString;
    }
  };

  const getSourceBadgeText = (item: SavedLottoCombination) => {
    const fixedCount = item.userPickedNumbers?.length ?? item.fixedNumbers?.length ?? 0;
    const excludedCount = item.excludedNumbers?.length ?? 0;

    if (item.source === "strategy") {
      if (item.customStrategyName) {
        return `전략 · ${item.customStrategyName}`;
      }

      let strategyName = "전략 · 균형형";
      if (item.strategyId === "recent-trend") {
        strategyName = "전략 · 최근흐름형";
      } else if (item.strategyId === "long-absence") {
        strategyName = "전략 · 장기미출현형";
      }

      if (fixedCount > 0 || excludedCount > 0) {
        return `${strategyName} (고정 ${fixedCount} · 제외 ${excludedCount})`;
      }
      return strategyName;
    }

    if (item.source === "together") {
      return `함께추천 ${fixedCount > 0 ? `· 선택 ${fixedCount}개` : ""}`;
    }

    return "빠른추천";
  };

  const getFeaturedBadgeText = (item: SavedLottoCombination, num: number) => {
    if (item.source === "together") {
      return item.userPickedNumbers?.includes(num) ? "MY" : undefined;
    }
    if (item.source === "strategy") {
      if (item.userPickedNumbers?.includes(num) || item.fixedNumbers?.includes(num)) {
        return "고정";
      }
      if (item.strategyId === "recent-trend") return "최근";
      if (item.strategyId === "long-absence") return "미출현";
    }
    return undefined;
  };

  // 회차별 그룹화 처리 (targetDrawNo 오름차순/내림차순 정렬)
  const groupedByDraw: Map<number | "unspecified", SavedLottoCombination[]> = new Map();

  for (const item of items) {
    const key = item.targetDrawNo ?? "unspecified";
    if (!groupedByDraw.has(key)) {
      groupedByDraw.set(key, []);
    }
    groupedByDraw.get(key)!.push(item);
  }

  // 그룹 키 정렬 (숫자 내림차순, unspecified는 맨 뒤)
  const sortedGroupKeys = Array.from(groupedByDraw.keys()).sort((a, b) => {
    if (a === "unspecified") return 1;
    if (b === "unspecified") return -1;
    return (b as number) - (a as number);
  });

  const nextDrawItems = groupedByDraw.get(nextDraw.drawNo) ?? [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      {/* Header */}
      <Header />

      <main className="flex-1 w-full max-w-md mx-auto px-5 pt-6 pb-4 space-y-6">
        {/* Main Copy */}
        <section className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
              이번 주 번호를
              <br />
              <span className="text-blue-600">한곳에서 확인하세요</span>
            </h1>
            {isLoaded && items.length > 0 && (
              <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                총 {items.length}게임 저장됨
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-slate-500">
            추첨 회차별로 저장한 번호와 대조 결과를 확인할 수 있습니다.
          </p>
        </section>

        {/* Loading Skeleton */}
        {!isLoaded ? (
          <div className="w-full bg-white rounded-2xl p-6 border border-slate-200/80 animate-pulse text-center text-slate-400 text-sm">
            저장한 번호를 불러오는 중...
          </div>
        ) : items.length === 0 ? (
          /* Entire Empty State */
          <section className="w-full bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center space-y-4 my-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Hash className="w-7 h-7 stroke-[1.8]" />
            </div>

            <div className="space-y-1">
              <h2 className="font-bold text-slate-900 text-lg">
                아직 저장한 번호가 없어요
              </h2>
              <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
                빠른추천이나 함께추천, 전략에서 번호를 만들어 제{nextDraw.drawNo}회에 저장해보세요.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <Link
                href="/quick"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                <Zap className="w-4 h-4" />
                <span>빠른추천</span>
              </Link>
              <Link
                href="/strategy"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
              >
                <Sliders className="w-4 h-4" />
                <span>전략만들기</span>
              </Link>
            </div>
          </section>
        ) : (
          <section className="space-y-6">
            {/* Current Target Draw (제1237회) Empty Warning Banner if empty for current draw */}
            {nextDrawItems.length === 0 && (
              <div className="w-full bg-white rounded-2xl p-5 border border-blue-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-blue-700 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    제{nextDraw.drawNo}회 ({nextDraw.formattedDate} 추첨)
                  </span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    {nextDraw.dDayText}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-bold">
                  이번 제{nextDraw.drawNo}회차에 저장한 번호가 없어요.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href="/quick"
                    className="flex-1 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <span>빠른추천으로 만들기</span>
                  </Link>
                  <Link
                    href="/strategy"
                    className="flex-1 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <span>전략으로 만들기</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Draw Groups List */}
            {sortedGroupKeys.map((groupKey) => {
              const groupItems = groupedByDraw.get(groupKey)!;
              // 회차 내에서 createdAt 내림차순 (가장 최근 저장한 조합이 상단 GAME 1) 정렬
              const sortedInGroup = [...groupItems].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );

              const isUnspecified = groupKey === "unspecified";
              const drawNo = isUnspecified ? undefined : (groupKey as number);
              const actualDraw = drawNo ? getDrawByNumber(drawNo) : undefined;
              const isCompleted = !!actualDraw;

              // 회차 날짜 구하기
              let drawDateStr = "";
              if (actualDraw) {
                drawDateStr = actualDraw.drawDate.replace(/-/g, ".");
              } else if (drawNo === nextDraw.drawNo) {
                drawDateStr = `${nextDraw.formattedDate} 추첨 예정`;
              } else if (drawNo) {
                drawDateStr = "추첨 예정";
              }

              const groupKeyStr = String(groupKey);
              const isCollapsed = !!collapsedDraws[groupKeyStr];

              return (
                <div key={groupKeyStr} className="space-y-3">
                  {/* Group Header with Collapse Toggle */}
                  <div
                    onClick={() => toggleGroupCollapse(groupKeyStr)}
                    className={`
                      w-full rounded-2xl p-3.5 sm:p-4 border transition-all cursor-pointer flex items-center justify-between shadow-xs
                      ${
                        isCompleted
                          ? "bg-slate-900 text-white border-slate-800"
                          : isUnspecified
                          ? "bg-white text-slate-900 border-slate-200/80"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-blue-500/10"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className={`w-4 h-4 ${isCompleted || !isUnspecified ? "text-amber-400" : "text-blue-600"}`} />
                      <h2 className="text-sm sm:text-base font-black">
                        {isUnspecified ? "회차 미지정" : `제${drawNo}회`}
                      </h2>
                      {drawDateStr && (
                        <span className={`text-xs font-medium ${isCompleted || !isUnspecified ? "text-slate-300" : "text-slate-500"}`}>
                          ({drawDateStr})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          isCompleted
                            ? "bg-amber-400/20 text-amber-300 border-amber-400/40"
                            : isUnspecified
                            ? "bg-slate-100 text-slate-600 border-slate-200"
                            : "bg-white/20 text-white border-white/40"
                        }`}
                      >
                        {isCompleted ? "추첨 완료" : isUnspecified ? "미지정" : "추첨 전"}
                      </span>
                      <div className={`p-1 rounded-lg ${isCompleted || !isUnspecified ? "text-slate-300 hover:text-white" : "text-slate-400 hover:text-slate-700"}`}>
                        {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Draw Winning Numbers Header if completed */}
                  {!isCollapsed && actualDraw && (
                    <div className="w-full bg-slate-800 text-white rounded-xl p-3.5 text-xs font-semibold flex items-center justify-between shadow-xs">
                      <span className="text-slate-300 font-bold">공식 당첨번호:</span>
                      <div className="flex items-center gap-1 font-black">
                        {actualDraw.numbers.map((n) => (
                          <span key={n} className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-400">
                            {n < 10 ? `0${n}` : n}
                          </span>
                        ))}
                        <span className="text-slate-400 mx-0.5">+</span>
                        <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded">
                          {actualDraw.bonus}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Combination Cards in Group */}
                  {!isCollapsed && (
                    <div className="space-y-3">
                      {sortedInGroup.map((item, idx) => {
                        const result = getSavedCombinationResult(item);
                        const isStrategy = item.source === "strategy";
                        const isTogether = item.source === "together";
                        const isDeleting = deletingId === item.id;

                        return (
                          <div
                            key={item.id}
                            className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3.5 hover:border-slate-300 transition-all"
                          >
                            {/* Item Header */}
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-900">
                                  GAME {idx + 1}
                                </span>
                                <span
                                  className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                                    isStrategy
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : isTogether
                                      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                      : "bg-blue-50 text-blue-700 border-blue-200"
                                  }`}
                                >
                                  {getSourceBadgeText(item)}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Result Status Badge */}
                                {result.status === "completed" && result.match ? (
                                  <span
                                    className={`text-xs font-black px-2.5 py-0.5 rounded-md ${
                                      result.match.rank === 1
                                        ? "bg-amber-500 text-white"
                                        : result.match.rank === 2
                                        ? "bg-blue-600 text-white"
                                        : result.match.rank === 3
                                        ? "bg-indigo-600 text-white"
                                        : result.match.rank === 4
                                        ? "bg-emerald-600 text-white"
                                        : result.match.rank === 5
                                        ? "bg-teal-600 text-white"
                                        : "bg-slate-100 text-slate-600 font-bold"
                                    }`}
                                  >
                                    {result.match.rank
                                      ? `${result.match.rank}등 당첨`
                                      : result.match.matchCount > 0
                                      ? `${result.match.matchCount}개 일치`
                                      : "당첨 없음"}
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    결과 대기
                                  </span>
                                )}

                                {/* Delete Action with Inline Confirmation Safety */}
                                {isDeleting ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleDeleteItem(item.id)}
                                      className="px-2 py-1 rounded-md bg-rose-600 text-white text-[11px] font-extrabold hover:bg-rose-700 transition-colors cursor-pointer flex items-center gap-0.5"
                                    >
                                      <Check className="w-3 h-3" />
                                      <span>삭제</span>
                                    </button>
                                    <button
                                      onClick={() => setDeletingId(null)}
                                      className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-extrabold hover:bg-slate-200 transition-colors cursor-pointer flex items-center gap-0.5"
                                    >
                                      <X className="w-3 h-3" />
                                      <span>취소</span>
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeletingId(item.id)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                    title="조합 삭제"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* 6 Lotto Balls Grid */}
                            <div className="flex items-center justify-between gap-1 sm:gap-2 py-1">
                              {item.numbers.map((num) => {
                                const isMatched =
                                  result.status === "completed" &&
                                  result.match?.matchedNumbers.includes(num);
                                const isBonusMatched =
                                  result.status === "completed" &&
                                  result.draw?.bonus === num;

                                const isUserPick =
                                  item.userPickedNumbers?.includes(num) ||
                                  item.fixedNumbers?.includes(num);

                                return (
                                  <LottoBall
                                    key={num}
                                    number={num}
                                    size="md"
                                    isUserPick={isUserPick || isMatched}
                                    badgeText={
                                      isBonusMatched
                                        ? "보너스"
                                        : isUserPick
                                        ? getFeaturedBadgeText(item, num)
                                        : undefined
                                    }
                                  />
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Clear All Combinations Button */}
            <div className="pt-4 flex justify-center">
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>저장번호 전체 삭제</span>
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
