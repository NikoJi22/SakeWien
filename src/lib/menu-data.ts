import type { LunchStarterChoice, MenuCategory, MenuItem, MenuItemFlags } from "./menu-types";
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

const drinkDesc = {
  de: "Aus unserer Getränkekarte.",
  en: "From our drinks menu."
};

type ItemOptions = MenuItemFlags & {
  description?: { de: string; en: string };
  allergens?: string[];
  lunchStarterChoice?: LunchStarterChoice;
};

/** Shared Mittagsmenü Vorspeisen — Kunde wählt eine beim Bestellen. */
export const LUNCH_STARTER_CHOICE: LunchStarterChoice = {
  label: { de: "Vorspeise", en: "Starter" },
  options: [
    { id: "ls-miso", name: { de: "Miso Suppe", en: "Miso soup" } },
    { id: "ls-sweet-sour", name: { de: "Süßsauer Suppe", en: "Sweet & sour soup" } },
    { id: "ls-spring-rolls", name: { de: "Mini Frühlingsrollen", en: "Mini spring rolls" } }
  ]
};

const lunchMenuDescription = {
  de: "Mo–Fr 11:00–15:00. Inklusive einer wählbaren Vorspeise (beim Bestellen auswählen).",
  en: "Mon–Fri 11:00–15:00. Includes one starter of your choice (select when ordering)."
};

function item(
  id: string,
  de: string,
  en: string,
  priceEur: number,
  image: string,
  opts?: ItemOptions
): MenuItem {
  const { description, allergens, lunchStarterChoice, ...flags } = opts || {};
  return {
    id,
    name: { de, en },
    description: description ?? { de: ph.de, en: ph.en },
    priceEur,
    image,
    ...(allergens?.length ? { allergens } : {}),
    ...(lunchStarterChoice ? { lunchStarterChoice } : {}),
    ...flags
  };
}

