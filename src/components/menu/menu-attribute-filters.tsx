"use client";

import type { MenuAttributeFilter } from "@/lib/menu-filter";
import { menuFilterIsActive } from "@/lib/menu-filter";
import { useLanguage } from "@/context/language-context";
import { brandChipActive, brandChipInactive } from "@/lib/brand-actions";

const btnBase = "rounded-full px-3.5 py-2 text-sm font-semibold transition sm:px-4 sm:text-base";

type Props = {
  value: MenuAttributeFilter;
  onChange: (next: MenuAttributeFilter) => void;
};

export function MenuAttributeFilters({ value, onChange }: Props) {
  const { t } = useLanguage();

  const toggle = (key: keyof MenuAttributeFilter) => {
    onChange({ ...value, [key]: !value[key] });
  };

  const rows: [keyof MenuAttributeFilter, string][] = [
    ["vegan", t.menu.filterVegan],
    ["vegetarian", t.menu.filterVegetarian],
    ["spicy1", t.menu.filterSpicy1],
    ["spicy2", t.menu.filterSpicy2],
    ["bestseller", t.menu.filterBestseller],
    ["isNew", t.menu.filterNew],
    ["specialDeals", t.menu.filterSpecialDeals]
  ];

  return (
    <div className="rounded-2xl border border-brand-line bg-brand-canvas p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-subtle">{t.menu.filterLabel}</span>
        {menuFilterIsActive(value) && (
          <button
            type="button"
            onClick={() =>
              onChange({ vegan: false, vegetarian: false, spicy1: false, spicy2: false, bestseller: false, isNew: false, specialDeals: false })
            }
            className="self-start text-sm font-medium text-brand-primary underline-offset-2 hover:underline sm:self-auto"
          >
            {t.menu.clearFilters}
          </button>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {rows.map(([key, label]) => {
          const on = value[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              className={`${btnBase} ${on ? brandChipActive : brandChipInactive}`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
