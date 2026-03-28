"use client";

import { useLanguage } from "@/context/language-context";

export function LanguageSwitcher({
  compact,
  emphasis,
  ..._rest
}: {
  compact?: boolean;
  /** Stronger borders/text for use on busy backgrounds (e.g. hero). */
  emphasis?: boolean;
  variant?: "default" | "drawer";
}) {
  void _rest;
  const { language, setLanguage } = useLanguage();

  const shell = emphasis
    ? `inline-flex w-fit shrink-0 items-center rounded-full border-2 border-neutral-400 bg-white p-0.5 text-[10px] shadow-md ${compact ? "scale-95" : "text-xs"}`
    : `inline-flex w-fit shrink-0 items-center rounded-full border border-[#ccc] bg-white p-0.5 text-[10px] shadow-sm ${compact ? "scale-95" : "text-xs"}`;

  const inactiveBtn = emphasis
    ? "font-semibold text-neutral-800 hover:bg-neutral-100 hover:text-neutral-950"
    : "text-neutral-600 hover:text-brand-ink";

  const activeBtn = emphasis
    ? "bg-brand-accent font-bold text-white shadow-inner"
    : "bg-brand-accent text-white";

  return (
    <div className={shell}>
      <button
        type="button"
        onClick={() => setLanguage("de")}
        className={`rounded-full px-2.5 py-1 transition sm:px-3 ${language === "de" ? activeBtn : inactiveBtn}`}
      >
        DE
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`rounded-full px-2.5 py-1 transition sm:px-3 ${language === "en" ? activeBtn : inactiveBtn}`}
      >
        EN
      </button>
    </div>
  );
}
