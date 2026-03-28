"use client";

import { useMemo } from "react";
import type { MenuCategory } from "@/lib/menu-types";
import { useLanguage } from "@/context/language-context";
import { useMenuData } from "@/context/menu-data-context";
import type { MenuAttributeFilter } from "@/lib/menu-filter";
import { filterBestsellersAndNewSections, itemMatchesMenuFilters } from "@/lib/menu-filter";
import { MENU_NAV_BESTSELLERS, MENU_NAV_NEW } from "@/lib/menu-scroll";
import { MenuSection } from "./menu/menu-section";
import { MenuItemCard } from "./menu/menu-item-card";
import { MenuHighlightSection } from "./menu/menu-highlight-section";

type Props = {
  categories: MenuCategory[];
  filter: MenuAttributeFilter;
};

export function MenuGrid({ categories, filter }: Props) {
  const { language, t } = useLanguage();
  const { bestsellers, newDishes } = useMenuData();

  const { filteredBestsellers, filteredNew } = useMemo(
    () => filterBestsellersAndNewSections(bestsellers, newDishes, filter),
    [bestsellers, newDishes, filter]
  );

  const filteredCategories = useMemo(
    () =>
      categories
        .map((c) => ({
          ...c,
          items: c.items.filter((i) => itemMatchesMenuFilters(i, filter))
        }))
        .filter((c) => c.items.length > 0),
    [categories, filter]
  );

  const anyContent =
    filteredBestsellers.length > 0 || filteredNew.length > 0 || filteredCategories.some((c) => c.items.length > 0);

  if (!anyContent) {
    return <p className="text-sm text-brand-body">{t.menu.noDishesFilter}</p>;
  }

  return (
    <div className="space-y-14 sm:space-y-16">
      {filteredBestsellers.length > 0 && (
        <MenuHighlightSection navId={MENU_NAV_BESTSELLERS} title={t.sections.bestsellers} variant="amber">
          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            {filteredBestsellers.map((item) => (
              <MenuItemCard key={item.id} item={item} variant="spotlight" />
            ))}
          </div>
        </MenuHighlightSection>
      )}
      {filteredNew.length > 0 && (
        <MenuHighlightSection navId={MENU_NAV_NEW} title={t.sections.newDishes} variant="emerald">
          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            {filteredNew.map((item) => (
              <MenuItemCard key={item.id} item={item} variant="spotlight" />
            ))}
          </div>
        </MenuHighlightSection>
      )}
      {filteredCategories.map((category) => (
        <MenuSection key={category.id} categoryId={category.id} title={category.title[language]}>
          <div className="grid gap-8 md:grid-cols-2 md:gap-10">
            {category.items.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        </MenuSection>
      ))}
    </div>
  );
}
