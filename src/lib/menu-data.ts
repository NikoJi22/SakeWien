import type { LunchStarterChoice, MenuCategory, MenuItem, MenuItemFlags } from "./menu-types";
import { formatPriceEur, labelMenuItem } from "./menu-helpers";

export type { MenuCategory, MenuItem, MenuItemFlags } from "./menu-types";

export { formatPriceEur, labelMenuItem };

/**
 * TypeScript-Referenz-Speisekarte (lokal / `npm run export-menu` → `data/menu.json`).
 * Production liest nur Vercel Blob — diese Datei wird dort nicht nachgeladen (kein Lunch- o. Bild-Fallback aus dem Seed).
 */

const I = {
  wok: "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=900&q=80",
  tofu: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80",
  noodles: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80",
  rice: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80",
  chicken: "https://images.unsplash.com/photo-1598103442097-550bdae62528?auto=format&fit=crop&w=900&q=80",
  duck: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
  salmon: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80",
  shrimp: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=900&q=80",
  bento: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=900&q=80",
  lunch: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=900&q=80",
  dessert: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=80",
  drink: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80",
  dimsum: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=900&q=80",
  ramen: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80"
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

/** Mittagsmenü: eine wählbare Vorspeise beim Bestellen */
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
      item("soup-miso", "Miso Suppe", "Miso soup", 3.0, I.lunch, { vegetarian: true, vegan: true, allergens: ["F"] }),
      item("soup-hot-sour", "Süß-Sauer Suppe", "Sweet & sour soup", 3.5, I.lunch, {
        description: { de: "Klassische asiatische Suppe.", en: "Classic sweet and sour soup." }
      }),
      item("soup-vegetable", "Gemüse Suppe", "Vegetable soup", 3.9, I.tofu, {
        vegetarian: true,
        vegan: true,
        description: { de: "Vegan.", en: "Vegan." },
        allergens: ["F"]
      }),
      item(
        "soup-tom-kha",
        "Tom Kha Gai Suppe",
        "Tom kha gai soup",
        5.5,
        I.shrimp,
        {
          spicy: true,
          description: { de: "Kokos, Zitronengras, kräftig aromatisch.", en: "Coconut, lemongrass, aromatic." },
          allergens: ["F", "G"]
        }
      )
    ]
  },
  {
    id: "starters-salads",
    title: { en: "Starters & Salads", de: "Vorspeisen & Salate" },
    items: [
      item("starter-mini-spring", "Mini Frühlingsrollen (6 Stk.)", "Mini spring rolls (6 pcs.)", 3.5, I.chicken, { allergens: ["A", "C"] }),
      item(
        "starter-spring-chicken",
        "Frühlingsrollen mit Chicken (4 Stk.)",
        "Spring rolls with chicken (4 pcs.)",
        5.5,
        I.chicken,
        { allergens: ["A", "C"] }
      ),
      item(
        "starter-spring-shrimp",
        "Garnelen Frühlingsrollen (4 Stk.)",
        "Shrimp spring rolls (4 pcs.)",
        5.5,
        I.shrimp,
        { allergens: ["A", "B", "C"] }
      ),
      item(
        "starter-fried-shrimp",
        "Frittierte Garnelen (5 Stk.)",
        "Fried shrimp (5 pcs.)",
        5.5,
        I.shrimp,
        { allergens: ["A", "B"] }
      ),
      item("starter-chicken-popcorn", "Chicken Popcorn", "Chicken popcorn", 5.5, I.chicken, { allergens: ["A", "C"] }),
      item("starter-edamame", "Edamame", "Edamame", 4.9, I.tofu, { vegetarian: true, vegan: true, allergens: ["F"] }),
      item(
        "starter-gyoza-veg",
        "Gyoza mit Gemüse (5 Stk.)",
        "Gyoza with vegetables (5 pcs.)",
        5.0,
        I.tofu,
        { vegetarian: true, vegan: true, allergens: ["A", "F"] }
      ),
      item(
        "starter-gyoza-chicken",
        "Gyoza mit Hühnerfleisch (5 Stk.)",
        "Gyoza with chicken (5 pcs.)",
        5.0,
        I.chicken,
        { allergens: ["A", "F"] }
      ),
      item(
        "starter-summer-roll-duck",
        "Sommerrolle mit Ente (2 Stk.)",
        "Summer roll with duck (2 pcs.)",
        5.9,
        I.duck,
        { description: { de: "Reispapier, Gemüse, Kräuter.", en: "Rice paper, vegetables, herbs." }, allergens: ["A", "F"] }
      ),
      item(
        "starter-summer-roll-shrimp",
        "Sommerrolle mit Garnelen (2 Stk.)",
        "Summer roll with shrimp (2 pcs.)",
        5.9,
        I.shrimp,
        { allergens: ["A", "B", "F"] }
      ),
      item(
        "starter-bean-sprout",
        "Sojasprossen Salat",
        "Bean sprout salad",
        3.9,
        I.tofu,
        { vegetarian: true, vegan: true, allergens: ["F"] }
      ),
      item(
        "starter-seaweed-salad",
        "Seetang Salat",
        "Seaweed salad",
        6.5,
        I.tofu,
        { vegetarian: true, vegan: true, allergens: ["F", "P"] }
      ),
      item("starter-salmon-tartar-salad", "Lachstatar Salat", "Salmon tartar salad", 8.9, I.salmon, { allergens: ["D"] }),
      item("starter-avocado-tuna-salad", "Avocado Tuna Salat", "Avocado tuna salad", 8.9, I.salmon, { allergens: ["D"] }),
      item("starter-salmon-tartar-bowl", "Lachstatar Bowl", "Salmon tartar bowl", 10.9, I.salmon, { allergens: ["D"] }),
      item("starter-tuna-bowl", "Tuna Bowl", "Tuna bowl", 10.9, I.salmon, { allergens: ["D"] })
    ]
  },
  {
    id: "dim-sum",
    title: { en: "Dim Sum", de: "Dim Sum" },
    items: [
      item("dimsum-ha-gao", "Ha Gao (3 Stk.)", "Ha gao (3 pcs.)", 6.0, I.dimsum, { allergens: ["A", "B"] }),
      item(
        "dimsum-baerlauch-ha-gao",
        "Bärlauch Ha Gao (3 Stk.)",
        "Garlic chive ha gao (3 pcs.)",
        6.0,
        I.dimsum,
        { allergens: ["A", "B"] }
      ),
      item(
        "dimsum-xiao-long-bao",
        "Xiao Long Bao (4 Stk.)",
        "Xiao long bao (4 pcs.)",
        6.0,
        I.dimsum,
        { allergens: ["A", "C"] }
      )
    ]
  },
  {
    id: "sushi",
    title: { en: "Sushi Sets", de: "Sushi Sets" },
    items: [
      item("sushi-klein-6", "Sushi Klein (6 Stk.)", "Small sushi set (6 pcs.)", 11.9, I.lunch, { allergens: ["D"] }),
      item("sushi-mittel-8", "Sushi Mittel (8 Stk.)", "Medium sushi set (8 pcs.)", 13.9, I.lunch, { allergens: ["D"] }),
      item("sushi-gross-10", "Sushi Gross (10 Stk.)", "Large sushi set (10 pcs.)", 15.9, I.lunch, { allergens: ["D"] }),
      item("sushi-sake-mittel-8", "Sake Sushi Mittel (8 Stk.)", "Salmon sushi medium (8 pcs.)", 13.9, I.salmon, { allergens: ["D"] }),
      item("sushi-sake-gross-10", "Sake Sushi Gross (10 Stk.)", "Salmon sushi large (10 pcs.)", 13.9, I.salmon, { allergens: ["D"] }),
      item(
        "sushi-sake-maguro-mittel-8",
        "Sake Maguro Mittel (8 Stk.)",
        "Salmon & tuna medium (8 pcs.)",
        14.9,
        I.salmon,
        { allergens: ["D"] }
      ),
      item("sushi-maguro-mittel-8", "Maguro Sushi Mittel (8 Stk.)", "Tuna sushi medium (8 pcs.)", 15.9, I.salmon, { allergens: ["D"] }),
      item("sushi-ebi-mittel-8", "Ebi Sushi Mittel (8 Stk.)", "Prawn sushi medium (8 pcs.)", 15.9, I.shrimp, { allergens: ["B"] }),
      item(
        "sushi-vegan-mittel-8",
        "Vegan Sushi Mittel (8 Stk.)",
        "Vegan sushi medium (8 pcs.)",
        13.9,
        I.tofu,
        { vegetarian: true, vegan: true, allergens: ["F"] }
      )
    ]
  },
  {
    id: "sashimi",
    title: { en: "Sashimi", de: "Sashimi" },
    items: [
      item(
        "sashimi-klein-lachs",
        "Sashimi Klein (nur Lachs, 12 Scheiben)",
        "Small sashimi (salmon only, 12 slices)",
        20.9,
        I.salmon,
        { allergens: ["D"] }
      ),
      item(
        "sashimi-gross-mix",
        "Sashimi Gross Mix (21 Scheiben)",
        "Large sashimi mix (21 slices)",
        30.9,
        I.salmon,
        { isBestseller: true, description: { de: "Gemischter Fisch.", en: "Assorted fish." }, allergens: ["D"] }
      )
    ]
  },
  {
    id: "sushi-platters",
    title: { en: "Sushi Platters", de: "Sushi Teller" },
    items: [
      item("platter-maki-1p", "Sushi Maki Teller 1P", "Sushi maki platter 1 person", 16.9, I.lunch, { allergens: ["D"] }),
      item("platter-maki-2p", "Sushi Maki Teller 2P", "Sushi maki platter 2 persons", 30.9, I.lunch, { allergens: ["D"] }),
      item("platter-sashimi-2p", "Sushi Sashimi Teller 2P", "Sushi & sashimi platter 2 persons", 32.9, I.salmon, { allergens: ["D"] }),
      item(
        "platter-traum-mix-4p",
        "Sushi Traum Mix 4P",
        "Sushi dream mix 4 persons",
        56.9,
        I.lunch,
        { allergens: ["D"] }
      )
    ]
  },
  {
    id: "special-rolls",
    title: { en: "Special Rolls", de: "Special Rolls" },
    items: [
      item(
        "roll-ichiban",
        "Ichiban Roll",
        "Ichiban roll",
        13.9,
        I.salmon,
        { allergens: ["A", "B", "D", "F", "C"] }
      ),
      item(
        "roll-dragon",
        "Dragon Roll",
        "Dragon roll",
        12.9,
        I.salmon,
        { isBestseller: true, description: { de: "Lachs, Avocado, Sesam.", en: "Salmon, avocado, sesame." }, allergens: ["D", "F"] }
      ),
      item("roll-teriyaki-chicken", "Teriyaki Chicken Roll", "Teriyaki chicken roll", 12.9, I.chicken, { allergens: ["F"] }),
      item(
        "roll-vegan",
        "Vegan Roll",
        "Vegan roll",
        12.9,
        I.tofu,
        { vegetarian: true, vegan: true, allergens: ["F"] }
      ),
      item("roll-frisch-tuna", "Frisch Tuna Roll", "Fresh tuna roll", 14.9, I.salmon, { allergens: ["D", "B", "F"] }),
      item("roll-lachs-tatar", "Lachs Tatar Roll", "Salmon tartar roll", 12.9, I.salmon, { allergens: ["D"] }),
      item("roll-aburi-lachs", "Aburi Lachs Roll", "Seared salmon roll", 12.9, I.salmon, { allergens: ["D"] }),
      item(
        "roll-lachs-philadelphia",
        "Lachs Philadelphia Roll",
        "Salmon Philadelphia roll",
        12.9,
        I.salmon,
        { allergens: ["D", "G"] }
      )
    ]
  },
  {
    id: "maki-cat",
    title: { en: "Maki", de: "Maki" },
    items: [
      item("maki-sake-6", "Sake Maki (6 Stk.)", "Salmon maki (6 pcs.)", 4.5, I.salmon, { allergens: ["D"] }),
      item("maki-sake-12", "Sake Maki (12 Stk.)", "Salmon maki (12 pcs.)", 7.9, I.salmon, { allergens: ["D"] }),
      item("maki-sake-18", "Sake Maki (18 Stk.)", "Salmon maki (18 pcs.)", 11.9, I.salmon, { allergens: ["D"] }),
      item("maki-kappa-6", "Kappa Maki (6 Stk.)", "Cucumber maki (6 pcs.)", 4.5, I.tofu, { vegetarian: true, vegan: true }),
      item("maki-kappa-12", "Kappa Maki (12 Stk.)", "Cucumber maki (12 pcs.)", 7.9, I.tofu, { vegetarian: true, vegan: true }),
      item("maki-kappa-18", "Kappa Maki (18 Stk.)", "Cucumber maki (18 pcs.)", 11.9, I.tofu, { vegetarian: true, vegan: true }),
      item("maki-avocado-6", "Avocado Maki (6 Stk.)", "Avocado maki (6 pcs.)", 4.5, I.tofu, { vegetarian: true, vegan: true }),
      item("maki-avocado-12", "Avocado Maki (12 Stk.)", "Avocado maki (12 pcs.)", 7.9, I.tofu, { vegetarian: true, vegan: true }),
      item("maki-avocado-18", "Avocado Maki (18 Stk.)", "Avocado maki (18 pcs.)", 11.9, I.tofu, { vegetarian: true, vegan: true }),
      item("maki-ebi-tempura-6", "Ebi Tempura Maki (6 Stk.)", "Prawn tempura maki (6 pcs.)", 5.9, I.shrimp, { allergens: ["A", "B"] }),
      item("maki-ebi-tempura-12", "Ebi Tempura Maki (12 Stk.)", "Prawn tempura maki (12 pcs.)", 11.9, I.shrimp, { allergens: ["A", "B"] }),
      item("maki-ebi-tempura-18", "Ebi Tempura Maki (18 Stk.)", "Prawn tempura maki (18 pcs.)", 17.9, I.shrimp, { allergens: ["A", "B"] }),
      item("maki-mix-klein", "Maki Mix (klein)", "Maki mix (small)", 7.9, I.lunch, { allergens: ["D"] }),
      item("maki-mix-gross", "Maki Mix (gross)", "Maki mix (large)", 12.5, I.lunch, { allergens: ["D"] }),
      item("maki-salmon-sesame-8", "Lachs Sesam Maki (8 Stk.)", "Salmon sesame maki (8 pcs.)", 7.9, I.salmon, { allergens: ["D", "P"] }),
      item("maki-salmon-sesame-16", "Lachs Sesam Maki (16 Stk.)", "Salmon sesame maki (16 pcs.)", 13.9, I.salmon, { allergens: ["D", "P"] }),
      item(
        "maki-california-8",
        "California Maki (8 Stk.)",
        "California maki (8 pcs.)",
        10.9,
        I.salmon,
        { isBestseller: true, allergens: ["B", "C"] }
      ),
      item(
        "maki-california-temaki",
        "California Temaki (1 Stk.)",
        "California hand roll (1 pc.)",
        5.9,
        I.salmon,
        { allergens: ["B", "C"] }
      )
    ]
  },
  {
    id: "fried-noodles-rice",
    title: { en: "Fried Noodles & Rice", de: "Gebratene Nudeln & Reis" },
    items: [
      item("fnr-noodles-veg", "Gebratene Nudeln mit Gemüse", "Fried noodles with vegetables", 9.9, I.noodles, {
        vegetarian: true,
        allergens: ["A", "C"]
      }),
      item(
        "fnr-noodles-chicken",
        "Gebratene Nudeln mit Gemüse & Hühnerfleisch",
        "Fried noodles with vegetables & chicken",
        10.9,
        I.noodles,
        { allergens: ["A", "C"] }
      ),
      item(
        "fnr-noodles-crispy-chicken",
        "Gebratene Nudeln mit Gemüse & knusprigem Huhn",
        "Fried noodles with vegetables & crispy chicken",
        11.5,
        I.noodles,
        { allergens: ["A", "C"] }
      ),
      item(
        "fnr-noodles-duck",
        "Gebratene Nudeln mit Gemüse & Ente",
        "Fried noodles with vegetables & duck",
        11.9,
        I.noodles,
        { allergens: ["A", "C"] }
      ),
      item(
        "fnr-noodles-salmon",
        "Gebratene Nudeln mit Gemüse & Lachs",
        "Fried noodles with vegetables & salmon",
        11.9,
        I.noodles,
        { allergens: ["A", "C", "D"] }
      ),
      item("fnr-rice-veg", "Gebratener Eierreis mit Gemüse", "Egg fried rice with vegetables", 9.9, I.rice, {
        vegetarian: true,
        allergens: ["C"]
      }),
      item(
        "fnr-rice-chicken",
        "Gebratener Eierreis mit Gemüse & Hühnerfleisch",
        "Egg fried rice with vegetables & chicken",
        10.9,
        I.rice,
        { allergens: ["C"] }
      ),
      item(
        "fnr-rice-crispy-chicken",
        "Gebratener Eierreis mit Gemüse & knusprigem Huhn",
        "Egg fried rice with vegetables & crispy chicken",
        11.5,
        I.rice,
        { allergens: ["A", "C"] }
      ),
      item(
        "fnr-rice-duck",
        "Gebratener Eierreis mit Gemüse & Ente",
        "Egg fried rice with vegetables & duck",
        11.9,
        I.rice,
        { allergens: ["C"] }
      ),
      item(
        "fnr-rice-salmon",
        "Gebratener Eierreis mit Gemüse & Lachs",
        "Egg fried rice with vegetables & salmon",
        11.9,
        I.rice,
        { allergens: ["C", "D"] }
      )
    ]
  },
  {
    id: "udon-ramen",
    title: { en: "Udon & Ramen", de: "Udon & Ramen" },
    items: [
      item("udon-veg", "Udon Suppe mit Gemüse", "Udon soup with vegetables", 10.9, I.ramen, { vegetarian: true, vegan: true, allergens: ["A"] }),
      item("udon-chicken", "Udon Suppe mit Hühnerfleisch", "Udon soup with chicken", 11.9, I.ramen, { allergens: ["A"] }),
      item("udon-duck", "Udon Suppe mit Ente", "Udon soup with duck", 12.9, I.ramen, { allergens: ["A"] }),
      item("ramen-veg", "Ramen Suppe mit Gemüse", "Ramen soup with vegetables", 10.9, I.ramen, { vegetarian: true, vegan: true, allergens: ["A"] }),
      item("ramen-chicken", "Ramen Suppe mit Hühnerfleisch", "Ramen soup with chicken", 11.9, I.ramen, { allergens: ["A"] }),
      item("ramen-duck", "Ramen Suppe mit Ente", "Ramen soup with duck", 12.9, I.ramen, { allergens: ["A"] })
    ]
  },
  {
    id: "warm-dishes",
    title: { en: "Warm Dishes", de: "Warme Speisen" },
    items: [
      item("warm-wok-vegetables", "Wok Gemüse", "Wok vegetables", 10.9, I.wok, { vegetarian: true, vegan: true, allergens: ["F"] }),
      item("warm-red-curry-tofu", "Red Curry Tofu", "Red curry tofu", 11.5, I.tofu, { vegetarian: true, vegan: true, spicy: true, allergens: ["F"] }),
      item("warm-cashew-tofu", "Cashew Tofu", "Cashew tofu", 11.5, I.tofu, { vegetarian: true, vegan: true, allergens: ["F", "H"] }),
      item("warm-wok-chicken", "Wok Chicken", "Wok chicken", 10.9, I.chicken, { isBestseller: true, allergens: ["F"] }),
      item("warm-cashew-chicken", "Cashew Chicken", "Cashew chicken", 11.9, I.chicken, { allergens: ["H"] }),
      item("warm-basilikum-chicken", "Basilikum Chicken", "Basil chicken", 11.9, I.chicken, { spicy: true, allergens: ["F"] }),
      item("warm-red-curry-chicken", "Red Curry Chicken", "Red curry chicken", 11.9, I.chicken, { spicy: true, allergens: ["F"] }),
      item("warm-red-curry-duck", "Red Curry Duck", "Red curry duck", 12.9, I.duck, { spicy: true, allergens: ["F"] }),
      item("warm-wok-duck", "Wok Duck", "Wok duck", 12.9, I.duck, { allergens: ["F"] }),
      item("warm-lachs-teriyaki", "Lachs Teriyaki", "Salmon teriyaki", 12.9, I.salmon, { isBestseller: true, allergens: ["D", "F"] }),
      item("warm-red-curry-garnelen", "Red Curry Garnelen", "Red curry prawns", 15.9, I.shrimp, { spicy: true, allergens: ["B"] })
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
        13.9,
        I.bento,
        {
          description: { de: "Mit Miso Suppe, Salat, Obst, 2 Sushi & 3 Maki.", en: "With miso soup, salad, fruit, 2 sushi & 3 maki." },
          allergens: ["F"]
        }
      ),
      item(
        "bento-lachs",
        "Lachs Bento",
        "Salmon bento",
        13.9,
        I.bento,
        {
          isBestseller: true,
          description: { de: "Mit Miso Suppe, Salat, Obst, 2 Sushi & 3 Maki.", en: "With miso soup, salad, fruit, 2 sushi & 3 maki." },
          allergens: ["D"]
        }
      ),
      item(
        "bento-bulgogi",
        "Bulgogi Bento",
        "Bulgogi bento",
        14.9,
        I.bento,
        {
          description: { de: "Mit Miso Suppe, Salat, Obst, 2 Sushi & 3 Maki.", en: "With miso soup, salad, fruit, 2 sushi & 3 maki." },
          allergens: ["F"]
        }
      )
    ]
  },
  {
    id: "lunch",
    title: {
      en: "Lunch menu (Mon–Fri 11:00–15:00)\n(Starter: miso soup / sweet & sour soup / mini spring rolls)",
      de: "Mittagsmenü (Mo–Fr 11:00–15:00)\n(Vorspeise: Miso Suppe / Süßsauer Suppe / Mini Frühlingsrollen)"
    },
    items: [
      item("m1", "M1 Wok Gemüse", "M1 Wok vegetables", 9.9, I.wok, {
        description: lunchMenuDescription,
        lunchStarterChoice: LUNCH_STARTER_CHOICE,
        vegetarian: true,
        allergens: ["F"]
      }),
      item("m2", "M2 Red Curry Tofu", "M2 Red curry tofu", 10.9, I.tofu, {
        description: lunchMenuDescription,
        lunchStarterChoice: LUNCH_STARTER_CHOICE,
        vegetarian: true,
        vegan: true,
        spicy: true,
        allergens: ["F"]
      }),
      item("m3", "M3 Red Curry Chicken", "M3 Red curry chicken", 10.9, I.chicken, {
        description: lunchMenuDescription,
        lunchStarterChoice: LUNCH_STARTER_CHOICE,
        spicy: true,
        allergens: ["F"]
      }),
      item("m4", "M4 Basilikum Chicken", "M4 Basil chicken", 10.9, I.chicken, {
        description: lunchMenuDescription,
        lunchStarterChoice: LUNCH_STARTER_CHOICE,
        spicy: true,
        allergens: ["F"]
      }),
      item("m5", "M5 Wok Ente", "M5 Wok duck", 10.9, I.duck, {
        description: lunchMenuDescription,
        lunchStarterChoice: LUNCH_STARTER_CHOICE,
        allergens: ["F"]
      }),
      item("m6", "M6 Lachs Teriyaki", "M6 Salmon teriyaki", 10.9, I.salmon, {
        description: lunchMenuDescription,
        lunchStarterChoice: LUNCH_STARTER_CHOICE,
        allergens: ["D", "F"]
      }),
      item("m7", "M7 Gebratener Reis", "M7 Fried rice", 8.9, I.rice, {
        description: lunchMenuDescription,
        lunchStarterChoice: LUNCH_STARTER_CHOICE,
        allergens: ["C"]
      }),
      item("m8", "M8 Gebratene Nudeln mit Hühnerfleisch", "M8 Fried noodles with chicken", 9.5, I.noodles, {
        description: lunchMenuDescription,
        lunchStarterChoice: LUNCH_STARTER_CHOICE,
        allergens: ["A", "C"]
      }),
      item("m9", "M9 Eierreis mit Lachs", "M9 Egg fried rice with salmon", 9.9, I.rice, {
        description: lunchMenuDescription,
        lunchStarterChoice: LUNCH_STARTER_CHOICE,
        allergens: ["C", "D"]
      }),
      item("m10", "M10 Nudeln mit knusprigem Huhn", "M10 Noodles with crispy chicken", 9.9, I.noodles, {
        description: lunchMenuDescription,
        lunchStarterChoice: LUNCH_STARTER_CHOICE,
        allergens: ["A", "C"]
      }),
      item(
        "m11",
        "M11 Sushi Set klein",
        "M11 Small sushi set",
        10.9,
        I.lunch,
        {
          description: lunchMenuDescription,
          lunchStarterChoice: LUNCH_STARTER_CHOICE,
          isBestseller: true,
          allergens: ["D"]
        }
      ),
      item("m12", "M12 Maki Mix", "M12 Maki mix", 10.9, I.lunch, {
        description: lunchMenuDescription,
        lunchStarterChoice: LUNCH_STARTER_CHOICE,
        allergens: ["D"]
      })
    ]
  },
  {
    id: "sides-dessert",
    title: { en: "Side Dishes & Dessert", de: "Beilagen & Dessert" },
    items: [
      item("side-nudeln", "Gebratene Nudeln", "Fried noodles", 5.0, I.noodles, { allergens: ["A", "C"] }),
      item("side-eierreis", "Gebratener Reis", "Fried rice", 5.0, I.rice, { allergens: ["C"] }),
      item("side-jasmin-reis", "Jasmin Reis", "Jasmine rice", 2.5, I.rice, {}),
      item("side-sushi-reis", "Sushi Reis", "Sushi rice", 3.0, I.rice, {}),
      item("side-mochi-sesam", "Mochi Sesam (2 Stk.)", "Mochi sesame (2 pcs.)", 3.5, I.dessert, { vegetarian: true, allergens: ["G", "P"] }),
      item("side-mochi-peanut", "Mochi Peanut (2 Stk.)", "Mochi peanut (2 pcs.)", 3.5, I.dessert, { vegetarian: true, allergens: ["G", "E"] })
    ]
  },
  {
    id: "drinks",
    title: { en: "Drinks", de: "Getränke" },
    items: [
      item("drink-cola", "Cola", "Cola", 2.5, I.drink, { description: drinkDesc, vegan: true, vegetarian: true }),
      item("drink-cola-zero", "Cola Zero", "Cola Zero", 2.5, I.drink, { description: drinkDesc, vegan: true, vegetarian: true }),
      item("drink-almdudler", "Almdudler", "Almdudler", 2.5, I.drink, { description: drinkDesc, vegan: true, vegetarian: true }),
      item("drink-fanta", "Fanta", "Fanta", 2.5, I.drink, { description: drinkDesc, vegan: true, vegetarian: true }),
      item("drink-eistee-zitrone", "Rauch Eistee Zitrone", "Rauch iced tea lemon", 2.8, I.drink, {
        description: drinkDesc,
        vegan: true,
        vegetarian: true
      }),
      item("drink-eistee-pfirsich", "Rauch Eistee Pfirsich", "Rauch iced tea peach", 2.8, I.drink, {
        description: drinkDesc,
        vegan: true,
        vegetarian: true
      }),
      item("drink-roemer-still", "Römerquelle Still", "Römerquelle still", 2.8, I.drink, { description: drinkDesc, vegan: true, vegetarian: true }),
      item("drink-roemer-prickelnd", "Römerquelle Prickelnd", "Römerquelle sparkling", 2.8, I.drink, {
        description: drinkDesc,
        vegan: true,
        vegetarian: true
      }),
      item("drink-mango-saft", "Mango Saft", "Mango juice", 4.5, I.drink, { description: drinkDesc, vegan: true, vegetarian: true }),
      item("drink-lychee-saft", "Lychee Saft", "Lychee juice", 4.5, I.drink, { description: drinkDesc, vegan: true, vegetarian: true }),
      item("drink-apfel", "Apfelsaft", "Apple juice", 4.5, I.drink, { description: drinkDesc, vegan: true, vegetarian: true }),
      item("drink-aloe", "Aloe Vera", "Aloe vera", 4.5, I.drink, { description: drinkDesc, vegan: true, vegetarian: true }),
      item("drink-soda-zitrone", "Soda Zitrone", "Lemon soda", 3.9, I.drink, { description: drinkDesc, vegan: true, vegetarian: true }),
      item("drink-gruener-tee", "Grüner Tee", "Green tea", 4.5, I.drink, { description: drinkDesc, vegan: true, vegetarian: true }),
      item("drink-tsingtao", "Tsing Tao Bier", "Tsing Tao beer", 3.9, I.drink, { description: drinkDesc, vegetarian: true, allergens: ["A"] }),
      item("drink-ichiban-bier", "Ichiban Bier", "Ichiban beer", 3.9, I.drink, { description: drinkDesc, vegetarian: true, allergens: ["A"] }),
      item("drink-stiegl", "Stiegl Bier", "Stiegl beer", 3.5, I.drink, { description: drinkDesc, vegetarian: true, allergens: ["A"] }),
      item("drink-ottakringer", "Ottakringer Bier", "Ottakringer beer", 3.5, I.drink, { description: drinkDesc, vegetarian: true, allergens: ["A"] })
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
