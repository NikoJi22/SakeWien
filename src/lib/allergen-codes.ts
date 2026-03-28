import type { Language } from "./translations";

/** EU/AT-style allergen codes (single letters) for menu display */
export const ALLERGEN_CODES_ORDER = ["A", "B", "C", "D", "E", "F", "G", "H", "L", "M", "N", "O", "P", "R"] as const;

export type AllergenCode = (typeof ALLERGEN_CODES_ORDER)[number];

const LEGENDS: Record<Language, Record<AllergenCode, string>> = {
  de: {
    A: "Glutenhaltiges Getreide",
    B: "Krebstiere",
    C: "Eier",
    D: "Fisch",
    E: "Erdnüsse",
    F: "Soja",
    G: "Milch",
    H: "Schalenfrüchte",
    L: "Lupinen",
    M: "Weichtiere",
    N: "Sellerie",
    O: "Senf",
    P: "Sesam",
    R: "Schwefeldioxid / Sulfite"
  },
  en: {
    A: "Cereals containing gluten",
    B: "Crustaceans",
    C: "Eggs",
    D: "Fish",
    E: "Peanuts",
    F: "Soybeans",
    G: "Milk",
    H: "Nuts",
    L: "Lupin",
    M: "Molluscs",
    N: "Celery",
    O: "Mustard",
    P: "Sesame",
    R: "Sulphur dioxide / sulphites"
  }
};

export function allergenLabel(code: string, lang: Language): string | undefined {
  const c = code.trim().toUpperCase() as AllergenCode;
  if (!ALLERGEN_CODES_ORDER.includes(c)) return undefined;
  return LEGENDS[lang][c];
}

export function allergenLegendEntries(lang: Language): { code: AllergenCode; label: string }[] {
  return ALLERGEN_CODES_ORDER.map((code) => ({ code, label: LEGENDS[lang][code] }));
}

export function normalizeAllergenCodes(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out = new Set<string>();
  for (const x of raw) {
    if (typeof x !== "string") continue;
    const u = x.trim().toUpperCase();
    if (u.length === 1 && ALLERGEN_CODES_ORDER.includes(u as AllergenCode)) out.add(u);
  }
  return [...out].sort((a, b) => ALLERGEN_CODES_ORDER.indexOf(a as AllergenCode) - ALLERGEN_CODES_ORDER.indexOf(b as AllergenCode));
}
