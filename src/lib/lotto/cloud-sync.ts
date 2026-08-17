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
import {
  getItemOwner,
  setItemOwner,
  getIsolatedItems,
  setIsolatedItems,
  COMBINATION_OWNERS_KEY,
  STRATEGY_OWNERS_KEY,
  ISOLATED_COMBINATIONS_KEY,
  ISOLATED_STRATEGIES_KEY,
} from "./local-ownership";

const COMBINATIONS_STORAGE_KEY = "lotto-strategy:saved-combinations";
const STRATEGIES_STORAGE_KEY = "lotto-strategy:saved-strategies";
const LAST_SYNC_KEY = "lotto-strategy:last-sync-at";
const LAST_SYNCED_USER_ID_KEY = "lotto-strategy:last-synced-user-id";

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
    const lastSyncedUserId = window.localStorage.getItem(LAST_SYNCED_USER_ID_KEY);
    // 동일 브라우저에서 계정이 전환된 경우 (Account A -> Logout -> Account B)
    const isAccountSwitched = !!lastSyncedUserId && lastSyncedUserId !== userId;

    // ----------------------------------------------------
    // 1. Saved Combinations 동기화 (Active Storage + Isolated Storage 탐색)
    // ----------------------------------------------------
    const activeLocalCombs = getSavedCombinations();
    const prevIsolatedCombs = getIsolatedItems<SavedLottoCombination>(ISOLATED_COMBINATIONS_KEY);

    const allCombsMap = new Map<string, SavedLottoCombination>();
    activeLocalCombs.forEach((c) => allCombsMap.set(c.id, c));
    prevIsolatedCombs.forEach((c) => {
      if (!allCombsMap.has(c.id)) {
        allCombsMap.set(c.id, c);
      }
    });

    const allLocalCombs = Array.from(allCombsMap.values());

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

    // 명시적 소유권(ownership) 기반 데이터 격리 및 분리
    // 1) eligibleCombs: 현재 계정 B에 병합/업로드 가능한 데이터 (guest, currentUser, 허용 legacy)
    // 2) isolatedCombs: 다른 계정 A 소유 또는 계정 전환 상황의 legacy 격리 데이터 (별도 isolated storage에 보존)
    const eligibleCombs: SavedLottoCombination[] = [];
    const isolatedCombs: SavedLottoCombination[] = [];

    allLocalCombs.forEach((c) => {
      const owner = getItemOwner(COMBINATION_OWNERS_KEY, c.id);
      if (owner === "guest" || owner === userId) {
        eligibleCombs.push(c);
      } else if (owner !== undefined && owner !== userId) {
        isolatedCombs.push(c);
      } else {
        // legacy 데이터 (owner 메타데이터 없음)
        if (!isAccountSwitched) {
          eligibleCombs.push(c);
        } else {
          isolatedCombs.push(c);
        }
      }
    });

    const mergedEligibleCombs = mergeCombinations(eligibleCombs, cloudCombs);

    // 병합된 eligible 조합의 소유권을 현재 계정(userId)으로 승격/기록
    mergedEligibleCombs.forEach((c) => setItemOwner(COMBINATION_OWNERS_KEY, c.id, userId));

    // Active Storage 저장: 오직 현재 계정에 속한 eligible 데이터만 saved-combinations에 저장 (UI 노출용)
    const activeCombs = mergedEligibleCombs.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    window.localStorage.setItem(COMBINATIONS_STORAGE_KEY, JSON.stringify(activeCombs));

    // Isolated Storage 저장: 타 계정 소유 및 격리 데이터만 isolated-combinations에만 보존 (UI 노출 차단)
    setIsolatedItems(ISOLATED_COMBINATIONS_KEY, isolatedCombs);

    // Cloud upsert: 오직 mergedEligibleCombs만 현재 계정 Cloud에 반영 (isolatedCombs는 절대 업로드 금지)
    if (mergedEligibleCombs.length > 0) {
      const combRowsToUpsert = mergedEligibleCombs.map((c) => combinationToRow(c, userId));
      const { error: upsertCombError } = await supabase
        .from("saved_combinations")
        .upsert(combRowsToUpsert, { onConflict: "id" });

      if (upsertCombError) {
        console.warn("Cloud combinations upsert failed:", upsertCombError.message);
      }
    }

    // ----------------------------------------------------
    // 2. Saved Custom Strategies 동기화 (Active Storage + Isolated Storage 탐색)
    // ----------------------------------------------------
    const activeLocalStrats = getSavedStrategies();
    const prevIsolatedStrats = getIsolatedItems<SavedCustomStrategy>(ISOLATED_STRATEGIES_KEY);

    const allStratsMap = new Map<string, SavedCustomStrategy>();
    activeLocalStrats.forEach((s) => allStratsMap.set(s.id, s));
    prevIsolatedStrats.forEach((s) => {
      if (!allStratsMap.has(s.id)) {
        allStratsMap.set(s.id, s);
      }
    });

    const allLocalStrats = Array.from(allStratsMap.values());

    const { data: cloudStratRows, error: fetchStratError } = await supabase
      .from("saved_custom_strategies")
      .select("*")
      .eq("user_id", userId);

    if (fetchStratError) {
      console.warn("Cloud strategies fetch failed:", fetchStratError.message);
      return {
        success: false,
        syncedCombinationsCount: mergedEligibleCombs.length,
        syncedStrategiesCount: 0,
        error: fetchStratError.message,
      };
    }

    const cloudStrats = (cloudStratRows as SavedCustomStrategyRow[] || []).map(rowToStrategy);

    const eligibleStrats: SavedCustomStrategy[] = [];
    const isolatedStrats: SavedCustomStrategy[] = [];

    allLocalStrats.forEach((s) => {
      const owner = getItemOwner(STRATEGY_OWNERS_KEY, s.id);
      if (owner === "guest" || owner === userId) {
        eligibleStrats.push(s);
      } else if (owner !== undefined && owner !== userId) {
        isolatedStrats.push(s);
      } else {
        if (!isAccountSwitched) {
          eligibleStrats.push(s);
        } else {
          isolatedStrats.push(s);
        }
      }
    });

    const mergedEligibleStrats = mergeCustomStrategies(eligibleStrats, cloudStrats);

    // 병합된 eligible 전략의 소유권을 현재 계정(userId)으로 승격/기록
    mergedEligibleStrats.forEach((s) => setItemOwner(STRATEGY_OWNERS_KEY, s.id, userId));

    // Active Storage 저장: 오직 현재 계정에 속한 eligible 전략만 saved-strategies에 저장 (UI 노출용)
    const activeStrats = mergedEligibleStrats.sort(
      (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
    );
    window.localStorage.setItem(STRATEGIES_STORAGE_KEY, JSON.stringify(activeStrats));

    // Isolated Storage 저장: 타 계정 소유 및 격리 전략만 isolated-strategies에만 보존 (UI 노출 차단)
    setIsolatedItems(ISOLATED_STRATEGIES_KEY, isolatedStrats);

    // Cloud upsert: 오직 mergedEligibleStrats만 현재 계정 Cloud에 반영 (isolatedStrats 절대 업로드 금지)
    if (mergedEligibleStrats.length > 0) {
      const stratRowsToUpsert = mergedEligibleStrats.map((s) => strategyToRow(s, userId));
      const { error: upsertStratError } = await supabase
        .from("saved_custom_strategies")
        .upsert(stratRowsToUpsert, { onConflict: "id" });

      if (upsertStratError) {
        console.warn("Cloud strategies upsert failed:", upsertStratError.message);
      }
    }

    const nowIso = new Date().toISOString();
    window.localStorage.setItem(LAST_SYNC_KEY, nowIso);
    window.localStorage.setItem(LAST_SYNCED_USER_ID_KEY, userId);

    return {
      success: true,
      isGuest: false,
      syncedCombinationsCount: mergedEligibleCombs.length,
      syncedStrategiesCount: mergedEligibleStrats.length,
      lastSyncedAt: nowIso,
    };
  } catch (err: unknown) {
    console.error("User lotto data sync exception:", err);
    return {
      success: false,
      syncedCombinationsCount: 0,
      syncedStrategiesCount: 0,
      error: (err as Error)?.message || "Sync failed",
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
