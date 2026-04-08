"use client";

import type { MenuItem } from "@/lib/menu-types";
import { useLanguage } from "@/context/language-context";

function Pill({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${className}`}
    >
      {children}
    </span>
  );
}

export function MenuDietBadges({ item, className = "" }: { item: MenuItem; className?: string }) {
  const { t } = useLanguage();
  const has = item.vegan || item.vegetarian || item.spicy;
  if (!has) return null;
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {item.vegan && (
        <Pill className="border-brand-line bg-brand-muted/50 text-brand-primary">{t.order.vegan}</Pill>
      )}
      {item.vegetarian && !item.vegan && (
        <Pill className="border-brand-line bg-brand-canvas text-brand-primary">{t.order.vegetarian}</Pill>
      )}
      {item.spicy && (
        <Pill className="border-brand-line bg-brand-canvas text-brand-primary">{t.order.spicy}</Pill>
      )}
    </div>
  );
}

export function MenuAllergenChips({ item, className = "" }: { item: MenuItem; className?: string }) {
  const { t } = useLanguage();
  const codes = item.allergens?.filter(Boolean) ?? [];
  if (codes.length === 0) return null;
  const sorted = [...codes].map((c) => c.trim().toUpperCase()).sort();
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-brand-subtle">{t.menu.allergensShort}:</span>
      {sorted.map((code) => (
        <span
          key={code}
          title={`Allergen ${code}`}
          className="inline-flex h-6 min-w-[1.35rem] items-center justify-center rounded border border-brand-line bg-brand-canvas px-1.5 font-mono text-[10px] font-semibold tabular-nums text-brand-primary"
        >
          {code}
        </span>
      ))}
    </div>
  );
}
