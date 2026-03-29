"use client";

import Image from "next/image";
import type { MenuItem } from "@/lib/menu-types";
import { itemRequiresLunchStarter } from "@/lib/cart-line-key";
import { labelMenuItem } from "@/lib/menu-helpers";
import { useLanguage } from "@/context/language-context";
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
      className={`group overflow-hidden rounded-2xl border bg-brand-card shadow-[0_1px_3px_rgba(22,20,18,0.06)] transition-all duration-200 hover:border-brand-line-strong hover:shadow-[0_8px_24px_rgba(22,20,18,0.08)] ${
        spotlight ? "border-amber-400/40 ring-1 ring-amber-400/25" : "border-brand-line"
      }`}
    >
      <div className={`relative overflow-hidden sm:h-56 ${spotlight ? "h-56" : "h-52"}`}>
        <Image
          src={item.image}
          alt={L.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
          {item.isNew && <Badge className="border border-emerald-300/80 bg-white/95 text-emerald-900 shadow-sm">{t.order.newBadge}</Badge>}
          {item.isBestseller && (
            <Badge className="border border-amber-300/80 bg-white/95 text-amber-950 shadow-sm">{t.order.bestsellerBadge}</Badge>
          )}
        </div>
      </div>
      <div className="space-y-3 p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-serif text-lg font-semibold leading-snug tracking-wide text-brand-ink">{L.name}</h3>
          <span className="shrink-0 pt-0.5 text-base font-bold tabular-nums text-brand-price">{L.price}</span>
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
