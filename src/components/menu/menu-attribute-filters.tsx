"use client";

import type { MenuAttributeFilter } from "@/lib/menu-filter";
import { menuFilterIsActive } from "@/lib/menu-filter";
import { useLanguage } from "@/context/language-context";

const btnBase =
  "rounded-full border px-3.5 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm";

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
    ["spicy", t.menu.filterSpicy],
    ["bestseller", t.menu.filterBestseller],
    ["isNew", t.menu.filterNew]
  ];

  return (
    <div className="rounded-2xl border border-brand-line bg-brand-card/60 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-subtle">{t.menu.filterLabel}</span>
        {menuFilterIsActive(value) && (
          <button
            type="button"
            onClick={() =>
              onChange({ vegan: false, vegetarian: false, spicy: false, bestseller: false, isNew: false })
            }
            className="self-start text-xs font-medium text-brand-accent underline-offset-2 hover:underline sm:self-auto"
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
              className={`${btnBase} ${
                on
                  ? "border-brand-accent bg-brand-accent text-white shadow-sm shadow-brand-accent/20"
                  : "border-brand-line bg-brand-canvas text-brand-ink-secondary hover:border-brand-line-strong hover:bg-brand-muted hover:text-brand-ink"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
