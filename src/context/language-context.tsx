"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Language, translations } from "@/lib/translations";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (typeof translations)["en"];
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("de");

  useEffect(() => {
    const saved = localStorage.getItem("sake-lang");
    if (saved === "en" || saved === "de") {
      setLanguage(saved);
    }
  }, []);

  const updateLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("sake-lang", lang);
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage: updateLanguage,
      t: translations[language]
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return ctx;
}
