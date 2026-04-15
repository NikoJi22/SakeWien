import type { GiftConfig } from "@/lib/menu-types";
import { orderGiftConfig } from "@/config/order-gift";

function normalizeFreeItemIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  for (const id of value) {
    if (typeof id !== "string") continue;
    const t = id.trim();
    if (!t) continue;
    seen.add(t);
  }
  return [...seen];
}

function clampInt(n: unknown, fallback: number, min: number, max: number): number {
  if (typeof n !== "number" || !Number.isFinite(n)) return fallback;
  const x = Math.floor(n);
  return Math.max(min, Math.min(max, x));
}

function clampThreshold(n: unknown, fallback: number): number {
  if (typeof n !== "number" || !Number.isFinite(n) || n < 0) return fallback;
  return n;
}

export function normalizeGiftConfig(input: unknown): GiftConfig {
  const rawLegacy = (input as Partial<GiftConfig>).thresholdEur;
  const legacyThreshold =
    typeof rawLegacy === "number" && Number.isFinite(rawLegacy) && rawLegacy >= 0 ? rawLegacy : orderGiftConfig.thresholdEur;

  const fallback: GiftConfig = {
    message: { ...orderGiftConfig.message },
    freeItemIds: [],
    tier1ThresholdEur: 35,
    tier1GiftCount: 1,
    tier2ThresholdEur: 70,
    tier2GiftCount: 2
  };

  if (!input || typeof input !== "object") return fallback;
  const raw = input as Partial<GiftConfig>;

  const tier1ThresholdEur = clampThreshold(raw.tier1ThresholdEur, legacyThreshold);
  const tier2ThresholdEur = clampThreshold(raw.tier2ThresholdEur, 70);
  const tier1GiftCount = clampInt(raw.tier1GiftCount, 1, 0, 50);
  const tier2GiftCount = clampInt(raw.tier2GiftCount, 2, 0, 50);

  const en = typeof raw.message?.en === "string" ? raw.message.en : fallback.message.en;
  const de = typeof raw.message?.de === "string" ? raw.message.de : fallback.message.de;

  return {
    message: { en, de },
    freeItemIds: normalizeFreeItemIds(raw.freeItemIds),
    tier1ThresholdEur,
    tier1GiftCount,
    tier2ThresholdEur,
    tier2GiftCount
  };
}

/** Max. Anzahl Gratisartikel aus Konfiguration (höhere Stufe ersetzt die niedrigere). */
export function maxFreeGiftsForSubtotal(subtotalEur: number, config: GiftConfig): number {
  if (subtotalEur >= config.tier2ThresholdEur) return Math.max(0, Math.floor(config.tier2GiftCount));
  if (subtotalEur >= config.tier1ThresholdEur) return Math.max(0, Math.floor(config.tier1GiftCount));
  return 0;
}
