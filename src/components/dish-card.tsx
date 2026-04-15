"use client";

import Image from "next/image";
import type { MenuItem } from "@/lib/menu-types";
import { formatPriceEur, labelMenuItem } from "@/lib/menu-helpers";
import { useLanguage } from "@/context/language-context";
import { MenuAllergenChips, MenuDietBadges } from "@/components/menu/menu-diet-allergen";
import { isMenuUploadedImageUrl } from "@/lib/dish-image";
import { getDiscountedPriceEur } from "@/lib/menu-pricing";

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.15em] ${className}`}>{children}</span>;
}

export function DishCard({ item }: { item: MenuItem }) {
  const { language, t } = useLanguage();
  const L = labelMenuItem(item, language);
  const discountedPrice = getDiscountedPriceEur(item);

  return (
    <article className="group overflow-hidden rounded-2xl border border-brand-primary/[0.07] bg-brand-card shadow-[0_2px_12px_rgba(70,95,107,0.055),0_1px_3px_rgba(70,95,107,0.04)] transition-shadow duration-300 hover:border-brand-primary/12 hover:shadow-[0_10px_28px_rgba(70,95,107,0.09),0_2px_8px_rgba(70,95,107,0.045)]">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={item.image}
          alt={L.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          unoptimized={isMenuUploadedImageUrl(item.image)}
        />
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
          {item.isNew && (
            <Badge className="border border-brand-line bg-brand-muted text-brand-badge-ink shadow-sm">{t.order.newBadge}</Badge>
          )}
          {item.isBestseller && (
            <Badge className="border border-brand-line bg-brand-muted text-brand-badge-ink shadow-sm">{t.order.bestsellerBadge}</Badge>
          )}
        </div>
      </div>
      <div className="space-y-2.5 p-6 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-xl font-bold tracking-wide text-brand-ink sm:text-[1.4rem]">{L.name}</h3>
          <span className="shrink-0 pt-0.5 tabular-nums leading-none">
            {discountedPrice !== null ? (
              <span className="flex flex-col items-end">
                <span className="text-sm text-brand-subtle line-through">{L.price}</span>
                <span className="text-xl font-bold text-brand-price sm:text-2xl">
                  {formatPriceEur(discountedPrice, language)}
                </span>
              </span>
            ) : (
              <span className="text-xl font-bold text-brand-price sm:text-2xl">{L.price}</span>
            )}
          </span>
        </div>
        <MenuDietBadges item={item} />
        <p className="text-base leading-relaxed text-brand-body sm:text-[1.05rem]">{L.description}</p>
        <MenuAllergenChips item={item} />
      </div>
    </article>
  );
}