export const menuCategories: MenuCategory[] = [
  {
    id: "soups",
    title: { en: "Soups", de: "Suppen" },
    items: [
      item("soup-miso", "Miso Suppe", "Miso soup", 3.9, I.lunch, { vegetarian: true, vegan: true, allergens: ["F"] }),
      item(
        "soup-hot-sour",
        "Peking-Sauer-Suppe",
        "Hot & sour soup",
        4.5,
        I.lunch,
        { spicy: true, description: { de: "Leicht scharf, asiatisch-würzig.", en: "Lightly spicy, aromatic." }, allergens: ["A", "F", "G", "C"] }
      ),
      item(
        "soup-tom-yam",
        "Tom Yum Suppe",
        "Tom yum soup",
        5.9,
        I.shrimp,
        {
          spicy: true,
          isBestseller: true,
          description: { de: "Mit Garnelen, Zitronengras und Chili.", en: "With prawns, lemongrass and chili." },
          allergens: ["B", "D", "F", "G", "N"]
        }
      )
    ]
  },
  {
    id: "starters-salads",
    title: { en: "Starters & Salads", de: "Vorspeisen & Salate" },
    items: [
      item("starter-edamame", "Edamame", "Edamame", 4.5, I.tofu, { vegetarian: true, vegan: true, allergens: ["F"] }),
      item(
        "starter-gyoza",
        "Gyoza (6 Stk.)",
        "Gyoza (6 pcs.)",
        6.9,
        I.chicken,
        { description: { de: "Hausgemachte Teigtaschen, leicht angebraten.", en: "Pan-fried dumplings." }, allergens: ["A", "F", "G", "C"] }
      ),
      item("starter-wakame", "Wakame Salat", "Wakame salad", 5.5, I.tofu, { vegetarian: true, vegan: true, allergens: ["D", "F", "G", "P"] }),
      item(
        "starter-thai-beef",
        "Thai Beef Salat",
        "Thai beef salad",
        8.9,
        I.beef,
        { spicy: true, description: { de: "Rindfleischstreifen, Kräuter, Limette.", en: "Beef strips, herbs, lime." }, allergens: ["F", "G", "P", "N"] }
      ),
      item(
        "starter-summer-roll",
        "Sommerrollen (2 Stk.)",
        "Summer rolls (2 pcs.)",
        6.5,
        I.tofu,
        { vegetarian: true, vegan: true, isNew: true, description: { de: "Reispapier, Gemüse, Kräuter, Erdnussdip.", en: "Rice paper, vegetables, herbs, peanut dip." }, allergens: ["A", "E", "F", "P"] }
      )
    ]
  },
  {
    id: "sushi",
    title: { en: "Sushi", de: "Sushi" },
    items: [
      item("sushi-nigiri-salmon", "Nigiri Lachs (2 Stk.)", "Salmon nigiri (2 pcs.)", 4.9, I.salmon, { allergens: ["D", "G", "F", "C"] }),
      item("sushi-nigiri-tuna", "Nigiri Thunfisch (2 Stk.)", "Tuna nigiri (2 pcs.)", 5.2, I.salmon, { allergens: ["D", "G", "F", "C"] }),
      item("sushi-nigiri-ebi", "Nigiri Garnele (2 Stk.)", "Prawn nigiri (2 pcs.)", 5.2, I.shrimp, { allergens: ["B", "D", "G", "F", "C"] }),
      item(
        "sushi-nigiri-tamago",
        "Nigiri Tamago (2 Stk.)",
        "Egg nigiri (2 pcs.)",
        4.5,
        I.lunch,
        { vegetarian: true, allergens: ["C", "G", "F", "A"] }
      ),
      item(
        "sushi-set-9",
        "Sushi Set klein (9 Stk.)",
        "Small sushi set (9 pcs.)",
        14.9,
        I.lunch,
        { isBestseller: true, description: { de: "Auswahl Nigiri & Maki.", en: "Assorted nigiri & maki." }, allergens: ["A", "D", "G", "F", "C", "B"] }
      ),
      item(
        "sushi-set-15",
        "Sushi Set gross (15 Stk.)",
        "Large sushi set (15 pcs.)",
        22.9,
        I.lunch,
        { description: { de: "Auswahl Nigiri & Maki.", en: "Assorted nigiri & maki." }, allergens: ["A", "D", "G", "F", "C", "B"] }
      )
    ]
  },
  {
    id: "maki-cat",
    title: { en: "Maki", de: "Maki" },
    items: [
      item("maki-salmon", "Maki Lachs (8 Stk.)", "Salmon maki (8 pcs.)", 7.9, I.salmon, { allergens: ["A", "D", "G", "F", "C"] }),
      item("maki-avocado", "Maki Avocado (8 Stk.)", "Avocado maki (8 pcs.)", 6.9, I.tofu, { vegetarian: true, vegan: true, allergens: ["A", "F"] }),
      item("maki-cucumber", "Maki Gurke (8 Stk.)", "Cucumber maki (8 pcs.)", 6.5, I.tofu, { vegetarian: true, vegan: true, allergens: ["A", "F"] }),
      item("maki-tuna", "Maki Thunfisch (8 Stk.)", "Tuna maki (8 pcs.)", 8.9, I.salmon, { allergens: ["A", "D", "G", "F", "C"] }),
      item(
        "maki-california",
        "California Roll (8 Stk.)",
        "California roll (8 pcs.)",
        9.9,
        I.salmon,
        { isBestseller: true, allergens: ["A", "D", "G", "F", "C", "B"] }
      ),
      item(
        "maki-spicy-tuna",
        "Spicy Tuna Roll (8 Stk.)",
        "Spicy tuna roll (8 pcs.)",
        10.5,
        I.salmon,
        { spicy: true, allergens: ["A", "D", "G", "F", "C", "O"] }
      ),
      item(
        "maki-dragon",
        "Dragon Roll (8 Stk.)",
        "Dragon roll (8 pcs.)",
        12.9,
        I.salmon,
        { isNew: true, description: { de: "Lachs, Avocado, Sesam.", en: "Salmon, avocado, sesame." }, allergens: ["A", "D", "G", "F", "C", "P"] }
      )
    ]
  },
  {
    id: "sashimi",
    title: { en: "Sashimi", de: "Sashimi" },
    items: [
      item("sashimi-salmon-5", "Sashimi Lachs (5 Stk.)", "Salmon sashimi (5 pcs.)", 11.9, I.salmon, { allergens: ["D"] }),
      item("sashimi-tuna-5", "Sashimi Thunfisch (5 Stk.)", "Tuna sashimi (5 pcs.)", 12.9, I.salmon, { allergens: ["D"] }),
      item(
        "sashimi-mix-9",
        "Sashimi Mix (9 Stk.)",
        "Sashimi mix (9 pcs.)",
        21.9,
        I.salmon,
        { isBestseller: true, description: { de: "Lachs, Thunfisch, weißer Fisch.", en: "Salmon, tuna, white fish." }, allergens: ["D"] }
      )
    ]
  },
  {
    id: "fried-noodles-rice",
    title: { en: "Fried Noodles & Rice", de: "Gebratene Nudeln & Reis" },
    items: [
      item("veg-eierreis-gemuese", "Eierreis mit Gemüse", "Egg fried rice with vegetables", 9.5, I.rice, {
        vegetarian: true,
        allergens: ["C", "G", "F", "A"]
      }),
      item("veg-gebratene-nudeln-gemuese", "Gebratene Nudeln mit Gemüse", "Fried noodles with vegetables", 9.5, I.noodles, {
        vegetarian: true,
        vegan: true,
        allergens: ["A", "F", "G"]
      })
    ]
  },
  {
    id: "warm-dishes",
    title: { en: "Warm Dishes with Rice", de: "Warme Speisen mit Reis" },
    items: [
      item("warm-wok-chicken", "Wok Chicken", "Wok chicken", 12.9, I.chicken, { isBestseller: true, allergens: ["G", "F", "A", "C"] }),
      item("warm-teriyaki-chicken", "Teriyaki Chicken", "Teriyaki chicken", 13.5, I.chicken, { isBestseller: true, allergens: ["G", "F", "A", "C"] }),
      item("warm-basilikum-chicken", "Basilikum Chicken", "Basil chicken", 13.5, I.chicken, { spicy: true, allergens: ["G", "F", "A", "C", "N"] }),
      item("warm-red-curry-chicken", "Red Curry Chicken", "Red curry chicken", 13.5, I.chicken, { spicy: true, allergens: ["G", "F", "A", "C"] }),
      item("warm-sesam-chicken", "Sesam Chicken", "Sesame chicken", 13.5, I.chicken, { allergens: ["G", "F", "A", "C", "P"] }),
      item("warm-cashew-chicken", "Cashew Chicken", "Cashew chicken", 13.5, I.chicken, { allergens: ["G", "F", "A", "C", "H"] }),
      item("warm-wok-duck", "Wok Duck", "Wok duck", 14.5, I.duck, { allergens: ["G", "F", "A"] }),
      item("warm-mango-duck", "Mango Duck", "Mango duck", 14.5, I.duck, { allergens: ["G", "F", "A"] }),
      item("warm-red-curry-duck", "Red Curry Duck", "Red curry duck", 14.5, I.duck, { spicy: true, allergens: ["G", "F", "A"] }),
      item("warm-wok-beef", "Wok Beef", "Wok beef", 14.5, I.beef, { allergens: ["G", "F", "A"] }),
      item("warm-chili-beef", "Chili Beef", "Chili beef", 14.5, I.beef, { spicy: true, allergens: ["G", "F", "A"] }),
      item("warm-black-pfeffer-beef", "Black Pfeffer Beef", "Black pepper beef", 14.5, I.beef, { spicy: true, allergens: ["G", "F", "A"] }),
      item("warm-bulgogi", "Bulgogi", "Bulgogi", 14.9, I.beef, { isBestseller: true, allergens: ["G", "F", "A", "C"] }),
      item("warm-lachs-teriyaki", "Lachs Teriyaki", "Salmon teriyaki", 14.9, I.salmon, { isBestseller: true, allergens: ["D", "G", "F", "C"] }),
      item("warm-red-curry-garnelen", "Red Curry Garnelen", "Red curry prawns", 17.9, I.shrimp, { spicy: true, allergens: ["B", "D", "G", "F"] }),
      item("warm-pfeffer-garnelen", "Pfeffer Garnelen", "Pepper prawns", 17.9, I.shrimp, { spicy: true, allergens: ["B", "D", "G", "F"] })
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
        {
          description: { de: "Mit Miso Suppe, Salat, Obst, 2 Sushi & 3 Maki.", en: "With miso soup, salad, fruit, 2 sushi & 3 maki." },
          allergens: ["A", "D", "G", "F", "C", "B"]
        }
      ),
      item(
        "bento-lachs",
        "Lachs Bento",
        "Salmon bento",
        13.5,
        I.bento,
        {
          isBestseller: true,
          description: { de: "Mit Miso Suppe, Salat, Obst, 2 Sushi & 3 Maki.", en: "With miso soup, salad, fruit, 2 sushi & 3 maki." },
          allergens: ["A", "D", "G", "F", "C", "B"]
        }
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
          description: { de: "Mit Miso Suppe, Salat, Obst, 2 Sushi & 3 Maki.", en: "With miso soup, salad, fruit, 2 sushi & 3 maki." },
          allergens: ["A", "F"]
        }
      ),
      item(
        "bento-thunfisch",
        "Thunfisch Bento",
        "Tuna bento",
        14.5,
        I.bento,
        {
          description: { de: "Mit Miso Suppe, Salat, Obst, 2 Sushi & 3 Maki.", en: "With miso soup, salad, fruit, 2 sushi & 3 maki." },
          allergens: ["A", "D", "G", "F", "C", "B"]
        }
      ),
      item(
        "bento-sesam-chicken",
        "Sesam Chicken Bento",
        "Sesame chicken bento",
        13.5,
        I.bento,
        {
          description: { de: "Mit Miso Suppe, Salat, Obst, 2 Sushi & 3 Maki.", en: "With miso soup, salad, fruit, 2 sushi & 3 maki." },
          allergens: ["A", "G", "F", "C", "P"]
        }
      ),
      item(
        "bento-bulgogi",
        "Bulgogi Bento",
        "Bulgogi bento",
        14.5,
        I.bento,
        {
          description: { de: "Mit Miso Suppe, Salat, Obst, 2 Sushi & 3 Maki.", en: "With miso soup, salad, fruit, 2 sushi & 3 maki." },
          allergens: ["A", "G", "F", "C"]
        }
      )
    ]
  },
  {
    id: "vegetarian",
    title: { en: "Vegetarian", de: "Vegetarisch" },
    items: [
      item("veg-wok-gemuese-reis", "Wok Gemüse mit Reis", "Wok vegetables with rice", 12.9, I.wok, {
        vegetarian: true,
        vegan: true,
        allergens: ["F", "G", "A"]
      }),
      item("veg-red-curry-tofu", "Red Curry Tofu mit Reis", "Red curry tofu with rice", 12.9, I.tofu, {
        vegetarian: true,
        vegan: true,
        spicy: true,
        isNew: true,
        allergens: ["F", "G", "A"]
      }),
      item("veg-cashew-tofu", "Cashew Tofu mit Reis", "Cashew tofu with rice", 12.9, I.tofu, {
        vegetarian: true,
        vegan: true,
        allergens: ["F", "G", "A", "H"]
      }),
      item("veg-basilikum-tofu", "Basilikum Tofu mit Reis", "Basil tofu with rice", 12.9, I.tofu, {
        vegetarian: true,
        vegan: true,
        spicy: true,
        allergens: ["F", "G", "A", "N"]
      })
    ]
  },
  {
    id: "lunch",
    title: {
      en: "Lunch menu (Mon–Fri 11:00–15:00)\n(Starter: miso soup / sweet & sour soup / mini spring rolls)",
      de: "Mittagsmenü (Mo–Fr 11:00–15:00)\n(Vorspeise: Miso Suppe / Süßsauer Suppe / Mini Frühlingsrollen)"
    },
    items: [
      item("m1", "M1 Wok Gemüse mit Reis", "M1 Wok vegetables with rice", 8.9, I.wok, {
        description: lunchMenuDescription,
        lunchStarterChoice: LUNCH_STARTER_CHOICE,
        vegetarian: true,
        vegan: true,
        allergens: ["F", "G", "A"]
      }),
      item("m2", "M2 Wok Chicken mit Reis", "M2 Wok chicken with rice", 8.9, I.chicken, {
        description: lunchMenuDescription,
        lunchStarterChoice: LUNCH_STARTER_CHOICE,
        allergens: ["G", "F", "A", "C"]
      }),
      item("m3", "M3 Wok Rindfleisch mit Reis", "M3 Wok beef with rice", 9.5, I.beef, {
        description: lunchMenuDescription,
        lunchStarterChoice: LUNCH_STARTER_CHOICE,
        allergens: ["G", "F", "A"]
      }),
      item("m4", "M4 Wok Ente mit Teriyaki und Reis", "M4 Wok duck with teriyaki and rice", 9.5, I.duck, {
        description: lunchMenuDescription,
        lunchStarterChoice: LUNCH_STARTER_CHOICE,
        allergens: ["G", "F", "A"]
      }),
      item("m5", "M5 Eierreis mit Hühnerfleisch", "M5 Egg fried rice with chicken", 8.9, I.rice, {
        description: lunchMenuDescription,
        lunchStarterChoice: LUNCH_STARTER_CHOICE,
        allergens: ["C", "G", "F", "A"]
      }),
      item("m6", "M6 Gebratene Nudeln mit Hühnerfleisch", "M6 Fried noodles with chicken", 8.9, I.noodles, {
        description: lunchMenuDescription,
        lunchStarterChoice: LUNCH_STARTER_CHOICE,
        allergens: ["A", "G", "F", "C"]
      }),
      item("m7", "M7 Eierreis mit Lachs", "M7 Egg fried rice with salmon", 9.9, I.salmon, {
        description: lunchMenuDescription,
        lunchStarterChoice: LUNCH_STARTER_CHOICE,
        allergens: ["C", "D", "G", "F", "A"]
      }),
      item("m8", "M8 Gebratene Nudeln mit Lachs", "M8 Fried noodles with salmon", 9.9, I.noodles, {
        description: lunchMenuDescription,
        lunchStarterChoice: LUNCH_STARTER_CHOICE,
        allergens: ["A", "D", "G", "F", "C"]
      }),
      item("m9", "M9 Lachs Teriyaki mit Gemüse", "M9 Salmon teriyaki with vegetables", 9.9, I.salmon, {
        description: lunchMenuDescription,
        lunchStarterChoice: LUNCH_STARTER_CHOICE,
        allergens: ["D", "G", "F", "C"]
      }),
      item(
        "m10",
        "M10 Sushi Set klein (6 Nigiri, 3 Maki)",
        "M10 Small sushi set (6 nigiri, 3 maki)",
        10.9,
        I.lunch,
        {
          description: lunchMenuDescription,
          lunchStarterChoice: LUNCH_STARTER_CHOICE,
          isBestseller: true,
          allergens: ["A", "D", "G", "F", "C", "B"]
        }
      ),
      item("m11", "M11 Vietn. Basilikum Chicken", "M11 Vietnamese basil chicken", 9.5, I.chicken, {
        description: lunchMenuDescription,
        lunchStarterChoice: LUNCH_STARTER_CHOICE,
        spicy: true,
        allergens: ["G", "F", "A", "C", "N"]
      }),
      item("m12", "M12 Maki Mix", "M12 Maki mix", 10.9, I.lunch, {
        description: lunchMenuDescription,
        lunchStarterChoice: LUNCH_STARTER_CHOICE,
        isNew: true,
        allergens: ["A", "D", "G", "F", "C"]
      }),
      item("m13", "M13 Eierreis mit Gemüse & knusprigem Huhn", "M13 Egg fried rice with vegetables & crispy chicken", 9.5, I.rice, {
        description: lunchMenuDescription,
        lunchStarterChoice: LUNCH_STARTER_CHOICE,
        allergens: ["C", "G", "F", "A"]
      }),
      item("m14", "M14 Nudeln mit Gemüse & knusprigem Huhn", "M14 Noodles with vegetables & crispy chicken", 9.5, I.noodles, {
        description: lunchMenuDescription,
        lunchStarterChoice: LUNCH_STARTER_CHOICE,
        allergens: ["A", "G", "F", "C"]
      }),
      item("m15", "M15 Knuspriges Huhn", "M15 Crispy chicken", 9.9, I.chicken, {
        description: lunchMenuDescription,
        lunchStarterChoice: LUNCH_STARTER_CHOICE,
        isNew: true,
        allergens: ["A", "G", "F", "C"]
      })
    ]
  },
  {
    id: "sides-dessert",
    title: { en: "Side Dishes & Dessert", de: "Beilagen & Dessert" },
    items: [
      item("side-nudeln", "Gebratene Nudeln", "Fried noodles", 5.0, I.noodles, { allergens: ["A", "F", "G"] }),
      item("side-eierreis", "Eierreis", "Egg fried rice", 5.0, I.rice, { allergens: ["C", "G", "F", "A"] }),
      item("side-bananen", "Gebackene Bananen", "Baked bananas", 3.9, I.dessert, { vegetarian: true, allergens: ["A", "G"] }),
      item("side-mochi-sesam", "Mochi Sesam (2 Stk.)", "Mochi sesame (2 pcs.)", 3.5, I.dessert, { vegetarian: true, allergens: ["A", "G", "P"] }),
      item("side-mochi-peanut", "Mochi Peanut (2 Stk.)", "Mochi peanut (2 pcs.)", 3.5, I.dessert, { vegetarian: true, allergens: ["A", "G", "E"] })
    ]
  },
  {
    id: "drinks",
    title: { en: "Drinks", de: "Getränke" },
    items: [
      /** Einzeln bestellbar (keine Sammelposition ohne klare Wahl). Preise wie PDF. */
      item("drink-cola", "Cola (0,33L)", "Cola (0.33L)", 2.0, I.drink, {
        description: drinkDesc,
        vegan: true,
        vegetarian: true
      }),
      item("drink-cola-zero", "Cola Zero (0,33L)", "Cola Zero (0.33L)", 2.0, I.drink, {
        description: drinkDesc,
        vegan: true,
        vegetarian: true
      }),
      item("drink-almdudler", "Almdudler (0,33L)", "Almdudler (0.33L)", 2.0, I.drink, {
        description: drinkDesc,
        vegan: true,
        vegetarian: true
      }),
      item("drink-fanta", "Fanta (0,33L)", "Fanta (0.33L)", 2.0, I.drink, {
        description: drinkDesc,
        vegan: true,
        vegetarian: true
      }),
      item("drink-eistee", "Rauch Eistee (0,5L)", "Rauch iced tea (0.5L)", 2.8, I.drink, {
        description: drinkDesc,
        vegan: true,
        vegetarian: true
      }),
      item("drink-aloe", "Aloe Vera", "Aloe vera", 3.5, I.drink, { description: drinkDesc, vegan: true, vegetarian: true }),
      item("drink-roemer", "Römerquelle", "Römerquelle mineral water", 2.6, I.drink, {
        description: drinkDesc,
        vegan: true,
        vegetarian: true
      }),
      item("drink-mango-saft", "Mango Saft", "Mango juice", 3.5, I.drink, {
        description: drinkDesc,
        vegan: true,
        vegetarian: true
      }),
      item("drink-lychee-saft", "Lychee Saft", "Lychee juice", 3.5, I.drink, {
        description: drinkDesc,
        vegan: true,
        vegetarian: true
      }),
      item("drink-apfel", "Apfelsaft 0,25L", "Apple juice 0.25L", 2.9, I.drink, {
        description: drinkDesc,
        vegan: true,
        vegetarian: true
      }),
      item("drink-apfel-soda", "Apfelsaft mit Soda", "Apple juice with soda", 4.5, I.drink, {
        description: drinkDesc,
        vegan: true,
        vegetarian: true
      }),
      item("drink-apfel-wasser", "Apfelsaft mit Wasser", "Apple juice with water", 3.9, I.drink, {
        description: drinkDesc,
        vegan: true,
        vegetarian: true
      }),
      item("drink-redbull", "Red Bull", "Red Bull", 3.5, I.drink, { description: drinkDesc, vegan: true, vegetarian: true }),
      item("drink-gruener-tee", "Grüner Tee", "Green tea", 3.9, I.drink, { description: drinkDesc, vegan: true, vegetarian: true }),
      item("drink-tsingtao", "Tsing Dao Bier", "Tsing Dao beer", 3.5, I.drink, {
        description: drinkDesc,
        vegetarian: true,
        allergens: ["A"]
      }),
      item("drink-kirin", "Kirin Ichiban Bier", "Kirin Ichiban beer", 3.5, I.drink, {
        description: drinkDesc,
        vegetarian: true,
        allergens: ["A"]
      }),
      item("drink-stiegl", "Stiegl Bier", "Stiegl beer", 3.0, I.drink, {
        description: drinkDesc,
        vegetarian: true,
        allergens: ["A"]
      }),
      item("drink-ottakringer", "Ottakringer Bier", "Ottakringer beer", 2.8, I.drink, {
        description: drinkDesc,
        vegetarian: true,
        allergens: ["A"]
      })
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
