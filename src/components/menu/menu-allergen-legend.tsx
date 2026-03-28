"use client";

import { useState } from "react";
import { allergenLegendEntries } from "@/lib/allergen-codes";
import { useLanguage } from "@/context/language-context";

export function MenuAllergenLegend() {
  const { language, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const entries = allergenLegendEntries(language);

  return (
    <div className="rounded-2xl border border-brand-line bg-brand-card/80 px-4 py-3 sm:px-5 sm:py-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <span className="font-serif text-sm font-semibold tracking-wide text-brand-ink">{t.menu.allergenLegendTitle}</span>
        <span className="text-brand-subtle">{open ? "−" : "+"}</span>
      </button>
      <p className="mt-1 text-xs leading-relaxed text-brand-body">{t.menu.allergenLegendHint}</p>
      {open && (
        <dl className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {entries.map(({ code, label }) => (
            <div key={code} className="flex gap-2 text-xs">
              <dt className="w-7 shrink-0 font-mono font-semibold tabular-nums text-brand-ink-secondary">{code}</dt>
              <dd className="text-brand-body">{label}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
