import type { MenuItem } from "./menu-types";

export type MenuAttributeFilter = {
  vegan: boolean;
  vegetarian: boolean;
  spicy1: boolean;
  spicy2: boolean;
  bestseller: boolean;
  isNew: boolean;
  specialDeals: boolean;
};

export const emptyMenuAttributeFilter = (): MenuAttributeFilter => ({
  vegan: false,
  vegetarian: false,
  spicy1: false,
  spicy2: false,
  bestseller: false,
  isNew: false,
  specialDeals: false
});

export function menuFilterIsActive(f: MenuAttributeFilter): boolean {
  return f.vegan || f.vegetarian || f.spicy1 || f.spicy2 || f.bestseller || f.isNew || f.specialDeals;
}

/** Item must satisfy every enabled filter (AND). */
export function itemMatchesMenuFilters(item: MenuItem, f: MenuAttributeFilter): boolean {
  if (!menuFilterIsActive(f)) return true;
  if (f.vegan && !item.vegan) return false;
  /** Vegetarian filter includes strictly vegetarian and vegan dishes */
  if (f.vegetarian && !item.vegetarian && !item.vegan) return false;
  const spicyLevel = item.spicyLevel ?? (item.spicy ? 1 : 0);
  if (f.spicy1 && spicyLevel < 1) return false;
  if (f.spicy2 && spicyLevel < 2) return false;
  if (f.bestseller && !item.isBestseller) return false;
  if (f.isNew && !item.isNew) return false;
  if (f.specialDeals && !item.isSpecialDeal) return false;
  if (item.isSoldOut) return false;
  return true;
}

export function filterBestsellersAndNewSections(bestsellers: MenuItem[], newDishes: MenuItem[], f: MenuAttributeFilter) {
  const filteredBestsellers = bestsellers.filter((i) => itemMatchesMenuFilters(i, f));
  const bestsellerIds = new Set(filteredBestsellers.map((i) => i.id));
  const filteredNew = newDishes.filter((i) => itemMatchesMenuFilters(i, f) && !bestsellerIds.has(i.id));
  return { filteredBestsellers, filteredNew };
}
