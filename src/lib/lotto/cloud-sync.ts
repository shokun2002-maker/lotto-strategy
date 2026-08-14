import { SavedLottoCombination, SavedCustomStrategy } from "@/types/lotto";
import { createClient } from "@/lib/supabase/client";
import { getSavedCombinations } from "./storage";
import { getSavedStrategies } from "./strategy-storage";
import {
  combinationToRow,
  rowToCombination,
  strategyToRow,
  rowToStrategy,
  SavedLottoCombinationRow,
  SavedCustomStrategyRow,
} from "./cloud-mapper";
import { mergeCombinations, mergeCustomStrategies } from "./cloud-merge";

const COMBINATIONS_STORAGE_KEY = "lotto-strategy:saved-combinations";
const STRATEGIES_STORAGE_KEY = "lotto-strategy:saved-strategies";
const LAST_SYNC_KEY = "lotto-strategy:last-sync-at";

export interface SyncResult {
  success: boolean;
  isGuest?: boolean;
  syncedCombinationsCount: number;
  syncedStrategiesCount: number;
  lastSyncedAt?: string;
  error?: string;
}

const isBrowser = (): boolean => {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
};

/**
 * 마지막 클라우드 동기화 완료 일시 조회
 */
export function getLastSyncedAt(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(LAST_SYNC_KEY);
}

/**
 * 사용자 번호 및 전략 클라우드 양방향 안전 동기화 핵심 함수
 */
export async function syncUserLottoData(): Promise<SyncResult> {
  if (!isBrowser()) {
    return { success: false, syncedCombinationsCount: 0, syncedStrategiesCount: 0, error: "Non-browser environment" };
  }

  // 오프라인 상태 체크
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { success: false, syncedCombinationsCount: 0, syncedStrategiesCount: 0, error: "Network offline" };
  }

  try {
    const supabase = createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    // 비로그인 (Guest) 사용자 처리: Supabase 요청 없이 정상 완료
    if (userError || !userData.user) {
      return { success: true, isGuest: true, syncedCombinationsCount: 0, syncedStrategiesCount: 0 };
    }

    const userId = userData.user.id;

    // ----------------------------------------------------
    // 1. Saved Combinations 동기화
    // ----------------------------------------------------
    const localCombs = getSavedCombinations();

    const { data: cloudCombRows, error: fetchCombError } = await supabase
      .from("saved_combinations")
      .select("*")
      .eq("user_id", userId);

    if (fetchCombError) {
      console.warn("Cloud combinations fetch failed:", fetchCombError.message);
      return {
        success: false,
        syncedCombinationsCount: 0,
        syncedStrategiesCount: 0,
        error: fetchCombError.message,
      };
    }

    const cloudCombs = (cloudCombRows as SavedLottoCombinationRow[] || []).map(rowToCombination);
    const mergedCombs = mergeCombinations(localCombs, cloudCombs);

    // 병합 결과를 LocalStorage에 즉시 반영 (Local Cache/Offline Backup)
    window.localStorage.setItem(COMBINATIONS_STORAGE_KEY, JSON.stringify(mergedCombs));

    // Cloud upsert
    if (mergedCombs.length > 0) {
      const combRowsToUpsert = mergedCombs.map((c) => combinationToRow(c, userId));
      const { error: upsertCombError } = await supabase
        .from("saved_combinations")
        .upsert(combRowsToUpsert, { onConflict: "id" });

      if (upsertCombError) {
        console.warn("Cloud combinations upsert failed:", upsertCombError.message);
      }
    }

    // ----------------------------------------------------
    // 2. Saved Custom Strategies 동기화
    // ----------------------------------------------------
    const localStrats = getSavedStrategies();

    const { data: cloudStratRows, error: fetchStratError } = await supabase
      .from("saved_custom_strategies")
      .select("*")
      .eq("user_id", userId);

    if (fetchStratError) {
      console.warn("Cloud strategies fetch failed:", fetchStratError.message);
      return {
        success: false,
        syncedCombinationsCount: mergedCombs.length,
        syncedStrategiesCount: 0,
        error: fetchStratError.message,
      };
    }

    const cloudStrats = (cloudStratRows as SavedCustomStrategyRow[] || []).map(rowToStrategy);
    const mergedStrats = mergeCustomStrategies(localStrats, cloudStrats);

    // 병합 결과를 LocalStorage에 즉시 반영
    window.localStorage.setItem(STRATEGIES_STORAGE_KEY, JSON.stringify(mergedStrats));

    // Cloud upsert
    if (mergedStrats.length > 0) {
      const stratRowsToUpsert = mergedStrats.map((s) => strategyToRow(s, userId));
      const { error: upsertStratError } = await supabase
        .from("saved_custom_strategies")
        .upsert(stratRowsToUpsert, { onConflict: "id" });

      if (upsertStratError) {
        console.warn("Cloud strategies upsert failed:", upsertStratError.message);
      }
    }

    const nowIso = new Date().toISOString();
    window.localStorage.setItem(LAST_SYNC_KEY, nowIso);

    return {
      success: true,
      isGuest: false,
      syncedCombinationsCount: mergedCombs.length,
      syncedStrategiesCount: mergedStrats.length,
      lastSyncedAt: nowIso,
    };
  } catch (err: any) {
    console.error("User lotto data sync exception:", err);
    return {
      success: false,
      syncedCombinationsCount: 0,
      syncedStrategiesCount: 0,
      error: err?.message || "Sync failed",
    };
  }
}

