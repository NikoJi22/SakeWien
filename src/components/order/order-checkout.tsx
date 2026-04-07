"use client";

import { FormEvent, useState } from "react";
import { useCart } from "@/context/cart-context";
import { useGiftConfig } from "@/context/gift-config-context";
import { useOrderCartDrawer } from "@/context/order-cart-drawer-context";
import { useLanguage } from "@/context/language-context";
import { formatPriceEur, labelMenuItem } from "@/lib/menu-helpers";
import { DELIVERY_MIN_ORDER_EUR } from "@/lib/order-config";

function nowTimeValue() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

type OrderCheckoutProps = {
  variant?: "sidebar" | "drawer";
};

export function OrderCheckout({ variant = "sidebar" }: OrderCheckoutProps) {
  const { language, t } = useLanguage();
  const { lines, subtotalEur, itemCount, clear } = useCart();
  const { config: giftConfig } = useGiftConfig();
  const { close: closeCartDrawer } = useOrderCartDrawer();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [smsError, setSmsError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pickupClock, setPickupClock] = useState(nowTimeValue);
  const [chopsticksCount, setChopsticksCount] = useState(0);
  const [woodenCutleryCount, setWoodenCutleryCount] = useState(0);
  const cutleryFeeEur = (chopsticksCount + woodenCutleryCount) * 0.1;
  const totalEur = subtotalEur + cutleryFeeEur;
  const isDeliveryMinMet = fulfillment === "pickup" || subtotalEur >= DELIVERY_MIN_ORDER_EUR;
  const needsSmsVerification = fulfillment === "delivery";

  const giftUnlocked = subtotalEur >= giftConfig.thresholdEur;
  const giftMessage = giftConfig.message[language];
  const isDrawer = variant === "drawer";

  function onPhoneInput(v: string) {
    setPhone(v);
    setPhoneVerified(false);
    setOtp("");
    setSmsError(null);
    setSubmitError(null);
  }

  async function handleSendCode() {
    setSmsError(null);
    setSendLoading(true);
    try {
      const res = await fetch("/api/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        const c = data.error;
        setSmsError(
          c === "invalid_phone"
            ? t.order.errInvalidPhone
            : c === "rate_limit"
              ? t.order.errRateLimit
              : c === "wait_before_resend"
                ? t.order.errWaitResend
                : c === "server_misconfigured"
                  ? t.order.errServerConfig
                  : t.order.errSendCode
        );
        return;
      }
    } catch {
      setSmsError(t.order.errSendCode);
    } finally {
      setSendLoading(false);
    }
  }

  async function handleVerifyCode() {
    setSmsError(null);
    setVerifyLoading(true);
    try {
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
        credentials: "same-origin"
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        const c = data.error;
        setSmsError(
          c === "server_misconfigured" ? t.order.errServerConfig : t.order.errVerifyCode
        );
        setPhoneVerified(false);
        return;
      }
      setPhoneVerified(true);
      setSmsError(null);
    } catch {
      setSmsError(t.order.errVerifyCode);
      setPhoneVerified(false);
    } finally {
      setVerifyLoading(false);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lines.length === 0) return;
    if (needsSmsVerification && !phoneVerified) {
      setSubmitError(t.order.errPhoneNotVerified);
      return;
    }
    const fd = new FormData(e.currentTarget);
    const pickupRaw = fulfillment === "pickup" ? String(fd.get("pickupTime") ?? "") : "";
    const pickupTime = fulfillment === "pickup" && /^\d{2}:\d{2}$/.test(pickupRaw)
      ? `${new Date().toISOString().slice(0, 10)}T${pickupRaw}:00`
      : pickupRaw;
    if (fulfillment === "pickup" && pickupTime) {
      const d = new Date(pickupTime);
      const now = new Date();
      if (
        d.getFullYear() !== now.getFullYear() ||
        d.getMonth() !== now.getMonth() ||
        d.getDate() !== now.getDate()
      ) {
        setStatus("idle");
        setSubmitError(t.order.pickupSameDayOnly);
        return;
      }
    }
    if (!isDeliveryMinMet) {
      setStatus("idle");
      setSubmitError(t.order.deliveryMinOrder);
      return;
    }
    setSubmitError(null);
    setStatus("loading");
    const payload = {
      fulfillment,
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      address: fulfillment === "delivery" ? String(fd.get("address") ?? "") : "",
      pickupTime,
      deliveryTime: fulfillment === "delivery" ? String(fd.get("deliveryTime") ?? "") : "",
      comment: String(fd.get("comment") ?? ""),
      language,
      subtotalEur: totalEur,
      giftEligible: giftUnlocked,
      giftMessage: giftUnlocked ? giftMessage : "",
      cutlery:
        chopsticksCount + woodenCutleryCount > 0
          ? { chopsticksCount, woodenCutleryCount, unitPriceEur: 0.1, totalEur: cutleryFeeEur }
          : null,
      lines: lines.map(({ lineKey, item, quantity, starterChoice, sushiExtras }) => ({
        id: lineKey,
        name: `${starterChoice
          ? `${item.name[language]} — ${item.lunchStarterChoice!.label[language]}: ${starterChoice.name[language]}`
          : item.name[language]}${
          sushiExtras?.wasabi || sushiExtras?.ginger
            ? ` (${[
                sushiExtras.wasabi ? t.order.wasabi : "",
                sushiExtras.ginger ? t.order.ginger : ""
              ]
                .filter(Boolean)
                .join(", ")})`
            : ""
        }`,
        quantity,
        unitPriceEur: item.priceEur,
        lineTotalEur: item.priceEur * quantity
      }))
    };

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "same-origin"
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("idle");
        const c = data.error;
        setSubmitError(
          c === "phone_not_verified"
            ? t.order.errPhoneNotVerified
            : c === "phone_mismatch"
              ? t.order.errPhoneMismatch
              : c === "delivery_min_order"
                ? t.order.deliveryMinOrder
                : c === "pickup_same_day_only"
                  ? t.order.pickupSameDayOnly
              : c === "server_misconfigured"
                ? t.order.errServerConfig
                : t.order.orderErrorGeneric
        );
        return;
      }
      setStatus("success");
      clear();
      setPhoneVerified(false);
      setPhone("");
      setOtp("");
      e.currentTarget.reset();
      if (variant === "drawer") closeCartDrawer();
    } catch {
      setStatus("idle");
      setSubmitError(t.order.orderErrorGeneric);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-[#ccc] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-500 focus:border-[#888] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)]";

  const btnOutline =
    "rounded-full border border-brand-line bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-brand-ink-secondary transition hover:border-brand-line-strong hover:bg-brand-muted disabled:opacity-40";

  const shell = isDrawer
    ? "flex flex-col rounded-b-2xl border-0 bg-transparent shadow-none"
    : "flex flex-col rounded-2xl border border-[#f1d6b4] bg-brand-card shadow-[0_1px_3px_rgba(0,0,0,0.06)]";

  const borderB = "border-b border-brand-line";
  const labelMuted = "text-xs font-medium text-brand-subtle";
  const sectionTitle = "font-serif text-2xl tracking-wide text-brand-ink";
  const metaLine = "mt-1 text-base text-brand-body";
  const emptyCart = "text-sm text-brand-subtle";
  const lineName = "text-brand-ink";
  const lineQty = "text-brand-faint";
  const linePrice = "shrink-0 tabular-nums font-bold text-brand-price";
  const subRowLabel = "text-brand-body";
  const subRowVal = "font-semibold tabular-nums text-brand-ink";
  const giftBox = "rounded-xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm text-brand-ink-secondary";
  const giftTitle = "font-semibold uppercase tracking-wide text-brand-accent";
  const giftText = "mt-1 text-brand-body";
  const giftHint = "text-xs text-brand-subtle";
  const subtotalBg = "space-y-2 border-b border-brand-line bg-brand-muted/60 px-5 py-4 sm:px-6";
  const fulfillLabel = "mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-subtle";
  const toggleWrap = "grid grid-cols-2 gap-2 rounded-xl border border-brand-line bg-brand-muted p-1";
  const toggleInactive = "rounded-lg text-brand-body transition hover:bg-white hover:text-brand-ink";
  const toggleActive = "rounded-lg bg-brand-accent text-white shadow-sm shadow-brand-accent/15";
  const infoBox = "rounded-xl border border-brand-line bg-brand-canvas/80 px-4 py-3 text-sm text-brand-body";
  const successMsg = "text-center text-sm font-medium text-brand-success";
  const errorMsg = "text-center text-sm font-medium text-brand-danger";

  return (
    <div id={isDrawer ? undefined : "order-checkout"} className={shell}>
      {!isDrawer && (
        <div className={`${borderB} p-5 sm:p-6`}>
          <h2 className={sectionTitle}>{t.order.yourOrder}</h2>
          <p className={metaLine}>
        {itemCount} {t.order.itemsInCart} · {formatPriceEur(totalEur, language)}
          </p>
        </div>
      )}

      {isDrawer && (
        <div className={`${borderB} px-1 pb-4 pt-1 sm:px-2`}>
          <p className={metaLine}>
            {itemCount} {t.order.itemsInCart} · {formatPriceEur(totalEur, language)}
          </p>
        </div>
      )}

      <div className={`${borderB} p-5 sm:p-6`}>
        {lines.length === 0 ? (
          <p className={emptyCart}>{t.order.emptyCart}</p>
        ) : (
          <ul className="space-y-4">
            {lines.map(({ lineKey, item, quantity, starterChoice, sushiExtras }) => {
              const L = labelMenuItem(item, language);
              return (
                <li key={lineKey} className="flex justify-between gap-3 text-base">
                  <span className={lineName}>
                    <span className="block text-lg font-medium">{L.name}</span>
                    {starterChoice && item.lunchStarterChoice && (
                      <span className="mt-0.5 block text-xs font-normal text-brand-body">
                        {item.lunchStarterChoice.label[language]}: {starterChoice.name[language]}
                      </span>
                    )}
                    {(sushiExtras?.wasabi || sushiExtras?.ginger) && (
                      <span className="mt-0.5 block text-xs font-normal text-brand-body">
                        {t.order.sushiExtras}: {[
                          sushiExtras.wasabi ? t.order.wasabi : "",
                          sushiExtras.ginger ? t.order.ginger : ""
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    )}
                    <span className={lineQty}> × {quantity}</span>
                  </span>
                  <span className={linePrice}>{formatPriceEur(item.priceEur * quantity, language)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className={subtotalBg}>
        <div className="space-y-3 rounded-xl border border-brand-line bg-brand-canvas/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-subtle">{t.order.cutlery}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={`flex flex-col gap-1.5 ${labelMuted}`}>
              <span>{t.order.chopsticks}</span>
              <input type="number" min={0} value={chopsticksCount} onChange={(e) => setChopsticksCount(Number(e.target.value) || 0)} className={inputClass} placeholder={t.order.cutleryCount} />
            </label>
            <label className={`flex flex-col gap-1.5 ${labelMuted}`}>
              <span>{t.order.woodenCutlery}</span>
              <input type="number" min={0} value={woodenCutleryCount} onChange={(e) => setWoodenCutleryCount(Number(e.target.value) || 0)} className={inputClass} placeholder={t.order.cutleryCount} />
            </label>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className={subRowLabel}>{t.order.subtotal}</span>
          <span className={subRowVal}>{formatPriceEur(subtotalEur, language)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className={subRowLabel}>
            {t.order.cutlery} ({formatPriceEur(0.1, language)} / Stk.)
          </span>
          <span className={subRowVal}>{formatPriceEur(cutleryFeeEur, language)}</span>
        </div>
        <div className="flex items-center justify-between text-base font-semibold">
          <span className="text-brand-ink">Gesamt</span>
          <span className="tabular-nums text-brand-ink">{formatPriceEur(totalEur, language)}</span>
        </div>
        {giftUnlocked ? (
          <div className={giftBox}>
            <p className={giftTitle}>{t.order.giftUnlocked}</p>
            <p className={giftText}>{giftMessage}</p>
          </div>
        ) : (
          <p className={giftHint}>{t.order.giftHint}</p>
        )}
      </div>

      <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
        <div>
          <p className={fulfillLabel}>{t.order.fulfillment}</p>
          <div className={toggleWrap}>
            <button
              type="button"
              onClick={() => setFulfillment("pickup")}
              className={`py-2.5 text-xs font-semibold uppercase tracking-wider transition sm:text-sm ${
                fulfillment === "pickup" ? toggleActive : toggleInactive
              }`}
            >
              {t.form.pickup}
            </button>
            <button
              type="button"
              onClick={() => setFulfillment("delivery")}
              className={`py-2.5 text-xs font-semibold uppercase tracking-wider transition sm:text-sm ${
                fulfillment === "delivery" ? toggleActive : toggleInactive
              }`}
            >
              {t.form.delivery}
            </button>
          </div>
        </div>

        {needsSmsVerification && <div className="space-y-3 rounded-xl border border-brand-line bg-brand-canvas/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-subtle">
            {t.order.smsVerifyTitle}
          </p>
          <label className={`flex flex-col gap-1.5 ${labelMuted}`}>
            <span>{t.form.phone}</span>
            <input
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              inputMode="tel"
              placeholder={t.form.phonePlaceholder}
              value={phone}
              onChange={(e) => onPhoneInput(e.target.value)}
              className={inputClass}
              disabled={phoneVerified}
            />
            {!phoneVerified && <p className="text-xs leading-relaxed text-brand-subtle">{t.form.phoneHint}</p>}
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleSendCode()}
              disabled={sendLoading || !phone.trim() || phoneVerified}
              className={btnOutline}
            >
              {sendLoading ? t.order.codeSending : t.order.sendCode}
            </button>
            {phoneVerified && (
              <span className="inline-flex items-center text-sm font-medium text-brand-success">
                ✓ {t.order.verifiedPhone}
              </span>
            )}
          </div>
          {!phoneVerified && (
            <>
              <label className={`flex flex-col gap-1.5 ${labelMuted}`}>
                <span>{t.order.enterCode}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={inputClass}
                  placeholder="000000"
                />
              </label>
              <button
                type="button"
                onClick={() => void handleVerifyCode()}
                disabled={verifyLoading || !otp.trim()}
                className="w-full rounded-full bg-brand-accent py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm shadow-brand-accent/15 transition hover:bg-brand-accent-hover disabled:opacity-40 sm:w-auto sm:px-8"
              >
                {verifyLoading ? t.order.codeVerifying : t.order.confirmCode}
              </button>
            </>
          )}
          {smsError && (
          <p className="text-sm text-brand-danger">{smsError}</p>
        )}
        </div>}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className={`flex flex-col gap-1.5 sm:col-span-2 ${labelMuted}`}>
            <span>{t.form.fullName}</span>
            <input name="name" required className={inputClass} autoComplete="name" />
          </label>
          <label className={`flex flex-col gap-1.5 sm:col-span-2 ${labelMuted}`}>
            <span>{t.order.emailOptional}</span>
            <input name="email" type="email" className={inputClass} autoComplete="email" />
          </label>
        </div>

        <div className={infoBox}>
          <p className="font-semibold text-current">{t.order.paymentHeading}</p>
          <p className="mt-2">
            {fulfillment === "pickup" ? t.order.paymentPickupCash : t.order.paymentDeliveryCash}
          </p>
          {fulfillment === "pickup" && <p className="mt-2 text-xs opacity-90">{t.order.paymentPickupCardNote}</p>}
        </div>

        {fulfillment === "pickup" ? (
          <label className={`flex flex-col gap-1.5 ${labelMuted}`}>
            <span>{t.order.pickupTime}</span>
            <input
              name="pickupTime"
              type="time"
              required
              value={pickupClock}
              onChange={(e) => setPickupClock(e.target.value)}
              className={inputClass}
            />
            <span className="text-xs text-brand-subtle">{t.order.pickupSameDayOnly}</span>
          </label>
        ) : (
          <>
            <label className={`flex flex-col gap-1.5 ${labelMuted}`}>
              <span>{t.form.address}</span>
              <input name="address" required className={inputClass} autoComplete="street-address" />
            </label>
            <label className={`flex flex-col gap-1.5 ${labelMuted}`}>
              <span>{t.order.deliveryTime}</span>
              <input name="deliveryTime" type="datetime-local" required className={inputClass} />
            </label>
          </>
        )}

        <label className={`flex flex-col gap-1.5 ${labelMuted}`}>
          <span>{t.order.comment}</span>
          <textarea name="comment" rows={3} className={inputClass} placeholder={t.order.commentPlaceholder} />
        </label>

        {!isDeliveryMinMet && <p className="text-sm text-brand-danger">{t.order.deliveryMinOrder}</p>}

        <button
          type="submit"
          disabled={lines.length === 0 || status === "loading" || (needsSmsVerification && !phoneVerified) || !isDeliveryMinMet}
          className="rounded-full bg-brand-accent py-3.5 text-sm font-semibold uppercase tracking-[0.15em] text-white shadow-md shadow-brand-accent/12 transition hover:bg-brand-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === "loading" ? t.form.sending : t.order.placeOrder}
        </button>

        {submitError && <p className={errorMsg}>{submitError}</p>}
        {status === "success" && <p className={successMsg}>{t.form.success}</p>}
      </form>
    </div>
  );
}
