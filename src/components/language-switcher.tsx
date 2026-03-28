"use client";

import { useLanguage } from "@/context/language-context";

export function LanguageSwitcher({ compact }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`flex items-center rounded-full border border-white/20 bg-black/50 p-0.5 text-[10px] ${compact ? "scale-95" : "text-xs"}`}
    >
      <button
        type="button"
        onClick={() => setLanguage("de")}
        className={`rounded-full px-2.5 py-1 transition sm:px-3 ${
          language === "de" ? "bg-[#c4a574] text-black" : "text-white/80 hover:text-white"
        }`}
      >
        DE
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`rounded-full px-2.5 py-1 transition sm:px-3 ${
          language === "en" ? "bg-[#c4a574] text-black" : "text-white/80 hover:text-white"
        }`}
      >
        EN
      </button>
    </div>
  );
}
