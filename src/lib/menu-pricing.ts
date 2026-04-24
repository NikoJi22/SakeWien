import type { MenuItem } from "./menu-types";
import { findItemSelectionOption } from "./item-selection";

type ParsedDeal =
  | { kind: "percent"; value: number }
  | { kind: "euro"; value: number };

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

export function parseSpecialDealLabel(label?: string | null): ParsedDeal | null {
  const raw = (label ?? "").trim();
  if (!raw) return null;

  const percent = raw.match(/^-\s*(\d+(?:[.,]\d+)?)\s*%$/);
  if (percent) {
    const n = Number(percent[1].replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) return null;
    return { kind: "percent", value: n };
  }

  const euro = raw.match(/^-\s*(\d+(?:[.,]\d+)?)\s*€$/);
  if (euro) {
    const n = Number(euro[1].replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) return null;
    return { kind: "euro", value: n };
  }

  return null;
}

export function getDiscountedPriceEur(item: MenuItem): number | null {
  if (!item.isSpecialDeal) return null;
  const deal = parseSpecialDealLabel(item.specialDealLabel);
  if (!deal) return null;

  const base = Number(item.priceEur);
  if (!Number.isFinite(base) || base < 0) return null;

  const next =
    deal.kind === "percent"
      ? base - (base * deal.value) / 100
      : base - deal.value;

  return round2(Math.max(0, next));
}

export function resolveOrderChoiceBasePriceEur(item: MenuItem, orderChoiceId?: string | null): number {
  const opt = findItemSelectionOption(item, orderChoiceId);
  if (typeof opt?.priceEur === "number" && Number.isFinite(opt.priceEur) && opt.priceEur >= 0) {
    return opt.priceEur;
  }
  return item.priceEur;
}

export function getEffectivePriceEur(item: MenuItem, orderChoiceId?: string | null): number {
  const basePriceEur = resolveOrderChoiceBasePriceEur(item, orderChoiceId);
  if (!item.isSpecialDeal) return basePriceEur;
  const deal = parseSpecialDealLabel(item.specialDealLabel);
  if (!deal) return basePriceEur;
  const next = deal.kind === "percent" ? basePriceEur - (basePriceEur * deal.value) / 100 : basePriceEur - deal.value;
  return round2(Math.max(0, next));
}
