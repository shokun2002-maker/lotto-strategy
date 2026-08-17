import { SavedCustomStrategy, LottoStrategyId } from "@/types/lotto";
import {
  syncSingleStrategyToCloud,
  deleteSingleStrategyFromCloud,
} from "./cloud-sync";
import {
  setItemOwner,
  removeItemOwner,
  removeIsolatedItem,
  STRATEGY_OWNERS_KEY,
  ISOLATED_STRATEGIES_KEY,
} from "./local-ownership";

const STORAGE_KEY = "lotto-strategy:saved-strategies";

/**
 * SSR 환경 체크 및 안전한 window.localStorage 접근
 */
const isBrowser = (): boolean => {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
};

/**
 * 저장된 모든 커스텀 전략 조회 (수정일/생성일 내림차순)
 */
export function getSavedStrategies(): SavedCustomStrategy[] {
  if (!isBrowser()) return [];

  try {
    const rawData = window.localStorage.getItem(STORAGE_KEY);
    if (!rawData) return [];

    const parsed: SavedCustomStrategy[] = JSON.parse(rawData);
    if (!Array.isArray(parsed)) return [];

    return parsed.sort(
      (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
    );
  } catch (error) {
    console.error("Failed to load saved strategies from LocalStorage:", error);
    return [];
  }
}

/**
 * ID로 특정 커스텀 전략 조회
 */
export function getStrategyById(id: string): SavedCustomStrategy | undefined {
  const items = getSavedStrategies();
  return items.find((item) => item.id === id);
}

/**
 * 커스텀 전략 신규 저장 또는 수정
 */
export function saveStrategy(
  params: {
    id?: string;
    name: string;
    baseStrategy: LottoStrategyId;
    fixedNumbers: number[];
    excludedNumbers: number[];
  },
  ownerUserId?: string
): {
  success: boolean;
  isDuplicateName: boolean;
  errorMessage?: string;
  savedItem?: SavedCustomStrategy;
} {
  if (!isBrowser()) return { success: false, isDuplicateName: false };

  const trimmedName = params.name.trim();

  // 1. 이름 필수 및 길이제한 검증
  if (!trimmedName) {
    return { success: false, isDuplicateName: false, errorMessage: "전략 이름을 입력해주세요." };
  }
  if (trimmedName.length > 30) {
    return { success: false, isDuplicateName: false, errorMessage: "전략 이름은 최대 30자까지 입력 가능합니다." };
  }

  const existingStrategies = getSavedStrategies();

  // 2. 동일 이름 중복 검사 (수정 시 자기 자신 ID 제외)
  const normalizedName = trimmedName.toLowerCase().replace(/\s+/g, "");
  const isDuplicate = existingStrategies.some(
    (item) => item.id !== params.id && item.name.toLowerCase().replace(/\s+/g, "") === normalizedName
  );

  if (isDuplicate) {
    return { success: false, isDuplicateName: true, errorMessage: "같은 이름의 전략이 이미 존재합니다." };
  }

  const now = new Date().toISOString();
  const sortedFixed = [...(params.fixedNumbers ?? [])].sort((a, b) => a - b);
  const sortedExcluded = [...(params.excludedNumbers ?? [])].sort((a, b) => a - b);

  let updatedList: SavedCustomStrategy[];
  let targetItem: SavedCustomStrategy;

  if (params.id) {
    // 기존 전략 수정
    const existingItem = existingStrategies.find((item) => item.id === params.id);
    targetItem = {
      id: params.id,
      name: trimmedName,
      baseStrategy: params.baseStrategy,
      fixedNumbers: sortedFixed,
      excludedNumbers: sortedExcluded,
      createdAt: existingItem ? existingItem.createdAt : now,
      updatedAt: now,
      lastUsedAt: existingItem?.lastUsedAt,
      usageCount: existingItem ? existingItem.usageCount : 0,
    };

    updatedList = existingStrategies.map((item) => (item.id === params.id ? targetItem : item));
  } else {
    // 신규 전략 저장
    targetItem = {
      id: `strategy_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: trimmedName,
      baseStrategy: params.baseStrategy,
      fixedNumbers: sortedFixed,
      excludedNumbers: sortedExcluded,
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
    };

    updatedList = [targetItem, ...existingStrategies];
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    // Record explicit ownership metadata ("guest" or auth.uid())
    const owner = ownerUserId?.trim() || "guest";
    setItemOwner(STRATEGY_OWNERS_KEY, targetItem.id, owner);

    // Secondary Cloud Sync
    syncSingleStrategyToCloud(targetItem);

    return { success: true, isDuplicateName: false, savedItem: targetItem };
  } catch (error) {
    console.error("Failed to save strategy to LocalStorage:", error);
    return { success: false, isDuplicateName: false, errorMessage: "저장 도중 오류가 발생했습니다." };
  }
}

/**
 * 저장된 커스텀 전략 삭제
 */
export function deleteStrategy(id: string): SavedCustomStrategy[] {
  if (!isBrowser()) return [];

  try {
    const existing = getSavedStrategies();
    const updated = existing.filter((item) => item.id !== id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Remove ownership metadata & remove from isolated storage if present
    removeItemOwner(STRATEGY_OWNERS_KEY, id);
    removeIsolatedItem(ISOLATED_STRATEGIES_KEY, id);

    // Secondary Cloud Delete
    deleteSingleStrategyFromCloud(id);

    return updated;
  } catch (error) {
    console.error("Failed to delete strategy from LocalStorage:", error);
    return getSavedStrategies();
  }
}

/**
 * 커스텀 전략 실행 횟수(usageCount) 1 증가 및 최근 사용 시간 갱신
 */
export function incrementStrategyUsage(id: string): void {
  if (!isBrowser()) return;

  try {
    const existing = getSavedStrategies();
    const now = new Date().toISOString();
    let updatedTarget: SavedCustomStrategy | null = null;

    const updated = existing.map((item) => {
      if (item.id === id) {
        updatedTarget = {
          ...item,
          usageCount: item.usageCount + 1,
          lastUsedAt: now,
          updatedAt: now,
        };
        return updatedTarget;
      }
      return item;
    });

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    if (updatedTarget) {
      syncSingleStrategyToCloud(updatedTarget);
    }
  } catch (error) {
    console.error("Failed to increment strategy usage in LocalStorage:", error);
  }
}
