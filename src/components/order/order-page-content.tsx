"use client";

import { useMemo, useState } from "react";
import { useMenuData } from "@/context/menu-data-context";
import { useLanguage } from "@/context/language-context";
import { PageHeader } from "@/components/page-header";
import { CategoryNav } from "@/components/menu/category-nav";
import { MenuSection } from "@/components/menu/menu-section";
import { MenuAllergenLegend } from "@/components/menu/menu-allergen-legend";
import { MenuAttributeFilters } from "@/components/menu/menu-attribute-filters";
import { MenuHighlightSection } from "@/components/menu/menu-highlight-section";
import { OrderMenuItem } from "./order-menu-item";
import { OrderCheckout } from "./order-checkout";
import { OrderMobileBar } from "./order-mobile-bar";
import { OrderCartDrawer } from "./order-cart-drawer";
import { emptyMenuAttributeFilter, filterBestsellersAndNewSections, itemMatchesMenuFilters } from "@/lib/menu-filter";
import { MENU_NAV_BESTSELLERS, MENU_NAV_NEW } from "@/lib/menu-scroll";
import { categoryHasSushiExtras } from "@/lib/menu-sushi-order-categories";

/** Desktop: 2 Karten pro Zeile, gleiche Zeilenhöhe · Mobile/Tablet: 1 Spalte */
const orderMenuGridClass =
  "grid grid-cols-1 gap-3 sm:gap-5 md:gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-6 xl:gap-8";

export function OrderPageContent() {
  const { language, t } = useLanguage();
  const { categories, loading, error, bestsellers, newDishes } = useMenuData();
  const [filter, setFilter] = useState(emptyMenuAttributeFilter);

  const { filteredBestsellers, filteredNew } = useMemo(
    () => filterBestsellersAndNewSections(bestsellers, newDishes, filter),
    [bestsellers, newDishes, filter]
  );
  const filteredDeals = useMemo(
    () => categories.flatMap((c) => c.items).filter((i) => !!i.isSpecialDeal && itemMatchesMenuFilters(i, filter)),
    [categories, filter]
  );

  const withItems = useMemo(
    () =>
      categories
        .map((c) => ({
          ...c,
          items: c.items.filter((i) => itemMatchesMenuFilters(i, filter))
        }))
        .filter((c) => c.items.length > 0),
    [categories, filter]
  );
  const sushiLikeIds = useMemo(() => {
    const ids = new Set<string>();
    categories
      .filter((c) => categoryHasSushiExtras(c.id))
      .forEach((c) => c.items.forEach((i) => ids.add(i.id)));
    return ids;
  }, [categories]);

  const leadingNav = useMemo(() => {
    const items: { id: string; label: string }[] = [];
    if (filteredDeals.length > 0) items.push({ id: "special-deals", label: "Aktionen" });
    if (filteredBestsellers.length > 0) items.push({ id: MENU_NAV_BESTSELLERS, label: t.sections.bestsellers });
    if (filteredNew.length > 0) items.push({ id: MENU_NAV_NEW, label: t.sections.newDishes });
    return items;
  }, [filteredBestsellers, filteredDeals.length, filteredNew, t.sections.bestsellers, t.sections.newDishes]);

  const anyMenu =
    filteredDeals.length > 0 || filteredBestsellers.length > 0 || filteredNew.length > 0 || withItems.some((c) => c.items.length > 0);

  return (
    <div className="bg-brand-page pb-28 text-brand-ink lg:pb-12">
      <PageHeader variant="light" title={t.page.orderTitle} subtitle={t.page.orderText} />

      <div className="mx-auto w-full max-w-[min(100%,1520px)] px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 py-4 sm:py-5">
          <MenuAttributeFilters value={filter} onChange={setFilter} />
          <MenuAllergenLegend />
        </div>
        <CategoryNav categories={withItems} language={language} leadingItems={leadingNav} />

        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-10 lg:py-10">
          <div className="min-w-0 flex-1 space-y-10 py-6 sm:space-y-16 sm:py-10 lg:space-y-16 lg:py-0">
            {loading && <p className="text-sm text-brand-subtle">…</p>}
            {error && <p className="text-sm text-brand-danger">{error}</p>}
            {!loading && !error && !anyMenu && (
              <p className="text-sm text-brand-body">{t.menu.noDishesFilter}</p>
            )}
            {!loading && !error && anyMenu && (
              <>
                {filteredDeals.length > 0 && (
                  <MenuHighlightSection navId="special-deals" title="Aktionen" variant="warm">
                    <div className={orderMenuGridClass}>
                      {filteredDeals.map((item) => (
                        <OrderMenuItem
                          key={`spotlight-deal-${item.id}`}
                          item={item}
                          spotlight
                          starterGroupId="special-deals"
                          allowSushiExtras={sushiLikeIds.has(item.id)}
                        />
                      ))}
                    </div>
                  </MenuHighlightSection>
                )}
                {filteredBestsellers.length > 0 && (
                  <MenuHighlightSection navId={MENU_NAV_BESTSELLERS} title={t.sections.bestsellers} variant="amber">
                    <div className={orderMenuGridClass}>
                      {filteredBestsellers.map((item) => (
                        <OrderMenuItem
                          key={`spotlight-bs-${item.id}`}
                          item={item}
                          spotlight
                          starterGroupId="bestsellers"
                          allowSushiExtras={sushiLikeIds.has(item.id)}
                        />
                      ))}
                    </div>
                  </MenuHighlightSection>
                )}
                {filteredNew.length > 0 && (
                  <MenuHighlightSection navId={MENU_NAV_NEW} title={t.sections.newDishes} variant="warm">
                    <div className={orderMenuGridClass}>
                      {filteredNew.map((item) => (
                        <OrderMenuItem
                          key={`spotlight-nw-${item.id}`}
                          item={item}
                          spotlight
                          starterGroupId="new-dishes"
                          allowSushiExtras={sushiLikeIds.has(item.id)}
                        />
                      ))}
                    </div>
                  </MenuHighlightSection>
                )}
                {withItems.map((category) => (
                  <MenuSection key={category.id} categoryId={category.id} title={category.title[language]}>
                    <div className={orderMenuGridClass}>
                      {category.items.map((item) => (
                        <OrderMenuItem
                          key={`${category.id}-${item.id}`}
                          item={item}
                          starterGroupId={category.id}
                          allowSushiExtras={categoryHasSushiExtras(category.id)}
                        />
                      ))}
                    </div>
                  </MenuSection>
                ))}
              </>
            )}
          </div>

          <aside className="hidden min-h-0 w-full shrink-0 lg:sticky lg:top-24 lg:block lg:w-[400px] lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:overscroll-contain lg:self-start lg:border-l lg:border-brand-line lg:bg-brand-canvas/55 lg:pl-6 xl:w-[420px] xl:pl-8 lg:pt-10">
            <OrderCheckout variant="sidebar" />
          </aside>
        </div>
      </div>

      <OrderCartDrawer />
      <OrderMobileBar />
    </div>
  );
}
