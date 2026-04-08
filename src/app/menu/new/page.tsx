"use client";

import { DishCard } from "@/components/dish-card";
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";
import { useMenuData } from "@/context/menu-data-context";
import { useLanguage } from "@/context/language-context";

export default function NewDishesPage() {
  const { t } = useLanguage();
  const { newDishes, loading, error } = useMenuData();

  return (
    <div>
      <PageHeader title={t.page.newDishesTitle} subtitle={t.page.newDishesText} />
      <PageShell>
        {loading && <p className="text-sm text-brand-subtle">…</p>}
        {error && <p className="text-sm text-brand-danger">{error}</p>}
        {!loading && !error && newDishes.length === 0 && (
          <p className="text-sm text-brand-body">No new dishes at the moment.</p>
        )}
        {!loading && !error && newDishes.length > 0 && (
          <div className="grid gap-9 md:grid-cols-2 md:gap-10 lg:grid-cols-3 lg:gap-11">
            {newDishes.map((dish) => (
              <DishCard key={dish.id} item={dish} />
            ))}
          </div>
        )}
      </PageShell>
    </div>
  );
}