/**
 * 단일 조합 저장/수정 시 Secondary Cloud Upsert (비동기 안전 수행)
 */
export async function syncSingleCombinationToCloud(item: SavedLottoCombination): Promise<void> {
  if (!isBrowser() || (typeof navigator !== "undefined" && !navigator.onLine)) return;

  try {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const row = combinationToRow(item, userData.user.id);
    await supabase.from("saved_combinations").upsert(row, { onConflict: "id" });
  } catch (err) {
    console.warn("Single combination cloud sync failed:", err);
  }
}

/**
 * 단일 조합 삭제 시 Secondary Cloud Delete (비동기 안전 수행)
 */
export async function deleteSingleCombinationFromCloud(id: string): Promise<void> {
  if (!isBrowser() || (typeof navigator !== "undefined" && !navigator.onLine)) return;

  try {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    await supabase.from("saved_combinations").delete().eq("id", id).eq("user_id", userData.user.id);
  } catch (err) {
    console.warn("Single combination cloud delete failed:", err);
  }
}

/**
 * 전체 조합 삭제 시 Secondary Cloud Clear (비동기 안전 수행)
 */
export async function clearAllCombinationsFromCloud(): Promise<void> {
  if (!isBrowser() || (typeof navigator !== "undefined" && !navigator.onLine)) return;

  try {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    await supabase.from("saved_combinations").delete().eq("user_id", userData.user.id);
  } catch (err) {
    console.warn("All combinations cloud clear failed:", err);
  }
}

/**
 * 단일 전략 저장/수정/사용 시 Secondary Cloud Upsert (비동기 안전 수행)
 */
export async function syncSingleStrategyToCloud(st: SavedCustomStrategy): Promise<void> {
  if (!isBrowser() || (typeof navigator !== "undefined" && !navigator.onLine)) return;

  try {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const row = strategyToRow(st, userData.user.id);
    await supabase.from("saved_custom_strategies").upsert(row, { onConflict: "id" });
  } catch (err) {
    console.warn("Single strategy cloud sync failed:", err);
  }
}

/**
 * 단일 전략 삭제 시 Secondary Cloud Delete (비동기 안전 수행)
 */
export async function deleteSingleStrategyFromCloud(id: string): Promise<void> {
  if (!isBrowser() || (typeof navigator !== "undefined" && !navigator.onLine)) return;

  try {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    await supabase.from("saved_custom_strategies").delete().eq("id", id).eq("user_id", userData.user.id);
  } catch (err) {
    console.warn("Single strategy cloud delete failed:", err);
  }
}
