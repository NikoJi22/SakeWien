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
    <div className="fixed inset-0 z-[110] overflow-x-hidden touch-pan-y lg:hidden" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(70,95,107,0.22)]"
        aria-label="Close"
        onClick={close}
      />
      <div
        className="absolute bottom-0 left-0 right-0 flex max-h-[min(92dvh,920px)] flex-col overflow-x-hidden rounded-t-[1.25rem] border border-brand-line border-b-0 bg-brand-card shadow-[0_-12px_48px_rgba(31,35,38,0.08)] touch-pan-y"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-brand-line bg-brand-canvas/70 px-4 py-4 pt-5 sm:px-6">
          <h2 id={titleId} className="font-serif text-xl font-bold tracking-wide text-brand-ink sm:text-2xl">
            {t.order.yourOrder}
          </h2>
          <button
            type="button"
            onClick={close}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-line bg-brand-card text-brand-primary transition hover:border-brand-line hover:bg-brand-surface-hover hover:text-brand-primary-dark"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 touch-pan-y sm:px-5">
          <OrderCheckout variant="drawer" />
        </div>
      </div>
    </div>
  );
}
