"use client";

import { DishCard } from "@/components/dish-card";
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";
import { useLanguage } from "@/context/language-context";
import { bestsellers } from "@/lib/menu-data";

export default function BestsellersPage() {
  const { t } = useLanguage();

  return (
    <div>
      <PageHeader title={t.page.bestsellersTitle} subtitle={t.page.bestsellersText} />
      <PageShell>
        <div className="grid gap-7 md:grid-cols-2 md:gap-8 lg:grid-cols-3 lg:gap-9">
          {bestsellers.map((dish) => (
            <DishCard key={dish.id} item={dish} />
          ))}
        </div>
      </PageShell>
    </div>
  );
}
