export type MenuItemFlags = {
  isNew?: boolean;
  isBestseller?: boolean;
  isSpecialDeal?: boolean;
  specialDealLabel?: string;
  isSoldOut?: boolean;
  vegetarian?: boolean;
  vegan?: boolean;
  spicy?: boolean;
  spicyLevel?: 0 | 1 | 2;
};

export type LunchStarterOption = {
  id: string;
  name: { en: string; de: string };
};

/** Mittagsmenü: Kunde wählt beim Bestellen eine Vorspeise (z. B. Miso, Süßsauer, Frühlingsrollen). */
export type LunchStarterChoice = {
  label: { en: string; de: string };
  options: LunchStarterOption[];
};

export type MenuItem = {
  id: string;
  name: { en: string; de: string };
  description: { en: string; de: string };
  priceEur: number;
  image: string;
  /** EU/AT-style allergen codes, e.g. ["A","G","D"] */
  allergens?: string[];
  lunchStarterChoice?: LunchStarterChoice;
} & MenuItemFlags;

export type MenuCategory = {
  id: string;
  title: { en: string; de: string };
  items: MenuItem[];
};

export type GiftConfig = {
  thresholdEur: number;
  message: { en: string; de: string };
};

export type OrderCutleryType = "chopsticks" | "wooden";
