import type { MenuCategory, MenuItem, MenuItemFlags } from "./menu-types";
import { formatPriceEur, labelMenuItem } from "./menu-helpers";

export type { MenuCategory, MenuItem, MenuItemFlags } from "./menu-types";

export { formatPriceEur, labelMenuItem };

/**
 * Seed menu (also written to `data/menu.json` via `npm run export-menu`).
 * Live site reads from `data/menu.json` through `/api/menu` and MenuDataProvider.
 */

/** Premium dark food photography (Unsplash) — placeholders per dish */
const I = {
  wok: "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=900&q=80",
  tofu: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80",
  noodles: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80",
  rice: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80",
  chicken: "https://images.unsplash.com/photo-1598103442097-550bdae62528?auto=format&fit=crop&w=900&q=80",
  duck: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
  beef: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80",
  salmon: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80",
  shrimp: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=900&q=80",
  bento: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=900&q=80",
  lunch: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=900&q=80",
  dessert: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=80",
  drink: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80"
};

const ph = {
  en: "Signature dish from our menu.",
  de: "Gericht von unserer Speisekarte."
};

type ItemOptions = MenuItemFlags & {
  description?: { de: string; en: string };
};

function item(
  id: string,
  de: string,
  en: string,
  priceEur: number,
  image: string,
  opts?: ItemOptions
): MenuItem {
  const { description, ...flags } = opts || {};
  return {
    id,
    name: { de, en },
    description: description ?? { de: ph.de, en: ph.en },
    priceEur,
    image,
    ...flags
  };
}

