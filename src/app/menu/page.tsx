"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CategoryNav } from "@/components/menu/category-nav";
import { MenuGrid } from "@/components/menu-grid";
import { MenuAllergenLegend } from "@/components/menu/menu-allergen-legend";
import { MenuAttributeFilters } from "@/components/menu/menu-attribute-filters";
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";
import { useMenuData } from "@/context/menu-data-context";
import { useLanguage } from "@/context/language-context";
import { emptyMenuAttributeFilter, filterBestsellersAndNewSections, itemMatchesMenuFilters } from "@/lib/menu-filter";
import { MENU_NAV_BESTSELLERS, MENU_NAV_NEW } from "@/lib/menu-scroll";
import { brandBtnSecondary } from "@/lib/brand-actions";

const pillClass = `inline-flex items-center justify-center rounded-full px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${brandBtnSecondary}`;

export default function MenuPage() {
  const { t, language } = useLanguage();
  const { categories, loading, error, bestsellers, newDishes } = useMenuData();
  const [filter, setFilter] = useState(emptyMenuAttributeFilter);

  const leadingNav = useMemo(() => {
    const { filteredBestsellers, filteredNew } = filterBestsellersAndNewSections(bestsellers, newDishes, filter);
    const items: { id: string; label: string }[] = [];
    if (filteredBestsellers.length > 0) items.push({ id: MENU_NAV_BESTSELLERS, label: t.sections.bestsellers });
    if (filteredNew.length > 0) items.push({ id: MENU_NAV_NEW, label: t.sections.newDishes });
    return items;
  }, [bestsellers, newDishes, filter, t.sections.bestsellers, t.sections.newDishes]);

  const navCategories = useMemo(
    () => categories.filter((c) => c.items.some((i) => itemMatchesMenuFilters(i, filter))),
    [categories, filter]
  );

  return (
    <div className="bg-brand-page text-brand-ink">
      <PageHeader variant="light" title={t.page.menuTitle} subtitle={t.page.menuText} />
      <PageShell className="!pt-4 pb-14 sm:!pt-5 sm:pb-16 lg:pb-20">
        <div className="mb-4 flex flex-wrap gap-3 sm:mb-5 sm:gap-4">
          <Link href="/menu/new" className={pillClass}>
            {t.page.newDishesTitle}
          </Link>
          <Link href="/menu/bestsellers" className={pillClass}>
            {t.page.bestsellersTitle}
          </Link>
        </div>
        <div className="mb-6 space-y-4 sm:mb-8">
          <MenuAttributeFilters value={filter} onChange={setFilter} />
          <MenuAllergenLegend />
        </div>
        {loading && <p className="text-sm text-brand-subtle">…</p>}
        {error && <p className="text-sm text-brand-danger">{error}</p>}
        {!loading && !error && (
          <>
            <CategoryNav categories={navCategories} language={language} leadingItems={leadingNav} />
            <div className="mt-8 sm:mt-10">
              <MenuGrid categories={categories} filter={filter} />
            </div>
          </>
        )}
      </PageShell>
    </div>
  );
}
