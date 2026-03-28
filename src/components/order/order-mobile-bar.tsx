"use client";

import { useLanguage } from "@/context/language-context";
import { useCart } from "@/context/cart-context";
import { useOrderCartDrawer } from "@/context/order-cart-drawer-context";
import { formatPriceEur } from "@/lib/menu-data";

export function OrderMobileBar() {
  const { language, t } = useLanguage();
  const { subtotalEur, itemCount } = useCart();
  const { open } = useOrderCartDrawer();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#080808]/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">{t.order.yourOrder}</p>
          <p className="mt-0.5 font-serif text-lg text-[#ebe3d6]">{formatPriceEur(subtotalEur, language)}</p>
          <p className="text-xs text-white/40">
            {itemCount} {t.order.itemsInCart}
          </p>
        </div>
        <button
          type="button"
          onClick={open}
          className="shrink-0 rounded-full border border-gold/80 bg-gold/15 px-5 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-gold transition hover:bg-gold/25"
        >
          {t.order.scrollToCheckout}
        </button>
      </div>
    </div>
  );
}
