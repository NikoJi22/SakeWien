"use client";

import { useEffect, useId } from "react";
import { useLanguage } from "@/context/language-context";
import { useOrderCartDrawer } from "@/context/order-cart-drawer-context";
import { OrderCheckout } from "./order-checkout";

export function OrderCartDrawer() {
  const { isOpen, close } = useOrderCartDrawer();
  const { t } = useLanguage();
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] lg:hidden" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close"
        onClick={close}
      />
      <div
        className="absolute bottom-0 left-0 right-0 flex max-h-[min(92dvh,920px)] flex-col rounded-t-[1.25rem] border border-white/[0.12] border-b-0 bg-[#080808] shadow-[0_-12px_48px_rgba(0,0,0,0.55)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3 pt-4 sm:px-6">
          <p id={titleId} className="font-serif text-lg tracking-wide text-[#ebe3d6]">
            {t.order.yourOrder}
          </p>
          <button
            type="button"
            onClick={close}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 sm:px-5">
          <OrderCheckout variant="drawer" />
        </div>
      </div>
    </div>
  );
}
