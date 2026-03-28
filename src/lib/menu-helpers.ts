import type { Language } from "./translations";
import type { MenuCategory, MenuItem } from "./menu-types";

export function formatPriceEur(value: number, lang: Language): string {
  const locale = lang === "de" ? "de-AT" : "en-AT";
  return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(value);
}

export function labelMenuItem(item: MenuItem, lang: Language) {
  return {
    name: item.name[lang],
    description: item.description[lang],
    price: formatPriceEur(item.priceEur, lang)
  };
}

export function buildMenuIndex(categories: MenuCategory[]) {
  const flatItems = categories.flatMap((c) => c.items);
  const itemById: Record<string, MenuItem> = Object.fromEntries(flatItems.map((i) => [i.id, i]));
  const bestsellers = flatItems.filter((d) => d.isBestseller);
  const newDishes = flatItems.filter((d) => d.isNew);
  return { itemById, bestsellers, newDishes, flatItems };
}
