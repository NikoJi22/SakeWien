"use client";

import { FormEvent, useEffect, useState } from "react";
import { useCart } from "@/context/cart-context";
import { useGiftConfig } from "@/context/gift-config-context";
import { useOrderCartDrawer } from "@/context/order-cart-drawer-context";
import { useLanguage } from "@/context/language-context";
import { formatPriceEur, labelMenuItem } from "@/lib/menu-helpers";
import { getEffectivePriceEur } from "@/lib/menu-pricing";
import { DELIVERY_MIN_ORDER_EUR } from "@/lib/order-config";
import { brandBtnPrimary, brandBtnSecondary } from "@/lib/brand-actions";
import type { translations } from "@/lib/translations";

type OrderCopy = (typeof translations)["en"]["order"];

/** API `error` codes for POST /api/order (keep in sync with route). */
const ORDER_SUBMIT_ERROR_CODES = new Set([
  "phone_not_verified",
  "phone_mismatch",
  "delivery_min_order",
  "delivery_address_incomplete",
  "delivery_address_invalid_plz",
  "pickup_same_day_only",
  "empty_cart",
  "missing_customer_name",
  "invalid_customer_phone",
  "invalid_json",
  "invalid_payload",
  "mail_failed",
  "smtp_not_configured",
  "smtp_send_failed",
  "mail_failed",
  "pdf_failed",
  "delivery_phone_secret_missing",
  "server_misconfigured",
  "order_internal_error"
]);

function messageForOrderSubmitError(code: string | undefined, o: OrderCopy, httpStatus: number): string {
  switch (code) {
    case "phone_not_verified":
      return o.errPhoneNotVerified;
    case "phone_mismatch":
      return o.errPhoneMismatch;
    case "delivery_min_order":
      return o.deliveryMinOrder;
    case "delivery_address_incomplete":
      return o.errDeliveryAddressIncomplete;
    case "delivery_address_invalid_plz":
      return o.errDeliveryAddressPlz;
    case "pickup_same_day_only":
      return o.pickupSameDayOnly;
    case "empty_cart":
      return o.errEmptyCartPayload;
    case "missing_customer_name":
      return o.errMissingCustomerName;
    case "invalid_customer_phone":
      return o.errInvalidCustomerPhone;
    case "invalid_json":
      return o.errInvalidJsonBody;
    case "invalid_payload":
      return o.errEmptyCartPayload;
    case "mail_failed":
      return o.errSmtpSendFailed;
    case "smtp_not_configured":
      return o.errSmtpNotConfigured;
    case "smtp_send_failed":
      return o.errSmtpSendFailed;
    case "mail_failed":
      return o.errSmtpSendFailed;
    case "pdf_failed":
      return o.errPdfFailed;
    case "delivery_phone_secret_missing":
      return o.errDeliveryPhoneSecretMissing;
    case "server_misconfigured":
      return o.errServerConfig;
    case "order_internal_error":
      return o.errOrderServerError;
    default:
      break;
  }

  if (code && !ORDER_SUBMIT_ERROR_CODES.has(code)) {
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      console.warn("[order-checkout] Unbekannter API-Fehlercode:", code, "HTTP", httpStatus);
    }
  }

  if (httpStatus === 502) return o.errSmtpSendFailed;
  /** 503 ohne Code: z. B. Wartung / falsches Gateway — nicht immer SMTP */
  if (httpStatus === 503) return o.errServerConfig;
  if (httpStatus === 500) return o.errOrderServerError;
  if (httpStatus === 403) return o.errPhoneNotVerified;
  return o.orderErrorGeneric;
}

function messageForSmsSendError(code: string | undefined, o: OrderCopy): string {
  switch (code) {
    case "invalid_phone":
      return o.errInvalidPhone;
    case "rate_limit":
      return o.errRateLimit;
    case "wait_before_resend":
      return o.errWaitResend;
    case "sms_not_configured":
      return o.errSmsNotConfigured;
    case "twilio_error":
      return o.errSmsProviderFailed;
    case "server_misconfigured":
      return o.errSmsNotConfigured;
    default:
      return o.errSendCode;
  }
}

