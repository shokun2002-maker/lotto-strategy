"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/common/Header";
import BottomNavigation from "@/components/common/BottomNavigation";
import LottoBall from "@/components/lotto/LottoBall";
import CustomNumberSelector from "@/components/lotto/CustomNumberSelector";
import AnalysisSummaryCard from "@/components/lotto/AnalysisSummaryCard";
import { LOTTO_STRATEGIES } from "@/lib/lotto/strategies";
import { generateBalancedNumbers } from "@/lib/lotto/strategies/balanced";
import { generateRecentTrendNumbers } from "@/lib/lotto/strategies/recent-trend";
import { generateLongAbsenceNumbers } from "@/lib/lotto/strategies/long-absence";
import {
  generateCustomNumbers,
  generateMultipleCustomCombinations,
} from "@/lib/lotto/strategies/custom";
import { saveCombination, isCombinationSaved } from "@/lib/lotto/storage";
import {
  getSavedStrategies,
  saveStrategy,
  deleteStrategy,
  incrementStrategyUsage,
} from "@/lib/lotto/strategy-storage";
import { getLatestDraw, getAllDraws } from "@/lib/lotto/draw-data";
import {
  StrategyGenerationResult,
  LottoStrategyId,
  SavedCustomStrategy,
} from "@/types/lotto";
import {
  Sliders,
  RefreshCw,
  Info,
  Sparkles,
  Bookmark,
  Check,
  CheckCircle2,
  Database,
  TrendingUp,
  Clock,
  Scale,
  Settings2,
  ChevronDown,
  ChevronUp,
  Pin,
  Ban,
  FolderPlus,
  Trash2,
  Edit3,
  Dices,
} from "lucide-react";

