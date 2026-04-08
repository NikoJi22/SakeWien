"use client";

import Image from "next/image";
import type { MenuItem } from "@/lib/menu-types";
import { itemRequiresLunchStarter } from "@/lib/cart-line-key";
import { labelMenuItem } from "@/lib/menu-helpers";
import { useLanguage } from "@/context/language-context";
import { isMenuUploadedImageUrl } from "@/lib/dish-image";
import { MenuAllergenChips, MenuDietBadges } from "./menu-diet-allergen";

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${className}`}>{children}</span>;
}

type Props = {
  item: MenuItem;
  /** Stronger frame when shown in bestseller / new spotlight */
  variant?: "default" | "spotlight";
};

export function MenuItemCard({ item, variant = "default" }: Props) {
  const { language, t } = useLanguage();
  const L = labelMenuItem(item, language);
  const spotlight = variant === "spotlight";

  return (
    <article
      className={`group overflow-hidden rounded-2xl border bg-brand-card shadow-[0_2px_12px_rgba(70,95,107,0.055),0_1px_3px_rgba(70,95,107,0.04)] transition-all duration-200 hover:border-brand-primary/12 hover:shadow-[0_10px_28px_rgba(70,95,107,0.09),0_2px_8px_rgba(70,95,107,0.045)] ${
        spotlight ? "border-brand-primary/22 ring-1 ring-brand-primary/10" : "border-brand-primary/[0.07]"
      }`}
    >
      <div className={`relative overflow-hidden sm:h-56 ${spotlight ? "h-56" : "h-52"}`}>
        <Image
          src={item.image}
          alt={L.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 50vw"
          unoptimized={isMenuUploadedImageUrl(item.image)}
        />
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
          {item.isNew && <Badge className="border border-brand-line bg-brand-muted text-brand-badge-ink shadow-sm">{t.order.newBadge}</Badge>}
          {item.isBestseller && (
            <Badge className="border border-brand-line bg-brand-muted text-brand-badge-ink shadow-sm">{t.order.bestsellerBadge}</Badge>
          )}
        </div>
      </div>
      <div className="space-y-3 p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-serif text-lg font-bold leading-snug tracking-wide text-brand-ink">{L.name}</h3>
          <span className="shrink-0 pt-0.5 text-lg font-bold tabular-nums leading-none text-brand-price sm:text-xl">{L.price}</span>
        </div>
        <MenuDietBadges item={item} />
        <p className="text-sm leading-relaxed text-brand-body">{L.description}</p>
        {itemRequiresLunchStarter(item) && item.lunchStarterChoice && (
          <p className="text-xs leading-relaxed text-brand-subtle">
            {item.lunchStarterChoice.label[language]}:{" "}
            {item.lunchStarterChoice.options.map((o) => o.name[language]).join(" · ")}
          </p>
        )}
        <MenuAllergenChips item={item} className="pt-1" />
      </div>
    </article>
  );
}
