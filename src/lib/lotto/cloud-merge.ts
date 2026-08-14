import { SavedLottoCombination, SavedCustomStrategy } from "@/types/lotto";

/**
 * 조합 객체의 의미적 Canonical Key 생성 (targetDrawNo + 오름차순 정렬 번호 조합)
 */
export function getCombinationCanonicalKey(item: SavedLottoCombination): string {
  const sortedNums = [...item.numbers].sort((a, b) => a - b).join(",");
  const drawKey = item.targetDrawNo ?? 0;
  return `${drawKey}_${sortedNums}`;
}

/**
 * Local과 Cloud 조합 목록을 안전하게 병합 (중복 제거 및 최신 데이터 유지)
 */
export function mergeCombinations(
  localItems: SavedLottoCombination[],
  cloudItems: SavedLottoCombination[]
): SavedLottoCombination[] {
  const mergedMap = new Map<string, SavedLottoCombination>();
  const keyToIdMap = new Map<string, string>();

  const processItem = (item: SavedLottoCombination) => {
    const canonicalKey = getCombinationCanonicalKey(item);

    // 1. ID 기준 기존 존재 체크
    if (mergedMap.has(item.id)) {
      const existing = mergedMap.get(item.id)!;
      const existingTime = new Date(existing.createdAt).getTime();
      const itemTime = new Date(item.createdAt).getTime();

      if (itemTime > existingTime) {
        mergedMap.set(item.id, item);
      }
      return;
    }

    // 2. 의미상 동일 조합 (targetDrawNo + numbers) 기준 체크
    if (keyToIdMap.has(canonicalKey)) {
      const existingId = keyToIdMap.get(canonicalKey)!;
      const existing = mergedMap.get(existingId)!;

      const existingTime = new Date(existing.createdAt).getTime();
      const itemTime = new Date(item.createdAt).getTime();

      // 생성 시각이 더 최신이거나 metadata(고정수/선택수)가 더 풍부한 객체 유지
      const itemMetaCount = (item.userPickedNumbers?.length || 0) + (item.fixedNumbers?.length || 0);
      const existingMetaCount = (existing.userPickedNumbers?.length || 0) + (existing.fixedNumbers?.length || 0);

      if (itemTime > existingTime || (itemTime === existingTime && itemMetaCount > existingMetaCount)) {
        mergedMap.delete(existingId);
        mergedMap.set(item.id, item);
        keyToIdMap.set(canonicalKey, item.id);
      }
      return;
    }

    // 3. 신규 항목 추가
    mergedMap.set(item.id, item);
    keyToIdMap.set(canonicalKey, item.id);
  };

  // Local 및 Cloud 순차 병합
  localItems.forEach(processItem);
  cloudItems.forEach(processItem);

  // 최신 생성순 (createdAt 내림차순) 정렬
  return Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Local과 Cloud 나만의 전략 목록을 안전하게 병합 (ID/이름 충돌 처리 및 usageCount 합리적 병합)
 */
export function mergeCustomStrategies(
  localItems: SavedCustomStrategy[],
  cloudItems: SavedCustomStrategy[]
): SavedCustomStrategy[] {
  const mergedMap = new Map<string, SavedCustomStrategy>();
  const nameToIdMap = new Map<string, string>();

  const processStrategy = (st: SavedCustomStrategy) => {
    const normName = st.name.trim().toLowerCase();

    // 1. ID 기준 기존 존재 체크
    if (mergedMap.has(st.id)) {
      const existing = mergedMap.get(st.id)!;
      const existingTime = new Date(existing.updatedAt || existing.createdAt).getTime();
      const itemTime = new Date(st.updatedAt || st.createdAt).getTime();

      // usageCount는 두 값 중 큰 값 유지 (사용 기록 손실 방지)
      const mergedUsage = Math.max(existing.usageCount || 0, st.usageCount || 0);
      const lastUsed =
        existing.lastUsedAt && st.lastUsedAt
          ? new Date(existing.lastUsedAt).getTime() > new Date(st.lastUsedAt).getTime()
            ? existing.lastUsedAt
            : st.lastUsedAt
          : existing.lastUsedAt || st.lastUsedAt;

      if (itemTime >= existingTime) {
        mergedMap.set(st.id, {
          ...st,
          usageCount: mergedUsage,
          lastUsedAt: lastUsed,
        });
      } else {
        mergedMap.set(st.id, {
          ...existing,
          usageCount: mergedUsage,
          lastUsedAt: lastUsed,
        });
      }
      return;
    }

    // 2. 동일 이름(trim + case-insensitive) 체크
    if (nameToIdMap.has(normName)) {
      const existingId = nameToIdMap.get(normName)!;
      const existing = mergedMap.get(existingId)!;

      const existingTime = new Date(existing.updatedAt || existing.createdAt).getTime();
      const itemTime = new Date(st.updatedAt || st.createdAt).getTime();
      const mergedUsage = Math.max(existing.usageCount || 0, st.usageCount || 0);

      if (itemTime > existingTime) {
        mergedMap.delete(existingId);
        mergedMap.set(st.id, { ...st, usageCount: mergedUsage });
        nameToIdMap.set(normName, st.id);
      } else {
        mergedMap.set(existingId, { ...existing, usageCount: mergedUsage });
      }
      return;
    }

    // 3. 신규 전략 추가
    mergedMap.set(st.id, st);
    nameToIdMap.set(normName, st.id);
  };

  localItems.forEach(processStrategy);
  cloudItems.forEach(processStrategy);

  // 최신 수정순 (updatedAt 내림차순) 정렬
  return Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
  );
}
