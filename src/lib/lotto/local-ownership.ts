import { SavedLottoCombination, SavedCustomStrategy } from "@/types/lotto";

/**
 * LocalStorage 데이터 소유권(ownership) 관리 및 계정별 UI 격리 유틸리티
 * 계정 간 데이터 오염(Account A -> Account B)을 방지하고 UI 노출을 완벽히 격리합니다.
 */

export const COMBINATION_OWNERS_KEY = "lotto-strategy:combination-owners";
export const STRATEGY_OWNERS_KEY = "lotto-strategy:strategy-owners";

export const ISOLATED_COMBINATIONS_KEY = "lotto-strategy:isolated-combinations";
export const ISOLATED_STRATEGIES_KEY = "lotto-strategy:isolated-strategies";

const ACTIVE_COMBINATIONS_KEY = "lotto-strategy:saved-combinations";
const ACTIVE_STRATEGIES_KEY = "lotto-strategy:saved-strategies";

const isBrowser = (): boolean => {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
};

/**
 * 특정 항목(조합 또는 전략)의 소유자(userId 또는 "guest")를 조회합니다.
 */
export function getItemOwner(key: string, id: string): string | undefined {
  if (!isBrowser()) return undefined;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return undefined;
    const map: Record<string, string> = JSON.parse(raw);
    return map[id];
  } catch {
    return undefined;
  }
}

/**
 * 특정 항목의 소유자(userId 또는 "guest")를 설정합니다.
 */
export function setItemOwner(key: string, id: string, owner: string): void {
  if (!isBrowser()) return;
  try {
    const raw = window.localStorage.getItem(key);
    const map: Record<string, string> = raw ? JSON.parse(raw) : {};
    map[id] = owner;
    window.localStorage.setItem(key, JSON.stringify(map));
  } catch {
    // ignore
  }
}

/**
 * 특정 항목 삭제 시 소유자 메타데이터도 함께 제거합니다.
 */
export function removeItemOwner(key: string, id: string): void {
  if (!isBrowser()) return;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return;
    const map: Record<string, string> = JSON.parse(raw);
    delete map[id];
    window.localStorage.setItem(key, JSON.stringify(map));
  } catch {
    // ignore
  }
}

/**
 * 별도 격리 저장소(Isolated Storage) 항목 조회
 */
export function getIsolatedItems<T>(key: string): T[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: T[] = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * 별도 격리 저장소(Isolated Storage) 항목 전체 저장
 */
export function setIsolatedItems<T>(key: string, items: T[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // ignore
  }
}

/**
 * 명시적 삭제 시 격리 저장소(Isolated Storage)에서도 해당 항목 제거
 */
export function removeIsolatedItem(key: string, id: string): void {
  if (!isBrowser()) return;
  try {
    const items = getIsolatedItems<{ id: string }>(key);
    const updated = items.filter((item) => item.id !== id);
    window.localStorage.setItem(key, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

/**
 * 로그아웃 시 현재 계정(private)의 소유 데이터를 별도 격리 저장소로 이동하여
 * Guest UI 및 타 계정 UI에 노출되지 않도록 격리 처리합니다.
 */
export function isolateNonGuestItemsOnLogout(): void {
  if (!isBrowser()) return;
  try {
    // 1. Saved Combinations 격리
    const rawActiveCombs = window.localStorage.getItem(ACTIVE_COMBINATIONS_KEY);
    const activeCombs: SavedLottoCombination[] = rawActiveCombs ? JSON.parse(rawActiveCombs) : [];
    const prevIsolatedCombs = getIsolatedItems<SavedLottoCombination>(ISOLATED_COMBINATIONS_KEY);

    const guestActiveCombs: SavedLottoCombination[] = [];
    const newIsolatedCombsMap = new Map<string, SavedLottoCombination>();
    prevIsolatedCombs.forEach((c) => newIsolatedCombsMap.set(c.id, c));

    activeCombs.forEach((c) => {
      const owner = getItemOwner(COMBINATION_OWNERS_KEY, c.id);
      if (owner === "guest") {
        guestActiveCombs.push(c);
      } else {
        // 특정 계정(private) 소유 데이터는 active에서 제거하고 isolated 저장소로 이동
        newIsolatedCombsMap.set(c.id, c);
      }
    });

    window.localStorage.setItem(ACTIVE_COMBINATIONS_KEY, JSON.stringify(guestActiveCombs));
    setIsolatedItems(ISOLATED_COMBINATIONS_KEY, Array.from(newIsolatedCombsMap.values()));

    // 2. Saved Custom Strategies 격리
    const rawActiveStrats = window.localStorage.getItem(ACTIVE_STRATEGIES_KEY);
    const activeStrats: SavedCustomStrategy[] = rawActiveStrats ? JSON.parse(rawActiveStrats) : [];
    const prevIsolatedStrats = getIsolatedItems<SavedCustomStrategy>(ISOLATED_STRATEGIES_KEY);

    const guestActiveStrats: SavedCustomStrategy[] = [];
    const newIsolatedStratsMap = new Map<string, SavedCustomStrategy>();
    prevIsolatedStrats.forEach((s) => newIsolatedStratsMap.set(s.id, s));

    activeStrats.forEach((s) => {
      const owner = getItemOwner(STRATEGY_OWNERS_KEY, s.id);
      if (owner === "guest") {
        guestActiveStrats.push(s);
      } else {
        newIsolatedStratsMap.set(s.id, s);
      }
    });

    window.localStorage.setItem(ACTIVE_STRATEGIES_KEY, JSON.stringify(guestActiveStrats));
    setIsolatedItems(ISOLATED_STRATEGIES_KEY, Array.from(newIsolatedStratsMap.values()));
  } catch (error) {
    console.error("Failed to isolate items on logout:", error);
  }
}
