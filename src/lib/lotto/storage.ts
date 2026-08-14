import { SavedLottoCombination, LottoCombinationSource, LottoStrategyId } from "@/types/lotto";
import { getNextDrawInfo } from "./draw-schedule";
import {
  syncSingleCombinationToCloud,
  deleteSingleCombinationFromCloud,
  clearAllCombinationsFromCloud as clearCloudCombs,
} from "./cloud-sync";

const STORAGE_KEY = "lotto-strategy:saved-combinations";

/**
 * SSR 환경 체크 및 안전한 window.localStorage 접근
 */
const isBrowser = (): boolean => {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
};

/**
 * 저장된 모든 번호 조합 조회 (최신순 정렬)
 */
export function getSavedCombinations(): SavedLottoCombination[] {
  if (!isBrowser()) return [];

  try {
    const rawData = window.localStorage.getItem(STORAGE_KEY);
    if (!rawData) return [];
    
    const parsed: SavedLottoCombination[] = JSON.parse(rawData);
    if (!Array.isArray(parsed)) return [];

    // 최신순 (createdAt 내림차순) 정렬
    return parsed.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("Failed to load saved combinations from LocalStorage:", error);
    return [];
  }
}

/**
 * 특정 조합이 이미 저장되어 있는지 (숫자 6개 + targetDrawNo 기준) 중복 체크
 */
export function isCombinationSaved(numbers: number[], targetDrawNo?: number): boolean {
  if (!isBrowser()) return false;

  const targetDraw = targetDrawNo ?? getNextDrawInfo().drawNo;
  const currentKey = `${[...numbers].sort((a, b) => a - b).join(",")}_${targetDraw}`;
  const items = getSavedCombinations();

  return items.some((item) => {
    const itemTarget = item.targetDrawNo ?? 0;
    const itemKey = `${[...item.numbers].sort((a, b) => a - b).join(",")}_${itemTarget}`;
    return itemKey === currentKey;
  });
}

/**
 * 새로운 번호 조합 저장 (targetDrawNo 자동 할당 및 회차별 중복 방지 적용)
 */
export function saveCombination(params: {
  numbers: number[];
  source: LottoCombinationSource;
  targetDrawNo?: number;
  strategyId?: LottoStrategyId;
  userPickedNumbers?: number[];
  recommendedNumbers?: number[];
}): { success: boolean; isDuplicate: boolean; savedItem?: SavedLottoCombination } {
  if (!isBrowser()) return { success: false, isDuplicate: false };

  const targetDrawNo = params.targetDrawNo ?? getNextDrawInfo().drawNo;
  const sortedNumbers = [...params.numbers].sort((a, b) => a - b);
  const userPicked = [...(params.userPickedNumbers ?? [])].sort((a, b) => a - b);
  const recommended = (params.recommendedNumbers ?? sortedNumbers.filter((n) => !userPicked.includes(n))).sort((a, b) => a - b);

  // 회차별 중복 체크
  if (isCombinationSaved(sortedNumbers, targetDrawNo)) {
    return { success: false, isDuplicate: true };
  }

  const newItem: SavedLottoCombination = {
    id: `combination_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    numbers: sortedNumbers,
    source: params.source,
    targetDrawNo,
    strategyId: params.strategyId,
    userPickedNumbers: userPicked,
    recommendedNumbers: recommended,
    createdAt: new Date().toISOString(),
  };

  try {
    const existing = getSavedCombinations();
    const updated = [newItem, ...existing];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Secondary Cloud Sync (비동기 처리)
    syncSingleCombinationToCloud(newItem);

    return { success: true, isDuplicate: false, savedItem: newItem };
  } catch (error) {
    console.error("Failed to save combination to LocalStorage:", error);
    return { success: false, isDuplicate: false };
  }
}

/**
 * 특정 조합 삭제
 */
export function deleteCombination(id: string): SavedLottoCombination[] {
  if (!isBrowser()) return [];

  try {
    const existing = getSavedCombinations();
    const updated = existing.filter((item) => item.id !== id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Secondary Cloud Delete
    deleteSingleCombinationFromCloud(id);

    return updated;
  } catch (error) {
    console.error("Failed to delete combination from LocalStorage:", error);
    return getSavedCombinations();
  }
}

/**
 * 모든 저장 조합 삭제
 */
export function clearAllCombinations(): void {
  if (!isBrowser()) return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
    // Secondary Cloud Clear
    clearCloudCombs();
  } catch (error) {
    console.error("Failed to clear combinations from LocalStorage:", error);
  }
}
