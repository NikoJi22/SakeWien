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

export type OrderChoiceOption = {
  id: string;
  name: { en: string; de: string };
  /** Optional absolute price override for this option. */
  priceEur?: number;
  /** Optional surcharge added to item base price (legacy options without this remain 0 surcharge). */
  extraPriceEur?: number;
};

export type OrderChoiceGroup = {
  label: { en: string; de: string };
  required?: boolean;
  /** "absolute" = option defines final base price; "surcharge" = option adds extraPriceEur to item base price. */
  priceMode?: "absolute" | "surcharge";
  /** Optional default selected option id (useful when one side is included, alternatives cost extra). */
  defaultOptionId?: string;
  options: OrderChoiceOption[];
};

export type MenuItemVariant = {
  id: string;
  label: { en: string; de: string };
  priceEur: number;
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
  /** Optional product variants/sizes. If present, ordering requires selecting one variant. */
  variants?: MenuItemVariant[];
  image: string;
  /** EU/AT-style allergen codes, e.g. ["A","G","D"] */
  allergens?: string[];
  lunchStarterChoice?: LunchStarterChoice;
  orderChoiceGroup?: OrderChoiceGroup;
} & MenuItemFlags;

export type MenuCategory = {
  id: string;
  title: { en: string; de: string };
  items: MenuItem[];
};

export type GiftConfig = {
  /** @deprecated Nur für Migration alter JSON-Daten; nicht mehr im Admin bearbeitet. */
  thresholdEur?: number;
  message: { en: string; de: string };
  /** Menu item ids that can be chosen as free gifts in checkout. */
  freeItemIds: string[];
  /** Untere Schwelle (EUR): ab diesem Warenkorb-Zwischensumme-Wert gilt `tier1GiftCount`. */
  tier1ThresholdEur: number;
  tier1GiftCount: number;
  /** Obere Schwelle (EUR): ab diesem Wert gilt `tier2GiftCount` (ersetzt die niedrigere Stufe). */
  tier2ThresholdEur: number;
  tier2GiftCount: number;
};

export type SiteContentConfig = {
  hero: {
    title: { en: string; de: string };
    mainImage: string;
  };
  ordering: {
    vacationMode: {
      active: boolean;
      /** YYYY-MM-DD */
      startDate: string;
      /** YYYY-MM-DD */
      endDate: string;
    };
  };
  cards: {
    order: { label: { en: string; de: string }; image: string };
    reservation: { label: { en: string; de: string }; image: string };
    about: { label: { en: string; de: string }; image: string };
  };
};

export type OrderCutleryType = "chopsticks" | "woodSpoon" | "woodFork";
