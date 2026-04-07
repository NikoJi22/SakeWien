import type { LunchStarterOption, MenuItem } from "@/lib/menu-types";

export const CART_LINE_KEY_SEP = "::";
const EXTRA_FLAG_PREFIX = "x:";

export function cartLineKey(
  itemId: string,
  starterOptionId: string | null,
  extras?: { wasabi?: boolean; ginger?: boolean }
): string {
  const parts = [itemId];
  if (starterOptionId) parts.push(starterOptionId);
  const hasExtra = !!extras?.wasabi || !!extras?.ginger;
  if (hasExtra) {
    parts.push(`${EXTRA_FLAG_PREFIX}w${extras?.wasabi ? 1 : 0}g${extras?.ginger ? 1 : 0}`);
  }
  return parts.join(CART_LINE_KEY_SEP);
}

export function parseCartLineKey(key: string): {
  itemId: string;
  starterOptionId: string | null;
  extras: { wasabi: boolean; ginger: boolean };
} {
  const [itemId, second, third] = key.split(CART_LINE_KEY_SEP);
  const firstExtra = second?.startsWith(EXTRA_FLAG_PREFIX) ? second : null;
  const secondExtra = third?.startsWith(EXTRA_FLAG_PREFIX) ? third : null;
  const extraToken = firstExtra ?? secondExtra;
  const starterOptionId = second && !second.startsWith(EXTRA_FLAG_PREFIX) ? second : null;
  const w = extraToken?.includes("w1") ?? false;
  const g = extraToken?.includes("g1") ?? false;
  return { itemId, starterOptionId, extras: { wasabi: w, ginger: g } };
}

export function itemRequiresLunchStarter(item: MenuItem): boolean {
  const opts = item.lunchStarterChoice?.options;
  return Array.isArray(opts) && opts.length > 0;
}

export function resolveStarterOption(item: MenuItem, starterOptionId: string): LunchStarterOption | undefined {
  return item.lunchStarterChoice?.options?.find((o) => o.id === starterOptionId);
}
