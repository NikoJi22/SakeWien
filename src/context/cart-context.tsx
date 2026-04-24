"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useMenuData } from "@/context/menu-data-context";
import { useOptionGroups } from "@/context/option-groups-context";
import { cartLineKey, itemRequiresLunchStarter, parseCartLineKey, resolveStarterOption } from "@/lib/cart-line-key";
import { getEffectivePriceEur } from "@/lib/menu-pricing";
import { findItemSelectionOption, getItemSelectionGroup } from "@/lib/item-selection";
import { findCategoryByItemId, optionSelectionExtraEur, resolveReusableOptionGroupsForDish } from "@/lib/reusable-option-groups";
import type { LunchStarterOption, MenuItem, OrderChoiceOption } from "@/lib/menu-types";

export type CartLine = {
  lineKey: string;
  item: MenuItem;
  quantity: number;
  starterChoice?: LunchStarterOption;
  orderChoice?: OrderChoiceOption;
  sushiExtras?: { wasabi: boolean; ginger: boolean };
  optionSelections?: Record<string, string[]>;
};

type CartContextValue = {
  quantities: Record<string, number>;
  setQuantity: (lineKey: string, quantity: number) => void;
  addOne: (itemId: string, opts?: { starterOptionId?: string | null; wasabi?: boolean; ginger?: boolean; orderChoiceId?: string | null; optionSelections?: Record<string, string[]> }) => void;
  removeOne: (lineKey: string) => void;
  lines: CartLine[];
  itemCount: number;
  subtotalEur: number;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { itemById, categories } = useMenuData();
  const { groups: reusableGroups } = useOptionGroups();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const setQuantity = useCallback((lineKey: string, quantity: number) => {
    setQuantities((prev) => {
      const next = { ...prev };
      if (quantity <= 0) {
        delete next[lineKey];
      } else {
        next[lineKey] = quantity;
      }
      return next;
    });
  }, []);

  const addOne = useCallback(
    (itemId: string, opts?: { starterOptionId?: string | null; wasabi?: boolean; ginger?: boolean; orderChoiceId?: string | null; optionSelections?: Record<string, string[]> }) => {
      setQuantities((prev) => {
        const item = itemById[itemId];
        if (!item) return prev;
        const starterOptionId = opts?.starterOptionId ?? null;
        const orderChoiceId = opts?.orderChoiceId ?? null;
        const needStarter = itemRequiresLunchStarter(item);
        if (needStarter && !starterOptionId) return prev;
        const selectionGroup = getItemSelectionGroup(item);
        const requiredOrderChoice = !!selectionGroup?.required && (selectionGroup.options?.length ?? 0) > 0;
        if (requiredOrderChoice && !orderChoiceId) return prev;
        const key = cartLineKey(itemId, needStarter ? starterOptionId! : null, {
          wasabi: opts?.wasabi,
          ginger: opts?.ginger,
          orderChoiceId,
          optionSelections: opts?.optionSelections
        });
        return { ...prev, [key]: (prev[key] ?? 0) + 1 };
      });
    },
    [itemById]
  );

  const removeOne = useCallback((lineKey: string) => {
    setQuantities((prev) => {
      const q = (prev[lineKey] ?? 0) - 1;
      const next = { ...prev };
      if (q <= 0) delete next[lineKey];
      else next[lineKey] = q;
      return next;
    });
  }, []);

  const clear = useCallback(() => setQuantities({}), []);

  const { lines, itemCount, subtotalEur } = useMemo(() => {
    const lines: CartLine[] = [];
    let itemCount = 0;
    let subtotalEur = 0;
    for (const [key, qty] of Object.entries(quantities)) {
      if (qty <= 0) continue;
      const { itemId, starterOptionId, orderChoiceId, extras, optionSelections } = parseCartLineKey(key);
      const item = itemById[itemId];
      if (!item) continue;
      const category = findCategoryByItemId(categories, item.id);
      const linkedGroups = category ? resolveReusableOptionGroupsForDish(item, category.id, reusableGroups) : [];
      const optionExtraEur = optionSelectionExtraEur(linkedGroups, optionSelections);
      const selectionGroup = getItemSelectionGroup(item);
      const fallbackChoice =
        !orderChoiceId && selectionGroup?.required && (selectionGroup.options.length ?? 0) > 0
          ? selectionGroup.options.find((opt) => opt.id === selectionGroup.defaultOptionId) ?? selectionGroup.options[0]
          : undefined;
      const orderChoice = orderChoiceId ? findItemSelectionOption(item, orderChoiceId) ?? fallbackChoice : fallbackChoice;
      if (itemRequiresLunchStarter(item)) {
        if (!starterOptionId) continue;
        const opt = resolveStarterOption(item, starterOptionId);
        if (!opt) continue;
        lines.push({ lineKey: key, item, quantity: qty, starterChoice: opt, orderChoice, sushiExtras: extras, optionSelections });
      } else {
        if (starterOptionId) continue;
        lines.push({ lineKey: key, item, quantity: qty, orderChoice, sushiExtras: extras, optionSelections });
      }
      itemCount += qty;
      subtotalEur += (getEffectivePriceEur(item, orderChoice?.id) + optionExtraEur) * qty;
    }
    return { lines, itemCount, subtotalEur };
  }, [quantities, itemById, categories, reusableGroups]);

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
