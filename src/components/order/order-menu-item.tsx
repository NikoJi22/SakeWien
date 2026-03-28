"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { MenuItem } from "@/lib/menu-types";
import { labelMenuItem } from "@/lib/menu-helpers";
import { useCart } from "@/context/cart-context";
import { useLanguage } from "@/context/language-context";
import { MenuAllergenChips } from "@/components/menu/menu-diet-allergen";

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${className ?? ""}`}>
      {children}
    </span>
  );
}

const ADDED_HINT_MS = 2200;

export function OrderMenuItem({ item, spotlight = false }: { item: MenuItem; spotlight?: boolean }) {
  const { language, t } = useLanguage();
  const { quantities, addOne, removeOne } = useCart();
  const L = labelMenuItem(item, language);
  const qty = quantities[item.id] ?? 0;
  const [showAddedHint, setShowAddedHint] = useState(false);
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    };
  }, []);

  const onAdd = () => {
    addOne(item.id);
    setShowAddedHint(true);
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    addedTimerRef.current = setTimeout(() => {
      setShowAddedHint(false);
      addedTimerRef.current = null;
    }, ADDED_HINT_MS);
  };

  return (
    <article
      className={`flex gap-4 rounded-2xl border bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition hover:border-[#dddddd] hover:shadow-[0_6px_20px_rgba(0,0,0,0.07)] sm:gap-5 sm:p-5 ${
        spotlight ? "border-amber-300/50 ring-1 ring-amber-200/40" : "border-[#eeeeee]"
      }`}
    >
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl sm:h-32 sm:w-32">
        <Image src={item.image} alt={L.name} fill className="object-cover" sizes="128px" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
        <div>
          <div className="mb-1.5 flex flex-wrap gap-1.5">
            {item.isNew && (
              <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-900">
                {t.order.newBadge}
              </Badge>
            )}
            {item.isBestseller && (
              <Badge className="border border-amber-200 bg-amber-50 text-amber-900">
                {t.order.bestsellerBadge}
              </Badge>
            )}
            {item.vegetarian && (
              <Badge className="border border-lime-200 bg-lime-50 text-lime-900">
                {t.order.vegetarian}
              </Badge>
            )}
            {item.vegan && (
              <Badge className="border border-green-200 bg-green-50 text-green-900">
                {t.order.vegan}
              </Badge>
            )}
            {item.spicy && (
              <Badge className="border border-red-200 bg-red-50 text-red-900">
                {t.order.spicy}
              </Badge>
            )}
          </div>
          <h3 className="font-serif text-base font-semibold leading-snug text-brand-ink">{L.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-brand-body">{L.description}</p>
          <MenuAllergenChips item={item} className="mt-2" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-bold text-lg tabular-nums text-brand-price">{L.price}</span>
            <div className="flex items-center gap-1 rounded-full border border-[#ccc] bg-neutral-50 p-1">
              <button
                type="button"
                onClick={() => removeOne(item.id)}
                disabled={qty <= 0}
                className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-brand-ink-secondary transition hover:bg-white disabled:opacity-30"
                aria-label="Decrease"
              >
                −
              </button>
              <span className="min-w-[1.5rem] text-center text-sm font-bold tabular-nums text-brand-ink">{qty}</span>
              <button type="button" onClick={onAdd} className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-brand-ink-secondary transition hover:bg-white" aria-label="Increase">
                +
              </button>
            </div>
          </div>
          {showAddedHint && (
            <p className="text-xs font-medium text-brand-success" role="status" aria-live="polite">
              {t.order.addedToCart}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