export const menuCategories: MenuCategory[] = [
  { id: "soups", title: { en: "Soups", de: "Suppen" }, items: [] },
  { id: "starters-salads", title: { en: "Starters & Salads", de: "Vorspeisen & Salate" }, items: [] },
  { id: "sushi", title: { en: "Sushi", de: "Sushi" }, items: [] },
  { id: "maki-cat", title: { en: "Maki", de: "Maki" }, items: [] },
  { id: "sashimi", title: { en: "Sashimi", de: "Sashimi" }, items: [] },
  {
    id: "fried-noodles-rice",
    title: { en: "Fried Noodles & Rice", de: "Gebratene Nudeln & Reis" },
    items: [
      item("veg-eierreis-gemuese", "Eierreis mit Gemüse", "Egg fried rice with vegetables", 9.5, I.rice, { vegetarian: true }),
      item("veg-gebratene-nudeln-gemuese", "Gebratene Nudeln mit Gemüse", "Fried noodles with vegetables", 9.5, I.noodles, {
        vegetarian: true,
        vegan: true
      })
    ]
  },
  {
    id: "warm-dishes",
    title: { en: "Warm Dishes with Rice", de: "Warme Speisen mit Reis" },
    items: [
      item("warm-wok-chicken", "Wok Chicken", "Wok chicken", 12.9, I.chicken, { isBestseller: true }),
      item("warm-teriyaki-chicken", "Teriyaki Chicken", "Teriyaki chicken", 13.5, I.chicken, { isBestseller: true }),
      item("warm-basilikum-chicken", "Basilikum Chicken", "Basil chicken", 13.5, I.chicken, { spicy: true }),
      item("warm-red-curry-chicken", "Red Curry Chicken", "Red curry chicken", 13.5, I.chicken, { spicy: true }),
      item("warm-sesam-chicken", "Sesam Chicken", "Sesame chicken", 13.5, I.chicken),
      item("warm-cashew-chicken", "Cashew Chicken", "Cashew chicken", 13.5, I.chicken),
      item("warm-wok-duck", "Wok Duck", "Wok duck", 14.5, I.duck),
      item("warm-mango-duck", "Mango Duck", "Mango duck", 14.5, I.duck),
      item("warm-red-curry-duck", "Red Curry Duck", "Red curry duck", 14.5, I.duck, { spicy: true }),
      item("warm-wok-beef", "Wok Beef", "Wok beef", 14.5, I.beef),
      item("warm-chili-beef", "Chili Beef", "Chili beef", 14.5, I.beef, { spicy: true }),
      item("warm-black-pfeffer-beef", "Black Pfeffer Beef", "Black pepper beef", 14.5, I.beef, { spicy: true }),
      item("warm-bulgogi", "Bulgogi", "Bulgogi", 14.9, I.beef, { isBestseller: true }),
      item("warm-lachs-teriyaki", "Lachs Teriyaki", "Salmon teriyaki", 14.9, I.salmon, { isBestseller: true }),
      item("warm-red-curry-garnelen", "Red Curry Garnelen", "Red curry prawns", 17.9, I.shrimp, { spicy: true }),
      item("warm-pfeffer-garnelen", "Pfeffer Garnelen", "Pepper prawns", 17.9, I.shrimp, { spicy: true })
    ]
  },
  {
    id: "bento",
    title: { en: "Bento", de: "Bento mit Reis" },
    items: [
      item(
        "bento-ente",
        "Ente Bento",
        "Duck bento",
        13.5,
        I.bento,
        { description: { de: "Mit Miso Suppe, Salat, Obst, 2 Sushi & 3 Maki.", en: "With miso soup, salad, fruit, 2 sushi & 3 maki." } }
      ),
      item(
        "bento-lachs",
        "Lachs Bento",
        "Salmon bento",
        13.5,
        I.bento,
        { isBestseller: true, description: { de: "Mit Miso Suppe, Salat, Obst, 2 Sushi & 3 Maki.", en: "With miso soup, salad, fruit, 2 sushi & 3 maki." } }
      ),
      item(
        "bento-vegan",
        "Vegan Bento",
        "Vegan bento",
        12.5,
        I.bento,
        {
          vegetarian: true,
          vegan: true,
          isNew: true,
          description: { de: "Mit Miso Suppe, Salat, Obst, 2 Sushi & 3 Maki.", en: "With miso soup, salad, fruit, 2 sushi & 3 maki." }
        }
      ),
      item(
        "bento-thunfisch",
        "Thunfisch Bento",
        "Tuna bento",
        14.5,
        I.bento,
        { description: { de: "Mit Miso Suppe, Salat, Obst, 2 Sushi & 3 Maki.", en: "With miso soup, salad, fruit, 2 sushi & 3 maki." } }
      ),
      item(
        "bento-sesam-chicken",
        "Sesam Chicken Bento",
        "Sesame chicken bento",
        13.5,
        I.bento,
        { description: { de: "Mit Miso Suppe, Salat, Obst, 2 Sushi & 3 Maki.", en: "With miso soup, salad, fruit, 2 sushi & 3 maki." } }
      ),
      item(
        "bento-bulgogi",
        "Bulgogi Bento",
        "Bulgogi bento",
        14.5,
        I.bento,
        { description: { de: "Mit Miso Suppe, Salat, Obst, 2 Sushi & 3 Maki.", en: "With miso soup, salad, fruit, 2 sushi & 3 maki." } }
      )
    ]
  },
  {
    id: "vegetarian",
    title: { en: "Vegetarian", de: "Vegetarisch" },
    items: [
      item("veg-wok-gemuese-reis", "Wok Gemüse mit Reis", "Wok vegetables with rice", 12.9, I.wok, {
        vegetarian: true,
        vegan: true
      }),
      item("veg-red-curry-tofu", "Red Curry Tofu mit Reis", "Red curry tofu with rice", 12.9, I.tofu, {
        vegetarian: true,
        vegan: true,
        spicy: true,
        isNew: true
      }),
      item("veg-cashew-tofu", "Cashew Tofu mit Reis", "Cashew tofu with rice", 12.9, I.tofu, { vegetarian: true, vegan: true }),
      item("veg-basilikum-tofu", "Basilikum Tofu mit Reis", "Basil tofu with rice", 12.9, I.tofu, { vegetarian: true, vegan: true, spicy: true })
    ]
  },
  {
    id: "lunch",
    title: { en: "Lunch Menu (Mon–Fri 11:00–15:00)", de: "Mittagsmenü (Mo–Fr 11:00–15:00)" },
    items: [
      item("m1", "M1 Wok Gemüse mit Reis", "M1 Wok vegetables with rice", 8.9, I.wok, { vegetarian: true, vegan: true }),
      item("m2", "M2 Wok Chicken mit Reis", "M2 Wok chicken with rice", 8.9, I.chicken),
      item("m3", "M3 Wok Rindfleisch mit Reis", "M3 Wok beef with rice", 9.5, I.beef),
      item("m4", "M4 Wok Ente mit Teriyaki und Reis", "M4 Wok duck with teriyaki and rice", 9.5, I.duck),
      item("m5", "M5 Eierreis mit Hühnerfleisch", "M5 Egg fried rice with chicken", 8.9, I.rice),
      item("m6", "M6 Gebratene Nudeln mit Hühnerfleisch", "M6 Fried noodles with chicken", 8.9, I.noodles),
      item("m7", "M7 Eierreis mit Lachs", "M7 Egg fried rice with salmon", 9.9, I.salmon),
      item("m8", "M8 Gebratene Nudeln mit Lachs", "M8 Fried noodles with salmon", 9.9, I.noodles),
      item("m9", "M9 Lachs Teriyaki mit Gemüse", "M9 Salmon teriyaki with vegetables", 9.9, I.salmon),
      item(
        "m10",
        "M10 Sushi Set klein (6 Nigiri, 3 Maki)",
        "M10 Small sushi set (6 nigiri, 3 maki)",
        10.9,
        I.lunch,
        { isBestseller: true }
      ),
      item("m11", "M11 Vietn. Basilikum Chicken", "M11 Vietnamese basil chicken", 9.5, I.chicken, { spicy: true }),
      item("m12", "M12 Maki Mix", "M12 Maki mix", 10.9, I.lunch, { isNew: true }),
      item("m13", "M13 Eierreis mit Gemüse & knusprigem Huhn", "M13 Egg fried rice with vegetables & crispy chicken", 9.5, I.rice),
      item("m14", "M14 Nudeln mit Gemüse & knusprigem Huhn", "M14 Noodles with vegetables & crispy chicken", 9.5, I.noodles),
      item("m15", "M15 Knuspriges Huhn", "M15 Crispy chicken", 9.9, I.chicken, { isNew: true })
    ]
  },
  {
    id: "sides-dessert",
    title: { en: "Side Dishes & Dessert", de: "Beilagen & Dessert" },
    items: [
      item("side-nudeln", "Gebratene Nudeln", "Fried noodles", 5.0, I.noodles),
      item("side-eierreis", "Eierreis", "Egg fried rice", 5.0, I.rice),
      item("side-bananen", "Gebackene Bananen", "Baked bananas", 3.9, I.dessert),
      item("side-mochi-sesam", "Mochi Sesam (2 Stk.)", "Mochi sesame (2 pcs.)", 3.5, I.dessert),
      item("side-mochi-peanut", "Mochi Peanut (2 Stk.)", "Mochi peanut (2 pcs.)", 3.5, I.dessert)
    ]
  },
  {
    id: "drinks",
    title: { en: "Drinks", de: "Getränke" },
    items: [
      item("drink-soft", "Cola / Cola Zero / Almdudler / Fanta (0,33L)", "Cola / Cola Zero / Almdudler / Fanta (0.33L)", 2.0, I.drink),
      item("drink-eistee", "Rauch Eistee (0,5L)", "Rauch iced tea (0.5L)", 2.8, I.drink),
      item("drink-aloe", "Aloe Vera", "Aloe vera", 3.5, I.drink),
      item("drink-roemer", "Römerquelle", "Römerquelle mineral water", 2.6, I.drink),
      item("drink-mango-lychee", "Mango / Lychee Saft", "Mango / lychee juice", 3.5, I.drink),
      item("drink-apfel", "Apfelsaft 0,25L", "Apple juice 0.25L", 2.9, I.drink),
      item("drink-apfel-soda", "Apfelsaft mit Soda", "Apple juice with soda", 4.5, I.drink),
      item("drink-apfel-wasser", "Apfelsaft mit Wasser", "Apple juice with water", 3.9, I.drink),
      item("drink-redbull", "Red Bull", "Red Bull", 3.5, I.drink),
      item("drink-gruener-tee", "Grüner Tee", "Green tea", 3.9, I.drink),
      item("drink-tsingtao", "Tsing Dao Bier", "Tsingtao beer", 3.5, I.drink),
      item("drink-kirin", "Kirin Ichiban Bier", "Kirin Ichiban beer", 3.5, I.drink),
      item("drink-stiegl", "Stiegl Bier", "Stiegl beer", 3.0, I.drink),
      item("drink-ottakringer", "Ottakringer Bier", "Ottakringer beer", 2.8, I.drink)
    ]
  }
];

const flatItems = menuCategories.flatMap((c) => c.items);

/** @deprecated Use MenuDataProvider itemById — kept for export script compatibility */
export const menuItemById: Record<string, MenuItem> = Object.fromEntries(flatItems.map((i) => [i.id, i]));

/** @deprecated Use MenuDataProvider */
export function getMenuItem(id: string): MenuItem | undefined {
  return menuItemById[id];
}

export const bestsellers: MenuItem[] = flatItems.filter((d) => d.isBestseller);
export const newDishes: MenuItem[] = flatItems.filter((d) => d.isNew);