export default function StrategyPage() {
  // 결과 및 단일/다중 생성 상태
  const [results, setResults] = useState<StrategyGenerationResult[]>([]);
  const [activeStrategyTitle, setActiveStrategyTitle] = useState<string>("균형형 조합");
  const [selectedStrategyId, setSelectedStrategyId] = useState<LottoStrategyId>("balanced");
  const [isGenerating, setIsGenerating] = useState(false);

  // 저장 번호 피드백 상태
  const [batchSaveStatus, setBatchSaveStatus] = useState<{
    total: number;
    saved: number;
    duplicates: number;
    message: string;
  } | null>(null);

  // 저장된 나만의 전략 목록 상태
  const [savedStrategies, setSavedStrategies] = useState<SavedCustomStrategy[]>([]);
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  // 나만의 전략 만들기/수정 폼 상태
  const [showCustomSection, setShowCustomSection] = useState(false);
  const [editingStrategyId, setEditingStrategyId] = useState<string | null>(null);
  const [strategyNameInput, setStrategyNameInput] = useState("");
  const [fixedNumbers, setFixedNumbers] = useState<number[]>([]);
  const [excludedNumbers, setExcludedNumbers] = useState<number[]>([]);
  const [customBaseStrategy, setCustomBaseStrategy] = useState<LottoStrategyId>("balanced");

  // 피드백 알림 상태
  const [strategyFormNotice, setStrategyFormNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const latestDraw = getLatestDraw();
  const totalDrawCount = getAllDraws().length;

  // Client-side hydration
  useEffect(() => {
    setSavedStrategies(getSavedStrategies());
    setIsStorageLoaded(true);
  }, []);

  // 기본 3개 전략 즉시 생성
  const handleGenerateStrategy = (strategyId: LottoStrategyId) => {
    setSelectedStrategyId(strategyId);
    setIsGenerating(true);
    setBatchSaveStatus(null);

    setTimeout(() => {
      let newResult: StrategyGenerationResult;
      if (strategyId === "recent-trend") {
        newResult = generateRecentTrendNumbers();
        setActiveStrategyTitle("최근흐름형 조합");
      } else if (strategyId === "long-absence") {
        newResult = generateLongAbsenceNumbers();
        setActiveStrategyTitle("장기미출현형 조합");
      } else {
        newResult = generateBalancedNumbers();
        setActiveStrategyTitle("균형형 조합");
      }

      setResults([newResult]);
      setIsGenerating(false);
      window.scrollTo({ top: 500, behavior: "smooth" });
    }, 150);
  };

  // 나만의 전략 번호 일회성 만들기 (미저장 상태에서 즉시 생성)
  const handleGenerateCustomOnce = () => {
    setIsGenerating(true);
    setBatchSaveStatus(null);

    setTimeout(() => {
      const newResult = generateCustomNumbers({
        baseStrategy: customBaseStrategy,
        fixedNumbers,
        excludedNumbers,
      });

      setResults([newResult]);
      setActiveStrategyTitle(
        strategyNameInput.trim() ? `${strategyNameInput.trim()} 조합` : "맞춤 전략 조합"
      );
      setIsGenerating(false);
      window.scrollTo({ top: 500, behavior: "smooth" });
    }, 150);
  };

  // 전략 저장 버튼 핸들러 (내 전략으로 저장)
  const handleSaveStrategyForm = (e: React.FormEvent) => {
    e.preventDefault();
    setStrategyFormNotice(null);

    const res = saveStrategy({
      id: editingStrategyId || undefined,
      name: strategyNameInput,
      baseStrategy: customBaseStrategy,
      fixedNumbers,
      excludedNumbers,
    });

    if (res.success) {
      setSavedStrategies(getSavedStrategies());
      setStrategyFormNotice({
        type: "success",
        text: editingStrategyId ? "✓ 전략이 수정되었어요." : "✓ 나만의 전략을 저장했어요.",
      });

      // 폼 리셋
      setEditingStrategyId(null);
      setStrategyNameInput("");
      setFixedNumbers([]);
      setExcludedNumbers([]);
    } else {
      setStrategyFormNotice({
        type: "error",
        text: res.errorMessage || "전략 저장에 실패했습니다.",
      });
    }
  };

  // 저장된 전략 수정 버튼 클릭 시 폼으로 로드
  const handleEditSavedStrategy = (st: SavedCustomStrategy) => {
    setShowCustomSection(true);
    setEditingStrategyId(st.id);
    setStrategyNameInput(st.name);
    setFixedNumbers(st.fixedNumbers);
    setExcludedNumbers(st.excludedNumbers);
    setCustomBaseStrategy(st.baseStrategy);
    setStrategyFormNotice(null);
    window.scrollTo({ top: 250, behavior: "smooth" });
  };

  // 저장된 전략 삭제
  const handleDeleteSavedStrategy = (id: string, name: string) => {
    if (window.confirm(`"${name}" 전략을 삭제할까요?`)) {
      const updated = deleteStrategy(id);
      setSavedStrategies(updated);
    }
  };

  // 저장된 전략 카드에서 1게임 / 3게임 / 5게임 바로 생성
  const handleGenerateFromSavedStrategy = (
    st: SavedCustomStrategy,
    count: 1 | 3 | 5
  ) => {
    setIsGenerating(true);
    setBatchSaveStatus(null);

    // usageCount +1 갱신
    incrementStrategyUsage(st.id);
    setSavedStrategies(getSavedStrategies());

    setTimeout(() => {
      const generatedList = generateMultipleCustomCombinations(
        {
          baseStrategy: st.baseStrategy,
          fixedNumbers: st.fixedNumbers,
          excludedNumbers: st.excludedNumbers,
        },
        count
      );

      // 메타데이터에 커스텀 전략 정보 주입
      const enriched = generatedList.map((res) => ({
        ...res,
        metadata: {
          ...res.metadata,
          customStrategyId: st.id,
          customStrategyName: st.name,
        },
      }));

      setResults(enriched);
      setActiveStrategyTitle(`${st.name} (${count}게임)`);
      setIsGenerating(false);

      window.scrollTo({ top: 600, behavior: "smooth" });
    }, 150);
  };

  // 결과 생성된 모든 게임 내 번호에 일괄 저장
  const handleSaveAllResultsToMyNumbers = () => {
    if (results.length === 0) return;

    let savedCount = 0;
    let dupCount = 0;

    results.forEach((res) => {
      const saveRes = saveCombination({
        numbers: res.numbers,
        source: "strategy",
        strategyId: res.strategyId,
        userPickedNumbers: res.metadata.fixedNumbers ?? [],
        recommendedNumbers: res.numbers.filter(
          (n) => !(res.metadata.fixedNumbers ?? []).includes(n)
        ),
      });

      if (saveRes.success) {
        savedCount++;
      } else if (saveRes.isDuplicate) {
        dupCount++;
      }
    });

    let msg = "";
    if (results.length === 1) {
      msg = savedCount > 0 ? "✓ 내 번호에 저장했어요" : "이미 저장된 번호예요";
    } else {
      msg = `${results.length}개 중 ${savedCount}개 저장 완료${
        dupCount > 0 ? ` (${dupCount}개는 이미 저장됨)` : ""
      }`;
    }

    setBatchSaveStatus({
      total: results.length,
      saved: savedCount,
      duplicates: dupCount,
      message: msg,
    });
  };

  const getStrategyIcon = (id: LottoStrategyId) => {
    switch (id) {
      case "balanced":
        return Scale;
      case "recent-trend":
        return TrendingUp;
      case "long-absence":
        return Clock;
      default:
        return Sliders;
    }
  };

  const getStrategyNameText = (id: LottoStrategyId) => {
    switch (id) {
      case "recent-trend":
        return "최근흐름형";
      case "long-absence":
        return "장기미출현형";
      default:
        return "균형형";
    }
  };

  const getBallBadgeText = (res: StrategyGenerationResult, num: number) => {
    if (res.metadata.fixedNumbers?.includes(num)) {
      return "고정";
    }
    if (res.featuredNumbers.includes(num)) {
      if (res.strategyId === "recent-trend") return "최근";
      if (res.strategyId === "long-absence") return "미출현";
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
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
            어떤 방식으로
            <br />
            <span className="text-blue-600">번호를 구성해볼까요?</span>
          </h1>
          <p className="text-sm font-medium text-slate-500">
            나만의 전략을 만들고 보관해 1~5게임을 완성해보세요.
          </p>
        </section>

        {/* Data Status Summary Badge */}
        {latestDraw && (
          <section className="w-full bg-white rounded-xl p-3.5 border border-slate-200/70 shadow-xs flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="font-semibold text-slate-700">
                <span>데이터 연동 </span>
                <span className="text-blue-600 font-extrabold">제1회 ~ 제{latestDraw.drawNo}회</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
              총 {totalDrawCount.toLocaleString()}개 회차
            </span>
          </section>
        )}

        {/* Saved Strategy List Section (내 전략) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FolderPlus className="w-3.5 h-3.5 text-blue-600" />
              보관된 내 전략 ({savedStrategies.length})
            </h2>
          </div>

          {!isStorageLoaded ? (
            <div className="w-full bg-white rounded-2xl p-5 border border-slate-200/80 animate-pulse text-center text-xs text-slate-400">
              전략 목록을 불러오는 중...
            </div>
          ) : savedStrategies.length === 0 ? (
            <div className="w-full bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs text-center space-y-2">
              <p className="font-bold text-slate-800 text-sm">아직 저장한 전략이 없어요</p>
              <p className="text-xs text-slate-500 font-medium">
                아래 나만의 맞춤 전략 만들기에서 원하는 조건을 설정하고 저장해보세요.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedStrategies.map((st) => (
                <div
                  key={st.id}
                  className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 hover:border-blue-300 transition-all shadow-xs space-y-3.5"
                >
                  {/* Card Top Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                          {st.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-extrabold">
                          {getStrategyNameText(st.baseStrategy)}
                        </span>
                      </div>

                      {/* Fixed & Excluded Info Chips */}
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mt-1.5">
                        <span className="flex items-center gap-1 text-blue-700 font-bold">
                          <Pin className="w-3 h-3" />
                          고정 {st.fixedNumbers.length > 0 ? st.fixedNumbers.map((n) => (n < 10 ? `0${n}` : n)).join("·") : "없음"}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1 text-rose-700 font-bold">
                          <Ban className="w-3 h-3" />
                          제외 {st.excludedNumbers.length > 0 ? st.excludedNumbers.map((n) => (n < 10 ? `0${n}` : n)).join("·") : "없음"}
                        </span>
                      </div>
                    </div>

                    {/* Manage Buttons: Edit / Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditSavedStrategy(st)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="전략 수정"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSavedStrategy(st.id, st.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="전략 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 1game / 3game / 5game Quick Generate Buttons */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleGenerateFromSavedStrategy(st, 1)}
                      disabled={isGenerating}
                      className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-70"
                    >
                      <Dices className="w-3.5 h-3.5" />
                      <span>1게임</span>
                    </button>
                    <button
                      onClick={() => handleGenerateFromSavedStrategy(st, 3)}
                      disabled={isGenerating}
                      className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-70 shadow-xs"
                    >
                      <Dices className="w-3.5 h-3.5" />
                      <span>3게임</span>
                    </button>
                    <button
                      onClick={() => handleGenerateFromSavedStrategy(st, 5)}
                      disabled={isGenerating}
                      className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-70 shadow-xs"
                    >
                      <Dices className="w-3.5 h-3.5" />
                      <span>5게임</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Custom Strategy Form Accordion Card (나만의 맞춤 전략 만들기) */}
        <section className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <button
            onClick={() => setShowCustomSection(!showCustomSection)}
            className="w-full p-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80 shrink-0">
                <Settings2 className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                    {editingStrategyId ? "전략 수정하기" : "나만의 맞춤 전략 만들기"}
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-extrabold">
                    맞춤 설정
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  고정수·제외수와 기본 전략을 자유롭게 조율해 저장합니다.
                </p>
              </div>
            </div>

            <div className="text-slate-400">
              {showCustomSection ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>

          {showCustomSection && (
            <form onSubmit={handleSaveStrategyForm} className="p-5 pt-2 border-t border-slate-100 space-y-5 bg-slate-50/50">
              {/* Form Feedback Notice */}
              {strategyFormNotice && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                    strategyFormNotice.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  <Info className="w-4 h-4 shrink-0" />
                  <span>{strategyFormNotice.text}</span>
                </div>
              )}

              {/* 1. Strategy Name Input Field */}
              <div className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-2">
                <label className="text-xs font-extrabold text-slate-700 block">
                  1. 전략 이름 (필수)
                </label>
                <input
                  type="text"
                  value={strategyNameInput}
                  onChange={(e) => setStrategyNameInput(e.target.value)}
                  placeholder="예: 주말 밸런스"
                  maxLength={30}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-slate-900 font-bold text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:font-normal placeholder:text-slate-400"
                />
              </div>

              {/* 2. Custom Number Selector (Fixed & Excluded) */}
              <CustomNumberSelector
                fixedNumbers={fixedNumbers}
                excludedNumbers={excludedNumbers}
                onChangeFixed={setFixedNumbers}
                onChangeExcluded={setExcludedNumbers}
              />

              {/* 3. Base Strategy Choice */}
              <div className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
                <span className="text-xs font-extrabold text-slate-700 block">
                  3. 나머지 번호를 구성할 기본 전략 방식
                </span>

                <div className="grid grid-cols-3 gap-2">
                  {LOTTO_STRATEGIES.map((st) => {
                    const isSelected = customBaseStrategy === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setCustomBaseStrategy(st.id)}
                        className={`
                          py-2.5 px-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex flex-col items-center justify-center gap-1
                          ${
                            isSelected
                              ? "bg-blue-50 text-blue-700 border-blue-300 shadow-2xs"
                              : "bg-slate-50 text-slate-600 border-slate-200/70 hover:bg-slate-100"
                          }
                        `}
                      >
                        <span>{st.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons: Save Strategy & One-off Generate */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="submit"
                  className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>{editingStrategyId ? "전략 수정 완료" : "내 전략으로 저장"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleGenerateCustomOnce}
                  disabled={isGenerating}
                  className="h-11 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-70"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
                  <span>바로 번호 만들기</span>
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Basic 3 Strategy Cards Section */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              기본 전략 추천
            </h2>
          </div>

          <div className="space-y-3">
            {LOTTO_STRATEGIES.map((strategy) => {
              const IconComponent = getStrategyIcon(strategy.id);

              return (
                <div
                  key={strategy.id}
                  className="w-full bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-blue-200 transition-all duration-200 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80 shrink-0 mt-0.5">
                        <IconComponent className="w-5 h-5 stroke-[2]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                            {strategy.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-extrabold">
                            사용 가능
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          {strategy.shortDescription}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                    <button
                      onClick={() => handleGenerateStrategy(strategy.id)}
                      disabled={isGenerating}
                      className="w-full sm:w-auto px-4 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-70"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${
                          isGenerating && selectedStrategyId === strategy.id ? "animate-spin" : ""
                        }`}
                      />
                      <span>{strategy.name}로 만들기</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Strategy Generation Results Display Section */}
        {results.length > 0 && (
          <section className="w-full bg-white rounded-2xl p-5 border border-blue-200 shadow-md shadow-blue-500/5 space-y-5 transition-all animate-fadeIn">
            {/* Header Status */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-blue-700 font-extrabold text-sm">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>{activeStrategyTitle}</span>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                {results.length}개 게임 완성
              </span>
            </div>

            {/* Generated Games List */}
            <div className="space-y-4">
              {results.map((res, idx) => (
                <div key={idx} className="space-y-2 p-3 rounded-xl bg-slate-50/80 border border-slate-200/60">
                  <div className="flex items-center justify-between text-xs font-extrabold text-slate-500">
                    <span>GAME {idx + 1}</span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {res.metadata.customStrategyName || getStrategyNameText(res.strategyId)}
                    </span>
                  </div>

                  {/* 6 Lotto Balls Grid */}
                  <div className="flex items-center justify-between gap-1 sm:gap-2 py-1">
                    {res.numbers.map((num) => {
                      const isFixed = res.metadata.fixedNumbers?.includes(num);
                      return (
                        <LottoBall
                          key={num}
                          number={num}
                          size="md"
                          isUserPick={isFixed}
                          badgeText={getBallBadgeText(res, num)}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Batch Save Feedback Notice */}
            {batchSaveStatus && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{batchSaveStatus.message}</span>
              </div>
            )}

            {/* Action Buttons: Batch Save All */}
            <div className="pt-1">
              <button
                onClick={handleSaveAllResultsToMyNumbers}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Bookmark className="w-4 h-4" />
                <span>{results.length === 1 ? "내 번호에 저장" : `모두 내 번호에 저장 (${results.length}게임)`}</span>
              </button>
            </div>

            {/* Analysis Summary for 1st Game */}
            {results[0] && (
              <div className="pt-2 border-t border-slate-100">
                <AnalysisSummaryCard analysis={results[0].analysis} title="GAME 1 분석 결과" />
              </div>
            )}
          </section>
        )}

        {/* Disclaimer Note */}
        <section className="w-full bg-slate-100/70 border border-slate-200/60 rounded-xl p-3.5 flex items-start gap-2.5 text-slate-500 text-xs">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            과거 출현 기록을 활용한 번호 구성 방식이며 미래 추첨 결과를 예측하거나 보장하지 않습니다.
          </p>
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
