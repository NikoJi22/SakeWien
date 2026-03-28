"use client";

import { DishCard } from "./dish-card";
import type { MenuCategory } from "@/lib/menu-data";
import { useLanguage } from "@/context/language-context";

export function MenuGrid({ categories }: { categories: MenuCategory[] }) {
  const { language } = useLanguage();

  return (
    <div className="space-y-14 sm:space-y-16">
      {categories
        .filter((category) => category.items.length > 0)
        .map((category) => (
        <section key={category.id} className="space-y-6">
          <h3 className="border-b border-white/[0.06] pb-3 font-serif text-xl font-light uppercase tracking-[0.14em] text-gold sm:text-2xl">
            {category.title[language]}
          </h3>
          <div className="grid gap-7 md:grid-cols-2 md:gap-8">
            {category.items.map((item) => (
              <DishCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
