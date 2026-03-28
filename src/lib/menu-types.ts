export type MenuItemFlags = {
  isNew?: boolean;
  isBestseller?: boolean;
  vegetarian?: boolean;
  vegan?: boolean;
  spicy?: boolean;
};

export type MenuItem = {
  id: string;
  name: { en: string; de: string };
  description: { en: string; de: string };
  priceEur: number;
  image: string;
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
