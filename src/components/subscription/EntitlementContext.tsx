"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { UserEntitlement, UserPlan, PlanLimits } from "@/types/subscription";
import { getUserEntitlement, DEFAULT_FREE_ENTITLEMENT } from "@/lib/subscription/entitlements";
import { getPlanLimits } from "@/lib/subscription/feature-matrix";
import { createClient } from "@/lib/supabase/client";

interface EntitlementContextValue {
  entitlement: UserEntitlement;
  plan: UserPlan;
  isPro: boolean;
  limits: PlanLimits;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const EntitlementContext = createContext<EntitlementContextValue>({
  entitlement: DEFAULT_FREE_ENTITLEMENT,
  plan: "free",
  isPro: false,
  limits: getPlanLimits("free"),
  isLoading: true,
  refetch: async () => {},
});

export function EntitlementProvider({ children }: { children: React.ReactNode }) {
  const [entitlement, setEntitlement] = useState<UserEntitlement>(DEFAULT_FREE_ENTITLEMENT);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEntitlement = useCallback(async () => {
    setIsLoading(true);
    const data = await getUserEntitlement();
    setEntitlement(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchEntitlement();

    try {
      const supabase = createClient();
      const { data: authListener } = supabase.auth.onAuthStateChange(() => {
        fetchEntitlement();
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } catch {
      // Fallback
    }
  }, [fetchEntitlement]);

  const limits = getPlanLimits(entitlement.plan);

  return (
    <EntitlementContext.Provider
      value={{
        entitlement,
        plan: entitlement.plan,
        isPro: entitlement.isPro,
        limits,
        isLoading,
        refetch: fetchEntitlement,
      }}
    >
      {children}
    </EntitlementContext.Provider>
  );
}

export function useEntitlement() {
  return useContext(EntitlementContext);
}
