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
    ? `inline-flex w-fit shrink-0 items-center rounded-full border-2 border-brand-line-strong bg-brand-card p-0.5 text-[10px] shadow-md ${compact ? "scale-95" : "text-xs"}`
    : `inline-flex w-fit shrink-0 items-center rounded-full border border-brand-line bg-brand-card p-0.5 text-[10px] shadow-sm ${compact ? "scale-95" : "text-xs"}`;

  const inactiveBtn = emphasis
    ? "font-semibold text-brand-ink-secondary hover:bg-brand-primary-tint/35 hover:text-brand-primary"
    : "text-brand-body hover:text-brand-primary";

  const activeBtn = emphasis
    ? "bg-[#C9A46C] font-bold text-[#FFFFFF] shadow-inner"
    : "bg-[#C9A46C] text-[#FFFFFF]";

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
