export type AdminLang = "de" | "zh";

const LS_KEY = "sake-admin-lang";

export function getStoredAdminLang(): AdminLang {
  if (typeof window === "undefined") return "de";
  const v = window.localStorage.getItem(LS_KEY);
  return v === "zh" ? "zh" : "de";
}

export function setStoredAdminLang(lang: AdminLang) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, lang);
}
