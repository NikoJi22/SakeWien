import type { LunchStarterOption, MenuItem } from "@/lib/menu-types";

export const CART_LINE_KEY_SEP = "::";

export function cartLineKey(itemId: string, starterOptionId: string | null): string {
  if (starterOptionId) return `${itemId}${CART_LINE_KEY_SEP}${starterOptionId}`;
  return itemId;
}

export function parseCartLineKey(key: string): { itemId: string; starterOptionId: string | null } {
  const i = key.indexOf(CART_LINE_KEY_SEP);
  if (i === -1) return { itemId: key, starterOptionId: null };
  return { itemId: key.slice(0, i), starterOptionId: key.slice(i + CART_LINE_KEY_SEP.length) };
}

export function itemRequiresLunchStarter(item: MenuItem): boolean {
  const opts = item.lunchStarterChoice?.options;
  return Array.isArray(opts) && opts.length > 0;
}

export function resolveStarterOption(item: MenuItem, starterOptionId: string): LunchStarterOption | undefined {
  return item.lunchStarterChoice?.options?.find((o) => o.id === starterOptionId);
}
