"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MenuItem } from "@/lib/menu-types";
import { cartLineKey, itemRequiresLunchStarter, parseCartLineKey } from "@/lib/cart-line-key";
import { formatPriceEur, labelMenuItem } from "@/lib/menu-helpers";
import { getDiscountedPriceEur, getEffectivePriceEur } from "@/lib/menu-pricing";
import { useCart } from "@/context/cart-context";
import { useLanguage } from "@/context/language-context";
import { MenuAllergenChips } from "@/components/menu/menu-diet-allergen";
import { isMenuUploadedImageUrl } from "@/lib/dish-image";

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${className ?? ""}`}>
      {children}
    </span>
  );
}

const ADDED_HINT_MS = 2200;

/** Einheitliche Produkt-Tags (Chip-System inaktiv + dezentes Gold nur für Promo) */
const tagPromo = "border border-brand-line bg-brand-muted/60 text-brand-badge-ink";
const tagVegan = "border border-emerald-300 bg-emerald-100 text-emerald-800";
const tagVegetarian = "border border-green-200 bg-green-50 text-green-800";
const tagSpicy = "border border-red-200 bg-red-50 text-red-700";

export function OrderMenuItem({
  item,
  spotlight = false,
  starterGroupId = "default"
}: {
  item: MenuItem;
  spotlight?: boolean;
  starterGroupId?: string;
}) {
  const { language, t } = useLanguage();
  const { quantities, addOne, removeOne } = useCart();
  const L = labelMenuItem(item, language);
  const discountedPrice = getDiscountedPriceEur(item);
  const starterConfig = item.lunchStarterChoice;
  const needsStarter = itemRequiresLunchStarter(item);
  const orderChoiceGroup = item.orderChoiceGroup;
  const [orderChoiceId, setOrderChoiceId] = useState(orderChoiceGroup?.options?.[0]?.id ?? "");
  const firstStarterId = starterConfig?.options[0]?.id ?? "";
  const [starterId, setStarterId] = useState(firstStarterId);

  useEffect(() => {
    const opts = item.lunchStarterChoice?.options;
    if (!opts?.length) {
      setStarterId("");
      return;
    }
    setStarterId((cur) => (opts.some((o) => o.id === cur) ? cur : opts[0].id));
  }, [item.id, item.lunchStarterChoice?.options]);

  useEffect(() => {
    const opts = item.orderChoiceGroup?.options;
    if (!opts?.length) {
      setOrderChoiceId("");
      return;
    }
    setOrderChoiceId((cur) => (opts.some((o) => o.id === cur) ? cur : opts[0].id));
  }, [item.id, item.orderChoiceGroup?.options]);

  /** Warenkorb-Zeile nutzt gewählten Starter in der Key — UI-Radio sonst ≠ Key → Menge 0, Minus wirkungslos */
  useEffect(() => {
    for (const [k, v] of Object.entries(quantities)) {
      if (v <= 0) continue;
      const p = parseCartLineKey(k);
      if (p.itemId !== item.id) continue;
      if (p.orderChoiceId && item.orderChoiceGroup?.options?.some((o) => o.id === p.orderChoiceId)) {
        setOrderChoiceId(p.orderChoiceId);
      }
      if (!needsStarter || !p.starterOptionId) continue;
      const opts = item.lunchStarterChoice?.options;
      if (opts?.some((o) => o.id === p.starterOptionId)) {
        setStarterId(p.starterOptionId);
      }
    }
  }, [quantities, item.id, item.lunchStarterChoice?.options, item.orderChoiceGroup?.options, needsStarter]);

  const lineKey = useMemo(
    () =>
      cartLineKey(item.id, needsStarter ? starterId : null, {
        orderChoiceId
      }),
    [item.id, needsStarter, starterId, orderChoiceId]
  );

  const qty = quantities[lineKey] ?? 0;
  const isSoldOut = !!item.isSoldOut;
  const spicyLevel = item.spicyLevel ?? (item.spicy ? 1 : 0);
  const [showAddedHint, setShowAddedHint] = useState(false);
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    };
  }, []);

  const onAdd = () => {
    if (needsStarter && !starterId) return;
    if (orderChoiceGroup?.required && !orderChoiceId) return;
    addOne(item.id, {
      starterOptionId: needsStarter ? starterId : undefined,
      orderChoiceId: orderChoiceId || undefined
    });
    setShowAddedHint(true);
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    addedTimerRef.current = setTimeout(() => {
      setShowAddedHint(false);
      addedTimerRef.current = null;
    }, ADDED_HINT_MS);
  };

  const cardBorder = spotlight
    ? "border-brand-primary/20 ring-1 ring-brand-primary/12"
    : "border-brand-line";

  return (
    <article
      className={`flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border bg-brand-card shadow-[0_2px_12px_rgba(70,95,107,0.05),0_1px_3px_rgba(70,95,107,0.04)] transition duration-200 ${cardBorder} ${
        isSoldOut
          ? "opacity-60"
          : "hover:border-brand-primary/18 hover:shadow-[0_10px_28px_rgba(70,95,107,0.08),0_2px_8px_rgba(70,95,107,0.04)]"
      }`}
    >
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-brand-canvas sm:aspect-[16/10]">
        <Image
          src={item.image}
          alt={L.name}
          fill
          className="object-cover"
          sizes="(max-width: 1023px) 100vw, (max-width: 1520px) 46vw, 700px"
          unoptimized={isMenuUploadedImageUrl(item.image)}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-5">
        <div className="flex flex-wrap gap-1">
          {item.isNew && <Badge className={tagPromo}>{t.order.newBadge}</Badge>}
          {item.isBestseller && <Badge className={tagPromo}>{t.order.bestsellerBadge}</Badge>}
          {item.isSpecialDeal && (
            <Badge className={tagPromo}>{item.specialDealLabel?.trim() || "Aktion"}</Badge>
          )}
          {item.vegetarian && <Badge className={tagVegetarian}>{t.order.vegetarian}</Badge>}
          {item.vegan && <Badge className={tagVegan}>{t.order.vegan}</Badge>}
          {spicyLevel > 0 && (
            <Badge className={tagSpicy} aria-label={t.order.spicy}>
              {"🌶︎".repeat(spicyLevel)}
            </Badge>
          )}
          {isSoldOut && <Badge className="border border-brand-line bg-brand-canvas text-brand-subtle">{t.order.soldOut}</Badge>}
        </div>

        <h3 className="mt-1.5 font-serif text-lg font-bold leading-snug tracking-wide text-brand-ink sm:mt-2 sm:text-xl">{L.name}</h3>
        <p className="mt-0.5 line-clamp-2 text-sm leading-relaxed text-brand-body sm:mt-1 sm:text-base lg:line-clamp-3">{L.description}</p>

        <MenuAllergenChips item={item} className="mt-1.5 min-h-[1rem] sm:mt-2 sm:min-h-[1.25rem]" />

        {needsStarter && starterConfig && (
          <div className="mt-2 rounded-xl border border-brand-line bg-brand-canvas/80 px-2.5 py-2 sm:mt-3 sm:px-3 sm:py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-subtle">{starterConfig.label[language]}</p>
            <p className="mt-0.5 text-[11px] text-brand-body sm:mt-1 sm:text-xs">{t.order.lunchStarterHint}</p>
            <div className="mt-1.5 flex flex-col gap-1.5 sm:mt-2 sm:gap-2" role="radiogroup" aria-label={starterConfig.label[language]}>
              {starterConfig.options.map((opt) => (
                <label
                  key={opt.id}
                  className="flex cursor-pointer items-start gap-2 rounded-lg border border-brand-line bg-brand-card px-2 py-1 text-xs text-brand-ink transition hover:bg-brand-surface-hover has-[:checked]:border-brand-primary has-[:checked]:bg-brand-surface-hover sm:py-1.5 sm:text-sm"
                >
                  <input
                    type="radio"
                    className="accent-brand-primary mt-0.5 h-4 w-4 shrink-0"
                    name={`starter-${starterGroupId}-${item.id}`}
                    value={opt.id}
                    checked={starterId === opt.id}
                    onChange={() => setStarterId(opt.id)}
                  />
                  <span>{opt.name[language]}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {orderChoiceGroup?.options?.length ? (
          <div className="mt-2 rounded-xl border border-brand-line bg-brand-canvas/80 px-2.5 py-2 sm:mt-3 sm:px-3 sm:py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-subtle">
              {orderChoiceGroup.label[language]}
            </p>
            <div className="mt-1.5 flex flex-col gap-1.5 sm:mt-2 sm:gap-2" role="radiogroup" aria-label={orderChoiceGroup.label[language]}>
              {orderChoiceGroup.options.map((opt) => (
                <label
                  key={opt.id}
                  className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-brand-line bg-brand-card px-2 py-1 text-xs text-brand-ink transition hover:bg-brand-surface-hover has-[:checked]:border-brand-primary has-[:checked]:bg-brand-surface-hover sm:py-1.5 sm:text-sm"
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      className="accent-brand-primary h-4 w-4 shrink-0"
                      name={`choice-${starterGroupId}-${item.id}`}
                      value={opt.id}
                      checked={orderChoiceId === opt.id}
                      onChange={() => setOrderChoiceId(opt.id)}
                    />
                    {opt.name[language]}
                  </span>
                  {typeof opt.priceEur === "number" ? (
                    <span className="tabular-nums text-brand-subtle">{formatPriceEur(opt.priceEur, language)}</span>
                  ) : null}
                </label>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-auto border-t border-brand-line pt-3 sm:pt-4">
          <div className="flex items-center justify-between gap-2.5 sm:gap-3">
            <span className="shrink-0">
              {discountedPrice !== null ? (
                <span className="flex flex-col items-start">
                  <span className="text-sm tabular-nums text-brand-subtle line-through">
                    {formatPriceEur(item.priceEur, language)}
                  </span>
                  <span className="text-xl font-bold tabular-nums text-brand-price sm:text-2xl">
                    {formatPriceEur(getEffectivePriceEur(item, orderChoiceId || null), language)}
                  </span>
                </span>
              ) : (
                <span className="text-xl font-bold tabular-nums text-brand-price sm:text-2xl">
                  {formatPriceEur(getEffectivePriceEur(item, orderChoiceId || null), language)}
                </span>
              )}
            </span>
            <div className="flex shrink-0 items-center gap-0.5 rounded-full border-2 border-brand-line bg-brand-canvas p-0.5">
              <button
                type="button"
                onClick={() => removeOne(lineKey)}
                disabled={qty <= 0}
                className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-semibold text-brand-primary transition hover:bg-brand-surface-hover hover:text-brand-primary-dark disabled:opacity-30 sm:h-9 sm:w-9 sm:text-xl"
                aria-label="Decrease"
              >
                −
              </button>
              <span className="min-w-[1.75rem] text-center text-sm font-bold tabular-nums text-brand-ink sm:min-w-[2rem] sm:text-base">{qty}</span>
              <button
                type="button"
                onClick={onAdd}
                disabled={isSoldOut || (needsStarter && !starterId) || (!!orderChoiceGroup?.required && !orderChoiceId)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-semibold text-brand-primary transition hover:bg-brand-surface-hover hover:text-brand-primary-dark disabled:opacity-30 sm:h-9 sm:w-9 sm:text-xl"
                aria-label="Increase"
              >
                +
              </button>
            </div>
          </div>
          {showAddedHint && (
            <p className="mt-2 text-xs font-medium text-brand-success" role="status" aria-live="polite">
              {t.order.addedToCart}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
