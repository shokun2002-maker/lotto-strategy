"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/common/Header";
import BottomNavigation from "@/components/common/BottomNavigation";
import LottoBall from "@/components/lotto/LottoBall";
import { getSavedCombinations, deleteCombination, clearAllCombinations } from "@/lib/lotto/storage";
import { SavedLottoCombination } from "@/types/lotto";
import Link from "next/link";
import { Trash2, Plus, Hash } from "lucide-react";

export default function NumbersPage() {
  const [items, setItems] = useState<SavedLottoCombination[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Client-side hydration safety
  useEffect(() => {
    setItems(getSavedCombinations());
    setIsLoaded(true);
  }, []);

  const handleDeleteItem = (id: string) => {
    const updated = deleteCombination(id);
    setItems(updated);
  };

  const handleClearAll = () => {
    if (items.length === 0) return;
    if (window.confirm("저장된 모든 번호를 삭제하시겠습니까?")) {
      clearAllCombinations();
      setItems([]);
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      {/* Header */}
      <Header />

      <main className="flex-1 w-full max-w-md mx-auto px-5 pt-6 pb-4 space-y-6">
        {/* Main Copy */}
        <section className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
              내 번호
            </h1>
            {isLoaded && items.length > 0 && (
              <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                저장된 번호 {items.length}개
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-slate-500">
            저장한 번호를 한곳에서 확인하세요.
          </p>
        </section>

        {/* Loading Skeleton during hydration */}
        {!isLoaded ? (
          <div className="w-full bg-white rounded-2xl p-6 border border-slate-200/80 animate-pulse text-center text-slate-400 text-sm">
            저장한 번호를 불러오는 중...
          </div>
        ) : items.length === 0 ? (
          /* Empty State */
          <section className="w-full bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center space-y-4 my-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Hash className="w-7 h-7 stroke-[1.8]" />
            </div>

            <div className="space-y-1">
              <h2 className="font-bold text-slate-900 text-lg">
                아직 저장한 번호가 없어요
              </h2>
              <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
                빠른추천이나 함께추천, 전략에서 마음에 드는 번호를 저장해보세요.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/quick"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>번호 만들어보기</span>
              </Link>
            </div>
          </section>
        ) : (
          /* Saved Combination List */
          <section className="space-y-3.5">
            {items.map((item) => {
              const isTogether = item.source === "together";
              const isStrategy = item.source === "strategy";

              return (
                <div
                  key={item.id}
                  className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4 hover:border-slate-300 transition-all"
                >
                  {/* Card Header Info */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
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
                      <span className="text-xs text-slate-400 font-medium">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>

                    {/* Delete Item Button */}
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      aria-label="저장된 조합 삭제"
                      title="조합 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 6 Lotto Balls Grid */}
                  <div className="flex items-center justify-between gap-1 sm:gap-2 py-1">
                    {item.numbers.map((num) => {
                      const isUserPick =
                        item.userPickedNumbers?.includes(num) ||
                        item.fixedNumbers?.includes(num);
                      return (
                        <LottoBall
                          key={num}
                          number={num}
                          size="md"
                          isUserPick={isUserPick}
                          badgeText={getFeaturedBadgeText(item, num)}
                        />
                      );
                    })}
                  </div>
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
