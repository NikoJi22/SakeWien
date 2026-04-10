/** Category ids whose items may show sushi add-ons in the order flow */
export const MENU_CATEGORY_IDS_WITH_SUSHI_EXTRAS = [
  "sushi",
  "sashimi",
  "sushi-platters",
  "special-rolls",
  "maki-cat"
] as const;

export type MenuCategoryIdWithSushiExtras = (typeof MENU_CATEGORY_IDS_WITH_SUSHI_EXTRAS)[number];

export function categoryHasSushiExtras(categoryId: string): boolean {
  return (MENU_CATEGORY_IDS_WITH_SUSHI_EXTRAS as readonly string[]).includes(categoryId);
}
