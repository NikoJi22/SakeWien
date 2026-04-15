"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { buildMenuIndex } from "@/lib/menu-helpers";
import type { MenuCategory, MenuItem } from "@/lib/menu-types";
import { transformMenuForOrdering } from "@/lib/order-menu-transform";

type MenuDataContextValue = {
  categories: MenuCategory[];
  itemById: Record<string, MenuItem>;
  bestsellers: MenuItem[];
  newDishes: MenuItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const MenuDataContext = createContext<MenuDataContextValue | null>(null);

export function MenuDataProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/menu", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load menu");
      const data = (await res.json()) as MenuCategory[];
      setCategories(Array.isArray(data) ? transformMenuForOrdering(data) : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load menu");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    function onMenuUpdated() {
      void refresh();
    }
    window.addEventListener("sake-menu-updated", onMenuUpdated);
    return () => window.removeEventListener("sake-menu-updated", onMenuUpdated);
  }, [refresh]);

  const { itemById, bestsellers, newDishes } = useMemo(() => buildMenuIndex(categories), [categories]);

  const value = useMemo(
    () => ({
      categories,
      itemById,
      bestsellers,
      newDishes,
      loading,
      error,
      refresh
    }),
    [categories, itemById, bestsellers, newDishes, loading, error, refresh]
  );

  return <MenuDataContext.Provider value={value}>{children}</MenuDataContext.Provider>;
}

export function useMenuData() {
  const ctx = useContext(MenuDataContext);
  if (!ctx) throw new Error("useMenuData must be used within MenuDataProvider");
  return ctx;
}
