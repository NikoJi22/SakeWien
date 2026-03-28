"use client";

import { useLanguage } from "@/context/language-context";
import { useCart } from "@/context/cart-context";
import { useOrderCartDrawer } from "@/context/order-cart-drawer-context";
import { formatPriceEur } from "@/lib/menu-helpers";

export function OrderMobileBar() {
  const { language, t } = useLanguage();
  const { subtotalEur, itemCount } = useCart();
  const { open } = useOrderCartDrawer();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-brand-line bg-brand-card px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(22,20,18,0.08)] lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-subtle">{t.order.yourOrder}</p>
          <p className="mt-0.5 font-serif text-lg font-semibold tabular-nums text-brand-ink">{formatPriceEur(subtotalEur, language)}</p>
          <p className="text-xs text-brand-body">
            {itemCount} {t.order.itemsInCart}
          </p>
        </div>
        <button
          type="button"
          onClick={open}
          className="shrink-0 rounded-full bg-brand-accent px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white shadow-md shadow-brand-accent/15 transition hover:bg-brand-accent-hover"
        >
          {t.order.openCart}
        </button>
      </div>
    </div>
  );
}
