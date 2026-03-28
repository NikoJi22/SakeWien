"use client";

import Link from "next/link";
import { MenuGrid } from "@/components/menu-grid";
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";
import { useLanguage } from "@/context/language-context";
import { menuCategories } from "@/lib/menu-data";

const pillClass =
  "inline-flex items-center justify-center rounded-full border border-white/[0.12] bg-black/35 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/88 transition hover:border-[#b8956a]/70 hover:bg-white/[0.05] hover:text-white";

export default function MenuPage() {
  const { t } = useLanguage();

  return (
    <div>
      <PageHeader title={t.page.menuTitle} subtitle={t.page.menuText} />
      <PageShell>
        <div className="mb-10 flex flex-wrap gap-3 sm:gap-4">
          <Link href="/menu/new" className={pillClass}>
            {t.page.newDishesTitle}
          </Link>
          <Link href="/menu/bestsellers" className={pillClass}>
            {t.page.bestsellersTitle}
          </Link>
        </div>
        <MenuGrid categories={menuCategories} />
      </PageShell>
    </div>
  );
}
