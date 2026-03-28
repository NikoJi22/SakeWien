"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { getMenuItem, type MenuItem } from "@/lib/menu-data";

export type CartLine = {
  item: MenuItem;
  quantity: number;
};

type CartContextValue = {
  quantities: Record<string, number>;
  setQuantity: (itemId: string, quantity: number) => void;
  addOne: (itemId: string) => void;
  removeOne: (itemId: string) => void;
  lines: CartLine[];
  itemCount: number;
  subtotalEur: number;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const setQuantity = useCallback((itemId: string, quantity: number) => {
    setQuantities((prev) => {
      const next = { ...prev };
      if (quantity <= 0) {
        delete next[itemId];
      } else {
        next[itemId] = quantity;
      }
      return next;
    });
  }, []);

  const addOne = useCallback((itemId: string) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] ?? 0) + 1
    }));
  }, []);

  const removeOne = useCallback((itemId: string) => {
    setQuantities((prev) => {
      const q = (prev[itemId] ?? 0) - 1;
      const next = { ...prev };
      if (q <= 0) delete next[itemId];
      else next[itemId] = q;
      return next;
    });
  }, []);

  const clear = useCallback(() => setQuantities({}), []);

  const { lines, itemCount, subtotalEur } = useMemo(() => {
    const lines: CartLine[] = [];
    let itemCount = 0;
    let subtotalEur = 0;
    for (const [id, qty] of Object.entries(quantities)) {
      if (qty <= 0) continue;
      const item = getMenuItem(id);
      if (!item) continue;
      lines.push({ item, quantity: qty });
      itemCount += qty;
      subtotalEur += item.priceEur * qty;
    }
    return { lines, itemCount, subtotalEur };
  }, [quantities]);

  const value = useMemo(
    () => ({
      quantities,
      setQuantity,
      addOne,
      removeOne,
      lines,
      itemCount,
      subtotalEur,
      clear
    }),
    [quantities, setQuantity, addOne, removeOne, lines, itemCount, subtotalEur, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
