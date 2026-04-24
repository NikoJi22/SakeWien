"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReusableOptionGroup } from "@/lib/menu-types";

type OptionGroupsContextValue = {
  groups: ReusableOptionGroup[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const OptionGroupsContext = createContext<OptionGroupsContextValue | null>(null);

export function OptionGroupsProvider({ children }: { children: React.ReactNode }) {
  const [groups, setGroups] = useState<ReusableOptionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/option-groups", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load option groups");
      const data = (await res.json()) as ReusableOptionGroup[];
      setGroups(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load option groups");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdated = () => void refresh();
    window.addEventListener("sake-option-groups-updated", onUpdated);
    return () => window.removeEventListener("sake-option-groups-updated", onUpdated);
  }, [refresh]);

  const value = useMemo(() => ({ groups, loading, error, refresh }), [groups, loading, error, refresh]);
  return <OptionGroupsContext.Provider value={value}>{children}</OptionGroupsContext.Provider>;
}

export function useOptionGroups() {
  const ctx = useContext(OptionGroupsContext);
  if (!ctx) throw new Error("useOptionGroups must be used within OptionGroupsProvider");
  return ctx;
}