function messageForSmsVerifyError(code: string | undefined, o: OrderCopy): string {
  switch (code) {
    case "invalid_phone":
      return o.errInvalidPhone;
    case "invalid_code":
    case "code_rejected":
    case "verify_failed":
      return o.errVerifyCode;
    case "sms_not_configured":
      return o.errSmsNotConfigured;
    case "delivery_phone_secret_missing":
      return o.errDeliveryPhoneSecretMissing;
    case "server_misconfigured":
      return o.errSmsNotConfigured;
    default:
      return o.errVerifyCode;
  }
}

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
  const [codeSent, setCodeSent] = useState(false);
  const [smsInfo, setSmsInfo] = useState<string | null>(null);
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState<string | null>(null);
  const cutleryFeeEur = (chopsticksCount + woodenCutleryCount) * 0.1;
  const totalEur = subtotalEur + cutleryFeeEur;
  const isDeliveryMinMet = fulfillment === "pickup" || subtotalEur >= DELIVERY_MIN_ORDER_EUR;
  /** SMS required only for delivery */
  const needsSmsVerification = fulfillment === "delivery";

  useEffect(() => {
    if (fulfillment !== "pickup") return;
    setPhoneVerified(false);
    setPhone("");
    setOtp("");
    setCodeSent(false);
    setSmsError(null);
    setSmsInfo(null);
  }, [fulfillment]);

  const giftUnlocked = subtotalEur >= giftConfig.thresholdEur;
  const giftMessage = giftConfig.message[language];
  const isDrawer = variant === "drawer";

  useEffect(() => {
    if (lines.length > 0) return;
    setPhoneVerified(false);
    setPhone("");
    setOtp("");
    setCodeSent(false);
    setSmsInfo(null);
    setSmsError(null);
  }, [lines.length]);

  function onPhoneInput(v: string) {
    setPhone(v);
    setPhoneVerified(false);
    setOtp("");
    setSmsError(null);
    setSubmitError(null);
    setCodeSent(false);
    setSmsInfo(null);
  }

  async function requestSmsCode(): Promise<boolean> {
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
        setSmsError(messageForSmsSendError(data.error, t.order));
        return false;
      }
      return true;
    } catch {
      setSmsError(t.order.errSendCode);
      return false;
    } finally {
      setSendLoading(false);
    }
  }

  async function handleResendCode() {
    const ok = await requestSmsCode();
    if (ok) {
      setCodeSent(true);
      setSmsInfo(t.order.codeSentInfo);
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
        setSmsError(messageForSmsVerifyError(data.error, t.order));
        setPhoneVerified(false);
        return;
      }
      setPhoneVerified(true);
      setSmsError(null);
      setSmsInfo(null);
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

    if (needsSmsVerification && !phoneVerified) {
      const phoneTrim = phone.trim();
      if (!phoneTrim) {
        setSubmitError(t.order.errInvalidPhone);
        return;
      }
      setSubmitError(t.order.errPhoneNotVerified);
      setSmsInfo(null);
      return;
    }

    if (fulfillment === "delivery") {
      const street = String(fd.get("deliveryStreet") ?? "").trim();
      const houseNumber = String(fd.get("deliveryHouseNumber") ?? "").trim();
      const postalCode = String(fd.get("deliveryPostalCode") ?? "").replace(/\s/g, "").trim();
      const city = String(fd.get("deliveryCity") ?? "").trim();
      if (!street || !houseNumber || !postalCode || !city) {
        setSubmitError(t.order.errDeliveryAddressIncomplete);
        return;
      }
      if (!/^\d{4}$/.test(postalCode)) {
        setSubmitError(t.order.errDeliveryAddressPlz);
        return;
      }
    }

    setSubmitError(null);
    setSmsInfo(null);
    setLastPlacedOrderId(null);
    setStatus("loading");
    const formEl = e.currentTarget;
    const payload = {
      fulfillment,
      name: String(fd.get("name") ?? ""),
      phone: fulfillment === "delivery" ? phone.trim() : "",
      email: String(fd.get("email") ?? ""),
      deliveryAddress:
        fulfillment === "delivery"
          ? {
              street: String(fd.get("deliveryStreet") ?? "").trim(),
              houseNumber: String(fd.get("deliveryHouseNumber") ?? "").trim(),
              staircase: String(fd.get("deliveryStaircase") ?? "").trim(),
              floor: String(fd.get("deliveryFloor") ?? "").trim(),
              door: String(fd.get("deliveryDoor") ?? "").trim(),
              postalCode: String(fd.get("deliveryPostalCode") ?? "").replace(/\s/g, "").trim(),
              city: String(fd.get("deliveryCity") ?? "").trim()
            }
          : undefined,
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
        unitPriceEur: getEffectivePriceEur(item),
        lineTotalEur: getEffectivePriceEur(item) * quantity
      }))
    };

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "same-origin"
      });

      let data: { ok?: boolean; orderId?: string; error?: string } = {};
      try {
        const text = await res.text();
        if (text.trim()) {
          data = JSON.parse(text) as typeof data;
        }
      } catch (parseErr) {
        console.error("[order-checkout] order response JSON parse failed", res.status, parseErr);
        setStatus("idle");
        setSubmitError(messageForOrderSubmitError(undefined, t.order, res.status));
        return;
      }

      if (process.env.NODE_ENV === "development") {
        console.log("[order-checkout] /api/order response", res.status, data);
      }

      if (!res.ok) {
        setStatus("idle");
        setSubmitError(messageForOrderSubmitError(data.error, t.order, res.status));
        return;
      }

      if (data.ok !== true) {
        console.error("[order-checkout] HTTP OK but missing data.ok === true", res.status, data);
        setStatus("idle");
        setSubmitError(messageForOrderSubmitError(data.error, t.order, res.status));
        return;
      }

      if (process.env.NODE_ENV === "development") {
        console.log("[order-checkout] order success path", data.orderId);
      }

      setSubmitError(null);
      setLastPlacedOrderId(typeof data.orderId === "string" ? data.orderId : null);
      setStatus("success");
      clear();
      setPhoneVerified(false);
      setPhone("");
      setOtp("");
      setCodeSent(false);
      setSmsInfo(null);

      try {
        formEl.reset();
      } catch (resetErr) {
        console.error("[order-checkout] form reset failed after successful order", resetErr);
      }

      if (variant === "drawer") closeCartDrawer();
    } catch (err) {
      console.error("[order-checkout] fetch failed or network error", err);
      setStatus("idle");
      setSubmitError(t.order.errOrderNetwork);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-brand-line bg-brand-card px-4 py-3 text-sm text-brand-ink outline-none transition placeholder:text-brand-subtle focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(70,95,107,0.12)]";

  const btnOutline = `rounded-full ${brandBtnSecondary} px-4 py-2.5 text-xs font-bold uppercase tracking-wider`;

  const btnPrimary = `rounded-full ${brandBtnPrimary} font-bold uppercase shadow-md hover:shadow-lg`;

  const shell = isDrawer
    ? "flex flex-col rounded-b-2xl border-0 bg-transparent shadow-none"
    : "flex w-full min-w-0 flex-col rounded-2xl border border-brand-line bg-brand-card shadow-[0_1px_3px_rgba(31,35,38,0.05)]";

  const borderB = "border-b border-brand-line";
  const labelMuted = "text-xs font-medium text-brand-subtle";
  const sectionTitle =
    "font-serif text-[1.65rem] font-bold leading-tight tracking-wide text-brand-ink sm:text-[1.85rem]";
  const metaLine = "mt-2 text-sm font-medium text-brand-body sm:text-base";
  const emptyCart = "text-sm text-brand-subtle";
  const lineName = "text-brand-ink";
  const lineQty = "text-brand-faint";
  const linePrice = "shrink-0 tabular-nums font-bold text-brand-price";
  const subRowLabel = "text-brand-body";
  const subRowVal = "font-semibold tabular-nums text-brand-ink";
  const giftBox = "rounded-xl border border-brand-line bg-brand-muted/45 px-4 py-3 text-sm text-brand-ink-secondary";
  const giftTitle = "font-semibold uppercase tracking-wide text-brand-accent";
  const giftText = "mt-1 text-brand-body";
  const giftHint = "text-xs text-brand-subtle";
  const subtotalBg =
    "space-y-5 border-b border-brand-line bg-brand-canvas/90 px-5 py-6 sm:space-y-6 sm:px-6 sm:py-7";
  const fulfillLabel = "mb-3 text-xs font-bold uppercase tracking-[0.22em] text-brand-primary";
  const toggleWrap =
    "grid grid-cols-2 gap-1.5 rounded-xl border border-brand-line bg-brand-canvas p-1.5 sm:gap-2 sm:p-2";
  const toggleInactive =
    "rounded-lg bg-transparent px-2 py-3 text-xs font-semibold uppercase tracking-wider text-brand-ink-secondary transition-all duration-200 hover:bg-brand-surface-hover hover:text-brand-primary sm:text-sm";
  const toggleActive =
    "rounded-lg bg-brand-primary px-2 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-brand-primary/25 ring-2 ring-brand-primary/30 ring-offset-2 ring-offset-brand-canvas sm:text-sm";
  const infoBox = "rounded-xl border border-brand-line bg-brand-canvas/90 px-4 py-3 text-sm text-brand-body";
  const successMsg = "text-center text-sm font-medium text-brand-success";
  const errorMsg = "text-center text-sm font-medium text-brand-danger";

  return (
    <div id={isDrawer ? undefined : "order-checkout"} className={shell}>
      {!isDrawer && (
        <div className={`${borderB} px-5 pb-7 pt-6 sm:px-7 sm:pb-8 sm:pt-7`}>
          <h2 className={sectionTitle}>{t.order.yourOrder}</h2>
          <p className={metaLine}>
            {itemCount} {t.order.itemsInCart} · {formatPriceEur(totalEur, language)}
          </p>
        </div>
      )}

      {isDrawer && (
        <div className={`${borderB} px-1 pb-5 pt-2 sm:px-2 sm:pb-6`}>
          <p className={`${metaLine} mt-0`}>
            {itemCount} {t.order.itemsInCart} · {formatPriceEur(totalEur, language)}
          </p>
        </div>
      )}

      <div className={`${borderB} px-5 py-6 sm:px-7 sm:py-8`}>
        {lines.length === 0 ? (
          <p className={emptyCart}>{t.order.emptyCart}</p>
        ) : (
          <ul className="space-y-5 sm:space-y-6">
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
                  <span className={linePrice}>{formatPriceEur(getEffectivePriceEur(item) * quantity, language)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className={subtotalBg}>
        <div className="space-y-4 rounded-xl border border-brand-primary/10 bg-brand-canvas/50 p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-subtle">{t.order.cutlery}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className={`flex flex-col gap-2 ${labelMuted}`}>
              <span>{t.order.chopsticks}</span>
              <div className="flex items-center justify-end sm:justify-start">
                <div className="flex shrink-0 items-center gap-0.5 rounded-full border-2 border-brand-line bg-brand-canvas p-0.5">
                  <button
                    type="button"
                    onClick={() => setChopsticksCount((n) => Math.max(0, n - 1))}
                    disabled={chopsticksCount <= 0}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-base font-semibold text-brand-primary transition hover:bg-brand-surface-hover hover:text-brand-primary-dark disabled:opacity-30 sm:h-9 sm:w-9 sm:text-lg"
                    aria-label="Decrease"
                  >
                    −
                  </button>
                  <span className="min-w-[1.75rem] text-center text-xs font-bold tabular-nums text-brand-ink sm:min-w-[2rem] sm:text-sm">
                    {chopsticksCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setChopsticksCount((n) => n + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-base font-semibold text-brand-primary transition hover:bg-brand-surface-hover hover:text-brand-primary-dark disabled:opacity-30 sm:h-9 sm:w-9 sm:text-lg"
                    aria-label="Increase"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <div className={`flex flex-col gap-2 ${labelMuted}`}>
              <span>{t.order.woodenCutlery}</span>
              <div className="flex items-center justify-end sm:justify-start">
                <div className="flex shrink-0 items-center gap-0.5 rounded-full border-2 border-brand-line bg-brand-canvas p-0.5">
                  <button
                    type="button"
                    onClick={() => setWoodenCutleryCount((n) => Math.max(0, n - 1))}
                    disabled={woodenCutleryCount <= 0}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-base font-semibold text-brand-primary transition hover:bg-brand-surface-hover hover:text-brand-primary-dark disabled:opacity-30 sm:h-9 sm:w-9 sm:text-lg"
                    aria-label="Decrease"
                  >
                    −
                  </button>
                  <span className="min-w-[1.75rem] text-center text-xs font-bold tabular-nums text-brand-ink sm:min-w-[2rem] sm:text-sm">
                    {woodenCutleryCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setWoodenCutleryCount((n) => n + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-base font-semibold text-brand-primary transition hover:bg-brand-surface-hover hover:text-brand-primary-dark disabled:opacity-30 sm:h-9 sm:w-9 sm:text-lg"
                    aria-label="Increase"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
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

      <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-8 p-5 sm:gap-9 sm:px-7 sm:py-8">
        <div className="space-y-3">
          <p className={fulfillLabel}>{t.order.fulfillment}</p>
          <div className={toggleWrap}>
            <button
              type="button"
              onClick={() => setFulfillment("pickup")}
              className={fulfillment === "pickup" ? toggleActive : toggleInactive}
            >
              {t.form.pickup}
            </button>
            <button
              type="button"
              onClick={() => setFulfillment("delivery")}
              className={fulfillment === "delivery" ? toggleActive : toggleInactive}
            >
              {t.form.delivery}
            </button>
          </div>
        </div>

        {needsSmsVerification && (
          <div className="space-y-4 rounded-xl border border-brand-primary/10 bg-brand-canvas/50 p-4 sm:space-y-5 sm:p-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">
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
            {!phoneVerified && !codeSent && (
              <>
                <p className="text-sm leading-relaxed text-brand-body">{t.order.smsVerifyHintSubmit}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleResendCode()}
                    disabled={sendLoading || !phone.trim()}
                    className={`${btnPrimary} py-2.5 text-xs tracking-wider sm:px-8`}
                  >
                    {sendLoading ? t.order.codeSending : t.order.sendCode}
                  </button>
                </div>
              </>
            )}
            {smsInfo && !phoneVerified && (
              <p className="text-sm font-medium text-brand-primary">{smsInfo}</p>
            )}
            {!phoneVerified && codeSent && (
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
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleVerifyCode()}
                    disabled={verifyLoading || !otp.trim()}
                    className={`${btnPrimary} py-2.5 text-xs tracking-wider sm:px-8`}
                  >
                    {verifyLoading ? t.order.codeVerifying : t.order.confirmCode}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleResendCode()}
                    disabled={sendLoading || !phone.trim()}
                    className={btnOutline}
                  >
                    {sendLoading ? t.order.codeSending : t.order.resendCode}
                  </button>
                </div>
              </>
            )}
            {phoneVerified && (
              <span className="inline-flex items-center text-sm font-medium text-brand-success">
                ✓ {t.order.verifiedPhone}
              </span>
            )}
            {smsError && <p className="text-sm text-brand-danger">{smsError}</p>}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
          <label className={`flex flex-col gap-1.5 sm:col-span-2 ${labelMuted}`}>
            <span>{t.form.fullName}</span>
            <input name="name" required className={inputClass} autoComplete="name" />
          </label>
          <label className={`flex flex-col gap-1.5 sm:col-span-2 ${labelMuted}`}>
            <span>{t.order.emailOptional}</span>
            <input name="email" type="email" className={inputClass} autoComplete="email" />
          </label>
        </div>

        <div className={`${infoBox} sm:px-5 sm:py-4`}>
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
          <div className="space-y-4">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand-subtle">
                {t.order.deliveryAddressHeading}
              </p>
              <div className="grid gap-4 sm:grid-cols-6">
                <label className={`flex flex-col gap-1.5 sm:col-span-4 ${labelMuted}`}>
                  <span>{t.form.street}</span>
                  <input
                    name="deliveryStreet"
                    required
                    className={inputClass}
                    autoComplete="address-line1"
                  />
                </label>
                <label className={`flex flex-col gap-1.5 sm:col-span-2 ${labelMuted}`}>
                  <span>{t.form.houseNumber}</span>
                  <input name="deliveryHouseNumber" required className={inputClass} autoComplete="off" />
                </label>
                <label className={`flex flex-col gap-1.5 sm:col-span-2 ${labelMuted}`}>
                  <span>{t.form.staircase}</span>
                  <input name="deliveryStaircase" className={inputClass} autoComplete="off" />
                </label>
                <label className={`flex flex-col gap-1.5 sm:col-span-2 ${labelMuted}`}>
                  <span>{t.form.floor}</span>
                  <input name="deliveryFloor" className={inputClass} autoComplete="off" />
                </label>
                <label className={`flex flex-col gap-1.5 sm:col-span-2 ${labelMuted}`}>
                  <span>{t.form.door}</span>
                  <input name="deliveryDoor" className={inputClass} autoComplete="off" />
                </label>
                <label className={`flex flex-col gap-1.5 sm:col-span-2 ${labelMuted}`}>
                  <span>{t.form.postalCode}</span>
                  <input
                    name="deliveryPostalCode"
                    required
                    inputMode="numeric"
                    maxLength={6}
                    className={inputClass}
                    autoComplete="postal-code"
                  />
                </label>
                <label className={`flex flex-col gap-1.5 sm:col-span-4 ${labelMuted}`}>
                  <span>{t.form.city}</span>
                  <input
                    name="deliveryCity"
                    required
                    className={inputClass}
                    defaultValue={language === "de" ? "Wien" : "Vienna"}
                    autoComplete="address-level2"
                  />
                </label>
              </div>
            </div>
            <label className={`flex flex-col gap-1.5 ${labelMuted}`}>
              <span>{t.order.deliveryTime}</span>
              <input name="deliveryTime" type="datetime-local" required className={inputClass} />
            </label>
          </div>
        )}

        <label className={`flex flex-col gap-1.5 ${labelMuted}`}>
          <span>{t.order.comment}</span>
          <textarea name="comment" rows={3} className={inputClass} placeholder={t.order.commentPlaceholder} />
        </label>

        {!isDeliveryMinMet && <p className="text-sm text-brand-danger">{t.order.deliveryMinOrder}</p>}

        <button
          type="submit"
          disabled={
            lines.length === 0 ||
            status === "loading" ||
            sendLoading ||
            !isDeliveryMinMet ||
            (needsSmsVerification && !phoneVerified)
          }
          className={`${btnPrimary} py-3.5 text-sm tracking-[0.15em]`}
        >
          {status === "loading" ? t.form.sending : t.order.placeOrder}
        </button>

        {needsSmsVerification && !phoneVerified && (
          <p className="text-sm text-brand-subtle">Bitte zuerst Telefonnummer per SMS-Code verifizieren.</p>
        )}
        {submitError && <p className={errorMsg}>{submitError}</p>}
        {status === "success" && (
          <div className="space-y-1">
            <p className={successMsg}>{t.order.orderPlacedSuccess}</p>
            {lastPlacedOrderId && (
              <p className="text-sm text-brand-subtle">
                {t.order.orderReferenceLabel} {lastPlacedOrderId}
              </p>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
