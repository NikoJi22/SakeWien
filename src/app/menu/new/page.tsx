"use client";

import { DishCard } from "@/components/dish-card";
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";
import { useLanguage } from "@/context/language-context";
import { newDishes } from "@/lib/menu-data";

export default function NewDishesPage() {
  const { t } = useLanguage();

  return (
    <div>
      <PageHeader title={t.page.newDishesTitle} subtitle={t.page.newDishesText} />
      <PageShell>
        <div className="grid gap-7 md:grid-cols-2 md:gap-8 lg:grid-cols-3 lg:gap-9">
          {newDishes.map((dish) => (
            <DishCard key={dish.id} item={dish} />
          ))}
        </div>
      </PageShell>
    </div>
  );
}
