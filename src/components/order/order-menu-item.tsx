"use client";

import Image from "next/image";
import type { MenuItem } from "@/lib/menu-data";
import { labelMenuItem } from "@/lib/menu-data";
import { useCart } from "@/context/cart-context";
import { useLanguage } from "@/context/language-context";

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${className ?? ""}`}>
      {children}
    </span>
  );
}

export function OrderMenuItem({ item }: { item: MenuItem }) {
  const { language, t } = useLanguage();
  const { quantities, addOne, removeOne } = useCart();
  const L = labelMenuItem(item, language);
  const qty = quantities[item.id] ?? 0;

  return (
    <article className="flex gap-4 rounded-2xl border border-white/[0.08] bg-[#0f0f0f] p-3 sm:p-4">
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl sm:h-32 sm:w-32">
        <Image src={item.image} alt={L.name} fill className="object-cover" sizes="128px" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <div>
          <div className="mb-1.5 flex flex-wrap gap-1.5">
            {item.isNew && <Badge className="bg-emerald-900/80 text-emerald-200">{t.order.newBadge}</Badge>}
            {item.isBestseller && <Badge className="bg-amber-900/70 text-amber-100">{t.order.bestsellerBadge}</Badge>}
            {item.vegetarian && <Badge className="bg-lime-900/50 text-lime-100">{t.order.vegetarian}</Badge>}
            {item.vegan && <Badge className="bg-green-900/50 text-green-100">{t.order.vegan}</Badge>}
            {item.spicy && <Badge className="bg-red-900/60 text-red-100">{t.order.spicy}</Badge>}
          </div>
          <h3 className="font-serif text-base font-light leading-snug tracking-[0.02em] text-[#ebe3d6]">{L.name}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-white/60 sm:text-sm">{L.description}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-serif text-lg text-gold">{L.price}</span>
          <div className="flex items-center gap-1 rounded-full border border-white/15 bg-black/40 p-1">
            <button
              type="button"
              onClick={() => removeOne(item.id)}
              disabled={qty <= 0}
              className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-white transition hover:bg-white/10 disabled:opacity-30"
              aria-label="Decrease"
            >
              −
            </button>
            <span className="min-w-[1.5rem] text-center text-sm font-semibold tabular-nums">{qty}</span>
            <button
              type="button"
              onClick={() => addOne(item.id)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-white transition hover:bg-white/10"
              aria-label="Increase"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
