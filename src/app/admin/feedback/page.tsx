"use client";

import React, { useState, useEffect, useCallback } from "react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import BottomNavigation from "@/components/common/BottomNavigation";
import {
  ShieldAlert,
  Filter,
  AlertTriangle,
  Clock,
  MessageSquare,
  Save,
  RefreshCw,
} from "lucide-react";

interface FeedbackItem {
  id: string;
  user_id: string | null;
  user_type: string;
  created_at: string;
  updated_at: string;
  page: string | null;
  category: "general" | "bug" | "ux" | "feature";
  message: string;
  device_type: string | null;
  os: string | null;
  browser: string | null;
  app_mode: string | null;
  severity: "UNCLASSIFIED" | "P0" | "P1" | "P2" | "P3";
  status: "NEW" | "CONFIRMED" | "IN_PROGRESS" | "FIXED" | "RETEST" | "CLOSED" | "WONT_FIX";
  admin_note: string | null;
  resolved_at: string | null;
}

export default function AdminFeedbackPage() {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  // Editing items state
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadFeedback = useCallback(async (status: string, severity: string, category: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const params = new URLSearchParams();
      if (status !== "ALL") params.set("status", status);
      if (severity !== "ALL") params.set("severity", severity);
      if (category !== "ALL") params.set("category", category);

      const res = await fetch(`/api/admin/feedback?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "관리자 피드백 목록을 불러오지 못했습니다.");
        setFeedbackList([]);
        return;
      }

      setFeedbackList(data.feedback || []);
      const notesMap: Record<string, string> = {};
      (data.feedback || []).forEach((item: FeedbackItem) => {
        notesMap[item.id] = item.admin_note || "";
      });
      setEditingNotes(notesMap);
    } catch {
      setErrorMsg("통신 오류로 관리자 피드백을 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeedback = useCallback(() => {
    return loadFeedback(filterStatus, filterSeverity, filterCategory);
  }, [loadFeedback, filterStatus, filterSeverity, filterCategory]);

  useEffect(() => {
    let ignore = false;
    async function run() {
      if (!ignore) {
        await fetchFeedback();
      }
    }
    run();
    return () => {
      ignore = true;
    };
  }, [fetchFeedback]);

  const handleUpdateItem = async (id: string, newSeverity?: string, newStatus?: string) => {
    setSavingId(id);
    try {
      const currentItem = feedbackList.find((item) => item.id === id);
      const res = await fetch("/api/admin/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          severity: newSeverity ?? currentItem?.severity,
          status: newStatus ?? currentItem?.status,
          adminNote: editingNotes[id] ?? currentItem?.admin_note,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "수정 실패");
        return;
      }

      setFeedbackList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...data.feedback } : item))
      );
    } catch {
      alert("수정 처리 중 네트워크 오류가 발생했습니다.");
    } finally {
      setSavingId(null);
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case "P0":
        return "bg-rose-600 text-white font-black animate-pulse";
      case "P1":
        return "bg-rose-100 text-rose-800 border-rose-300 font-extrabold";
      case "P2":
        return "bg-amber-100 text-amber-800 border-amber-300 font-bold";
      case "P3":
        return "bg-slate-100 text-slate-700 border-slate-300 font-medium";
      default:
        return "bg-purple-100 text-purple-800 border-purple-200 font-bold";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-100 text-blue-800 border-blue-200 font-bold";
      case "CONFIRMED":
        return "bg-amber-100 text-amber-800 border-amber-200 font-bold";
      case "IN_PROGRESS":
        return "bg-indigo-100 text-indigo-800 border-indigo-200 font-bold";
      case "FIXED":
      case "CLOSED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 font-bold";
      case "RETEST":
        return "bg-purple-100 text-purple-800 border-purple-200 font-bold";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200 font-medium";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      <Header title="관리자 피드백 대시보드" showBackButton={true} backHref="/my" />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-4 space-y-6">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-extrabold text-xs mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>ADMINISTRATOR ONLY</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">베타 피드백 관리 대시보드</h1>
          </div>
          <button
            onClick={fetchFeedback}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs hover:bg-slate-50 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>새로고침</span>
          </button>
        </div>

        {/* Error / Unauthorized Notice */}
        {errorMsg ? (
          <div className="w-full bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-extrabold text-rose-900">{errorMsg}</h2>
            <p className="text-xs text-rose-700 font-medium">
              관리자 계정(`ADMIN_USER_IDS` 등록 계정)으로 로그인 후 접근 가능합니다.
            </p>
          </div>
        ) : (
          <>
            {/* Filter Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                <span>필터 검색</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="ALL">전체 상태</option>
                    <option value="NEW">NEW (새 접수)</option>
                    <option value="CONFIRMED">CONFIRMED (확인됨)</option>
                    <option value="IN_PROGRESS">IN_PROGRESS (진행중)</option>
                    <option value="FIXED">FIXED (수정됨)</option>
                    <option value="RETEST">RETEST (재테스트)</option>
                    <option value="CLOSED">CLOSED (종료됨)</option>
                    <option value="WONT_FIX">WONT_FIX (보류)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Severity</label>
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="ALL">전체 심각도</option>
                    <option value="UNCLASSIFIED">UNCLASSIFIED</option>
                    <option value="P0">P0 (Critical)</option>
                    <option value="P1">P1 (High)</option>
                    <option value="P2">P2 (Medium)</option>
                    <option value="P3">P3 (Low)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="ALL">전체 카테고리</option>
                    <option value="general">일반/기타</option>
                    <option value="bug">오류/버그</option>
                    <option value="ux">사용 불편함</option>
                    <option value="feature">기능 제안</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Feedback List */}
            {loading ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-medium animate-pulse">
                관리자 피드백 목록을 불러오는 중...
              </div>
            ) : feedbackList.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-medium space-y-1">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-slate-700">접수된 피드백이 없습니다.</p>
                <p>선택한 필터 조건에 해당하는 피드백이 없거나 아직 등록되지 않았습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs text-slate-500 font-medium px-1">
                  <span>총 <strong>{feedbackList.length}</strong>건의 피드백</span>
                </div>

                {feedbackList.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3.5 transition-all"
                  >
                    {/* Top Meta Line */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] border ${getSeverityBadgeClass(item.severity)}`}>
                          {item.severity}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] border ${getStatusBadgeClass(item.status)}`}>
                          {item.status}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                          {item.category}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
                          {item.user_type}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(item.created_at).toLocaleString("ko-KR")}</span>
                      </div>
                    </div>

                    {/* Message Body */}
                    <div className="space-y-1.5">
                      <p className="text-sm font-semibold text-slate-900 leading-relaxed whitespace-pre-wrap">
                        {item.message}
                      </p>
                    </div>

                    {/* Environment Details */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 font-medium bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                      {item.page && <span>📍 페이지: <strong>{item.page}</strong></span>}
                      {item.device_type && <span>📱 기기: <strong>{item.device_type}</strong></span>}
                      {item.os && <span>💻 OS: <strong>{item.os}</strong></span>}
                      {item.browser && <span>🌐 브라우저: <strong>{item.browser}</strong></span>}
                      {item.app_mode && <span>🚀 실행모드: <strong>{item.app_mode}</strong></span>}
                    </div>

                    {/* Admin Controls */}
                    <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Severity 변경</label>
                        <select
                          value={item.severity}
                          onChange={(e) => handleUpdateItem(item.id, e.target.value, undefined)}
                          disabled={savingId === item.id}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                        >
                          <option value="UNCLASSIFIED">UNCLASSIFIED</option>
                          <option value="P0">P0 (Critical)</option>
                          <option value="P1">P1 (High)</option>
                          <option value="P2">P2 (Medium)</option>
                          <option value="P3">P3 (Low)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Status 변경</label>
                        <select
                          value={item.status}
                          onChange={(e) => handleUpdateItem(item.id, undefined, e.target.value)}
                          disabled={savingId === item.id}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                        >
                          <option value="NEW">NEW</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="FIXED">FIXED</option>
                          <option value="RETEST">RETEST</option>
                          <option value="CLOSED">CLOSED</option>
                          <option value="WONT_FIX">WONT_FIX</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 block">관리자 메모</label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={editingNotes[item.id] ?? ""}
                            onChange={(e) =>
                              setEditingNotes({ ...editingNotes, [item.id]: e.target.value })
                            }
                            placeholder="메모 작성..."
                            className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                          />
                          <button
                            onClick={() => handleUpdateItem(item.id)}
                            disabled={savingId === item.id}
                            className="px-3 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>저장</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
      <BottomNavigation />
    </div>
  );
}
