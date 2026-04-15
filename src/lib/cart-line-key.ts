import type { LunchStarterOption, MenuItem } from "@/lib/menu-types";

export const CART_LINE_KEY_SEP = "::";
const EXTRA_FLAG_PREFIX = "x:";
const CHOICE_FLAG_PREFIX = "c:";

export function cartLineKey(
  itemId: string,
  starterOptionId: string | null,
  opts?: { wasabi?: boolean; ginger?: boolean; orderChoiceId?: string | null }
): string {
  const parts = [itemId];
  if (starterOptionId) parts.push(starterOptionId);
  if (opts?.orderChoiceId) {
    parts.push(`${CHOICE_FLAG_PREFIX}${opts.orderChoiceId}`);
  }
  const hasExtra = !!opts?.wasabi || !!opts?.ginger;
  if (hasExtra) {
    parts.push(`${EXTRA_FLAG_PREFIX}w${opts?.wasabi ? 1 : 0}g${opts?.ginger ? 1 : 0}`);
  }
  return parts.join(CART_LINE_KEY_SEP);
}

export function parseCartLineKey(key: string): {
  itemId: string;
  starterOptionId: string | null;
  orderChoiceId: string | null;
  extras: { wasabi: boolean; ginger: boolean };
} {
  const [itemId, second, third, fourth] = key.split(CART_LINE_KEY_SEP);
  const tokens = [second, third, fourth].filter(Boolean) as string[];
  const extraToken = tokens.find((t) => t.startsWith(EXTRA_FLAG_PREFIX));
  const choiceToken = tokens.find((t) => t.startsWith(CHOICE_FLAG_PREFIX));
  const starterOptionId =
    tokens.find((t) => !t.startsWith(EXTRA_FLAG_PREFIX) && !t.startsWith(CHOICE_FLAG_PREFIX)) ?? null;
  const orderChoiceId = choiceToken ? choiceToken.slice(CHOICE_FLAG_PREFIX.length) || null : null;
  const w = extraToken?.includes("w1") ?? false;
  const g = extraToken?.includes("g1") ?? false;
  return { itemId, starterOptionId, orderChoiceId, extras: { wasabi: w, ginger: g } };
}

export function itemRequiresLunchStarter(item: MenuItem): boolean {
  const opts = item.lunchStarterChoice?.options;
  return Array.isArray(opts) && opts.length > 0;
}

export function resolveStarterOption(item: MenuItem, starterOptionId: string): LunchStarterOption | undefined {
  return item.lunchStarterChoice?.options?.find((o) => o.id === starterOptionId);
}
