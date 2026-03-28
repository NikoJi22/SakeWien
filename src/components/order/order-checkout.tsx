"use client";

import { FormEvent, useState } from "react";
import { orderGiftConfig } from "@/config/order-gift";
import { useCart } from "@/context/cart-context";
import { useOrderCartDrawer } from "@/context/order-cart-drawer-context";
import { useLanguage } from "@/context/language-context";
import { formatPriceEur, labelMenuItem } from "@/lib/menu-data";

type OrderCheckoutProps = {
  /** Sidebar: full card with anchor id. Drawer: compact, no duplicate title (drawer shell provides header). */
  variant?: "sidebar" | "drawer";
};

export function OrderCheckout({ variant = "sidebar" }: OrderCheckoutProps) {
  const { language, t } = useLanguage();
  const { lines, subtotalEur, itemCount, clear } = useCart();
  const { close: closeCartDrawer } = useOrderCartDrawer();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");

  const giftUnlocked = subtotalEur >= orderGiftConfig.thresholdEur;
  const giftMessage = orderGiftConfig.message[language];

  const isDrawer = variant === "drawer";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lines.length === 0) return;
    setStatus("loading");
    const fd = new FormData(e.currentTarget);
    const payload = {
      fulfillment,
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      address: fulfillment === "delivery" ? String(fd.get("address") ?? "") : "",
      pickupTime: fulfillment === "pickup" ? String(fd.get("pickupTime") ?? "") : "",
      deliveryTime: fulfillment === "delivery" ? String(fd.get("deliveryTime") ?? "") : "",
      paymentMethod: fulfillment === "delivery" ? String(fd.get("paymentMethod") ?? "") : "",
      comment: String(fd.get("comment") ?? ""),
      language,
      subtotalEur,
      giftEligible: giftUnlocked,
      giftMessage: giftUnlocked ? giftMessage : "",
      lines: lines.map(({ item, quantity }) => ({
        id: item.id,
        name: item.name[language],
        quantity,
        unitPriceEur: item.priceEur,
        lineTotalEur: item.priceEur * quantity
      }))
    };

    const res = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setStatus("success");
      clear();
      e.currentTarget.reset();
      if (variant === "drawer") closeCartDrawer();
    } else {
      setStatus("error");
    }
  }

  const inputClass =
    "w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-gold";

  return (
    <div
      id={isDrawer ? undefined : "order-checkout"}
      className={`flex flex-col ${
        isDrawer
          ? "rounded-b-2xl border-0 bg-transparent shadow-none"
          : "rounded-2xl border border-white/[0.1] bg-[#0c0c0c] shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
      }`}
    >
      {!isDrawer && (
        <div className="border-b border-white/10 p-5 sm:p-6">
          <h2 className="font-serif text-2xl tracking-wide text-[#ebe3d6]">{t.order.yourOrder}</h2>
          <p className="mt-1 text-sm text-white/50">
            {itemCount} {t.order.itemsInCart} · {formatPriceEur(subtotalEur, language)}
          </p>
        </div>
      )}

      {isDrawer && (
        <div className="border-b border-white/10 px-1 pb-4 pt-1 sm:px-2">
          <p className="text-sm text-white/50">
            {itemCount} {t.order.itemsInCart} · {formatPriceEur(subtotalEur, language)}
          </p>
        </div>
      )}

      <div className="border-b border-white/10 p-5 sm:p-6">
        {lines.length === 0 ? (
          <p className="text-sm text-white/50">{t.order.emptyCart}</p>
        ) : (
          <ul className="space-y-4">
            {lines.map(({ item, quantity }) => {
              const L = labelMenuItem(item, language);
              return (
                <li key={item.id} className="flex justify-between gap-3 text-sm">
                  <span className="text-white/90">
                    <span className="font-medium">{L.name}</span>
                    <span className="text-white/45"> × {quantity}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-gold">{formatPriceEur(item.priceEur * quantity, language)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="space-y-2 border-b border-white/10 bg-black/20 px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">{t.order.subtotal}</span>
          <span className="font-semibold tabular-nums text-white">{formatPriceEur(subtotalEur, language)}</span>
        </div>
        {giftUnlocked ? (
          <div className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-[#e8dcc8]">
            <p className="font-semibold uppercase tracking-wide text-gold">{t.order.giftUnlocked}</p>
            <p className="mt-1 text-white/85">{giftMessage}</p>
          </div>
        ) : (
          <p className="text-xs text-white/40">{t.order.giftHint}</p>
        )}
      </div>

      <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">{t.order.fulfillment}</p>
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 p-1">
            <button
              type="button"
              onClick={() => setFulfillment("pickup")}
              className={`rounded-lg py-2.5 text-xs font-semibold uppercase tracking-wider transition sm:text-sm ${
                fulfillment === "pickup" ? "bg-gold text-black" : "text-white/70 hover:text-white"
              }`}
            >
              {t.form.pickup}
            </button>
            <button
              type="button"
              onClick={() => setFulfillment("delivery")}
              className={`rounded-lg py-2.5 text-xs font-semibold uppercase tracking-wider transition sm:text-sm ${
                fulfillment === "delivery" ? "bg-gold text-black" : "text-white/70 hover:text-white"
              }`}
            >
              {t.form.delivery}
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-xs text-white/70">
            <span>{t.form.fullName}</span>
            <input name="name" required className={inputClass} autoComplete="name" />
          </label>
          <label className="flex flex-col gap-1.5 text-xs text-white/70">
            <span>{t.form.phone}</span>
            <input name="phone" type="tel" required className={inputClass} autoComplete="tel" />
          </label>
          <label className="flex flex-col gap-1.5 text-xs text-white/70 sm:col-span-2">
            <span>{t.order.emailOptional}</span>
            <input name="email" type="email" className={inputClass} autoComplete="email" />
          </label>
        </div>

        {fulfillment === "pickup" ? (
          <label className="flex flex-col gap-1.5 text-xs text-white/70">
            <span>{t.order.pickupTime}</span>
            <input name="pickupTime" type="datetime-local" required className={inputClass} />
          </label>
        ) : (
          <>
            <label className="flex flex-col gap-1.5 text-xs text-white/70">
              <span>{t.form.address}</span>
              <input name="address" required className={inputClass} autoComplete="street-address" />
            </label>
            <label className="flex flex-col gap-1.5 text-xs text-white/70">
              <span>{t.order.deliveryTime}</span>
              <input name="deliveryTime" type="datetime-local" required className={inputClass} />
            </label>
            <div>
              <p className="mb-2 text-xs text-white/70">{t.order.paymentMethod}</p>
              <div className="flex gap-4 rounded-xl border border-white/10 p-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="radio" name="paymentMethod" value="cash" required className="accent-gold" />
                  {t.order.cash}
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="radio" name="paymentMethod" value="card" className="accent-gold" />
                  {t.order.card}
                </label>
              </div>
            </div>
          </>
        )}

        <label className="flex flex-col gap-1.5 text-xs text-white/70">
          <span>{t.order.comment}</span>
          <textarea name="comment" rows={3} className={inputClass} placeholder={t.order.commentPlaceholder} />
        </label>

        <button
          type="submit"
          disabled={lines.length === 0 || status === "loading"}
          className="rounded-full bg-gold py-3.5 text-sm font-semibold uppercase tracking-[0.15em] text-black transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === "loading" ? t.form.sending : t.order.placeOrder}
        </button>

        {status === "success" && <p className="text-center text-sm text-emerald-400">{t.form.success}</p>}
        {status === "error" && <p className="text-center text-sm text-red-400">{t.form.error}</p>}
      </form>
    </div>
  );
}
