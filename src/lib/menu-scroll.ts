/** DOM id for a menu category section (Speisekarte / Bestellen). */
export function menuSectionId(categoryId: string): string {
  return `menu-section-${categoryId}`;
}

/** Nav / section slug passed to `menuSectionId` for spotlight blocks */
export const MENU_NAV_BESTSELLERS = "highlight-bestsellers";
export const MENU_NAV_NEW = "highlight-new";
