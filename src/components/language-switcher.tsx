"use client";

import { useLanguage } from "@/context/language-context";

export function LanguageSwitcher({
  compact,
  variant = "default"
}: {
  compact?: boolean;
  /** Solid styles for full-bleed mobile drawers (no translucent UI). */
  variant?: "default" | "drawer";
}) {
  const { language, setLanguage } = useLanguage();

  const shell =
    variant === "drawer"
      ? `flex items-center rounded-full border border-[#333333] bg-[#141414] p-0.5 text-[10px] ${compact ? "scale-95" : "text-xs"}`
      : `flex items-center rounded-full border border-white/20 bg-black/50 p-0.5 text-[10px] ${compact ? "scale-95" : "text-xs"}`;

  const inactiveBtn = variant === "drawer" ? "text-[#c4c4c4] hover:text-white" : "text-white/80 hover:text-white";

  return (
    <div className={shell}>
      <button
        type="button"
        onClick={() => setLanguage("de")}
        className={`rounded-full px-2.5 py-1 transition sm:px-3 ${language === "de" ? "bg-[#c4a574] text-black" : inactiveBtn}`}
      >
        DE
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`rounded-full px-2.5 py-1 transition sm:px-3 ${language === "en" ? "bg-[#c4a574] text-black" : inactiveBtn}`}
      >
        EN
      </button>
    </div>
  );
}
