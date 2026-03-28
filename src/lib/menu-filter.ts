import type { MenuItem } from "./menu-types";

export type MenuAttributeFilter = {
  vegan: boolean;
  vegetarian: boolean;
  spicy: boolean;
  bestseller: boolean;
  isNew: boolean;
};

export const emptyMenuAttributeFilter = (): MenuAttributeFilter => ({
  vegan: false,
  vegetarian: false,
  spicy: false,
  bestseller: false,
  isNew: false
});

export function menuFilterIsActive(f: MenuAttributeFilter): boolean {
  return f.vegan || f.vegetarian || f.spicy || f.bestseller || f.isNew;
}

/** Item must satisfy every enabled filter (AND). */
export function itemMatchesMenuFilters(item: MenuItem, f: MenuAttributeFilter): boolean {
  if (!menuFilterIsActive(f)) return true;
  if (f.vegan && !item.vegan) return false;
  /** Vegetarian filter includes strictly vegetarian and vegan dishes */
  if (f.vegetarian && !item.vegetarian && !item.vegan) return false;
  if (f.spicy && !item.spicy) return false;
  if (f.bestseller && !item.isBestseller) return false;
  if (f.isNew && !item.isNew) return false;
  return true;
}

export function filterBestsellersAndNewSections(bestsellers: MenuItem[], newDishes: MenuItem[], f: MenuAttributeFilter) {
  const filteredBestsellers = bestsellers.filter((i) => itemMatchesMenuFilters(i, f));
  const bestsellerIds = new Set(filteredBestsellers.map((i) => i.id));
  const filteredNew = newDishes.filter((i) => itemMatchesMenuFilters(i, f) && !bestsellerIds.has(i.id));
  return { filteredBestsellers, filteredNew };
}
