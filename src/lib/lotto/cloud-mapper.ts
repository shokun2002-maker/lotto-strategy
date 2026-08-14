import { SavedLottoCombination, SavedCustomStrategy } from "@/types/lotto";

export interface SavedLottoCombinationRow {
  id: string;
  user_id: string;
  numbers: number[];
  source: string;
  user_picked_numbers: number[];
  recommended_numbers: number[];
  strategy_id: string | null;
  custom_strategy_id: string | null;
  custom_strategy_name: string | null;
  fixed_numbers: number[];
  excluded_numbers: number[];
  target_draw_no: number | null;
  created_at: string;
  synced_at?: string;
}

export interface SavedCustomStrategyRow {
  id: string;
  user_id: string;
  name: string;
  base_strategy: string;
  fixed_numbers: number[];
  excluded_numbers: number[];
  created_at: string;
  updated_at: string;
  last_used_at: string | null;
  usage_count: number;
  synced_at?: string;
}

/**
 * SavedLottoCombination (TS camelCase) -> DB Row (PG snake_case) 변환
 */
export function combinationToRow(
  item: SavedLottoCombination,
  userId: string
): SavedLottoCombinationRow {
  return {
    id: item.id,
    user_id: userId,
    numbers: item.numbers,
    source: item.source,
    user_picked_numbers: item.userPickedNumbers ?? [],
    recommended_numbers: item.recommendedNumbers ?? [],
    strategy_id: item.strategyId ?? null,
    custom_strategy_id: item.customStrategyId ?? null,
    custom_strategy_name: item.customStrategyName ?? null,
    fixed_numbers: item.fixedNumbers ?? [],
    excluded_numbers: item.excludedNumbers ?? [],
    target_draw_no: item.targetDrawNo ?? null,
    created_at: item.createdAt,
    synced_at: new Date().toISOString(),
  };
}

/**
 * DB Row (PG snake_case) -> SavedLottoCombination (TS camelCase) 변환
 */
export function rowToCombination(row: SavedLottoCombinationRow): SavedLottoCombination {
  return {
    id: row.id,
    numbers: row.numbers,
    source: (row.source as any) || "quick",
    targetDrawNo: row.target_draw_no ?? undefined,
    strategyId: (row.strategy_id as any) || undefined,
    customStrategyId: row.custom_strategy_id ?? undefined,
    customStrategyName: row.custom_strategy_name ?? undefined,
    userPickedNumbers: row.user_picked_numbers ?? [],
    recommendedNumbers: row.recommended_numbers ?? [],
    fixedNumbers: row.fixed_numbers ?? [],
    excludedNumbers: row.excluded_numbers ?? [],
    createdAt: row.created_at,
  };
}

/**
 * SavedCustomStrategy (TS camelCase) -> DB Row (PG snake_case) 변환
 */
export function strategyToRow(
  st: SavedCustomStrategy,
  userId: string
): SavedCustomStrategyRow {
  return {
    id: st.id,
    user_id: userId,
    name: st.name,
    base_strategy: st.baseStrategy,
    fixed_numbers: st.fixedNumbers ?? [],
    excluded_numbers: st.excludedNumbers ?? [],
    created_at: st.createdAt,
    updated_at: st.updatedAt,
    last_used_at: st.lastUsedAt ?? null,
    usage_count: st.usageCount ?? 0,
    synced_at: new Date().toISOString(),
  };
}

/**
 * DB Row (PG snake_case) -> SavedCustomStrategy (TS camelCase) 변환
 */
export function rowToStrategy(row: SavedCustomStrategyRow): SavedCustomStrategy {
  return {
    id: row.id,
    name: row.name,
    baseStrategy: (row.base_strategy as any) || "balanced",
    fixedNumbers: row.fixed_numbers ?? [],
    excludedNumbers: row.excluded_numbers ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastUsedAt: row.last_used_at ?? undefined,
    usageCount: row.usage_count ?? 0,
  };
}
