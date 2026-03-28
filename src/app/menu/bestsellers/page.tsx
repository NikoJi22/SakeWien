"use client";

import { DishCard } from "@/components/dish-card";
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";
import { useMenuData } from "@/context/menu-data-context";
import { useLanguage } from "@/context/language-context";

export default function BestsellersPage() {
  const { t } = useLanguage();
  const { bestsellers, loading, error } = useMenuData();

  return (
    <div>
      <PageHeader title={t.page.bestsellersTitle} subtitle={t.page.bestsellersText} />
      <PageShell>
        {loading && <p className="text-sm text-brand-subtle">…</p>}
        {error && <p className="text-sm text-brand-danger">{error}</p>}
        {!loading && !error && bestsellers.length === 0 && (
          <p className="text-sm text-brand-body">No bestsellers listed.</p>
        )}
        {!loading && !error && bestsellers.length > 0 && (
          <div className="grid gap-7 md:grid-cols-2 md:gap-8 lg:grid-cols-3 lg:gap-9">
            {bestsellers.map((dish) => (
              <DishCard key={dish.id} item={dish} />
            ))}
          </div>
        )}
      </PageShell>
    </div>
  );
}
