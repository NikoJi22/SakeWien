import { allocateNextOrderNumber } from "@/lib/order-sequence-store";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { MailerConfigError, MailerSendError, sendMail } from "@/lib/mailer";
import { normalizeToE164 } from "@/lib/phone-normalize";
import { ORDER_PHONE_COOKIE, parseVerifiedPhoneCookie } from "@/lib/order-phone-cookie";
import { buildOrderPdf, type OrderPdfInput } from "@/lib/order-pdf";
import { DELIVERY_MIN_ORDER_EUR } from "@/lib/order-config";
import {
  canAcceptNewOrdersVienna,
  DELIVERY_TIME_ESTIMATE_DE,
  formatDateKeyDeShort,
  isAllowedDeliveryPostalCode,
  validateDeliveryDateKey,
  validatePickupNaiveIso
} from "@/lib/order-schedule";

type OrderLine = {
  id: string;
  name: string;
  quantity: number;
  unitPriceEur: number;
  lineTotalEur: number;
};

type DeliveryAddressPayload = {
  street: string;
  houseNumber: string;
  staircase?: string;
  floor?: string;
  door?: string;
  postalCode: string;
  city: string;
};

type OrderBody = {
  fulfillment: "pickup" | "delivery";
  name: string;
  phone: string;
  email?: string;
  address?: string;
  deliveryAddress?: DeliveryAddressPayload;
  pickupTime?: string;
  /** YYYY-MM-DD — Lieferwunschtag */
  deliveryDate?: string;
  deliveryTime?: string;
  paymentMethod?: string;
  comment?: string;
  language?: string;
  subtotalEur: number;
  giftEligible?: boolean;
  giftMessage?: string;
  cutlery?: {
    chopsticksCount?: number;
    woodSpoonCount?: number;
    woodForkCount?: number;
    unitPriceEur?: number;
    totalEur?: number;
  } | null;
  lines: OrderLine[];
};

/** Bestell-PDFs: ORDER_NOTIFY_EMAIL → RESTAURANT_EMAIL → feste Restaurant-Adresse */
function orderNotifyRecipient(): string {
  return (
    process.env.ORDER_NOTIFY_EMAIL?.trim() ||
    process.env.RESTAURANT_EMAIL?.trim() ||
    "sakebestellen@gmail.com"
  );
}

function normalizePlz(raw: string): string {
  return raw.replace(/\s/g, "");
}

function formatDeliveryAddressForMail(d: DeliveryAddressPayload): string {
  const line1 = `${d.street.trim()} ${d.houseNumber.trim()}`.trim();
  const bits: string[] = [line1];
  const st = d.staircase?.trim();
  const fl = d.floor?.trim();
  const dr = d.door?.trim();
  if (st) bits.push(`Stiege ${st}`);
  if (fl) bits.push(`Stock ${fl}`);
  if (dr) bits.push(`Tür ${dr}`);
  bits.push(`${normalizePlz(d.postalCode)} ${d.city.trim()}`.trim());
  return bits.join(", ");
}

function validateDeliveryAddress(
  body: OrderBody
): { ok: true; formatted: string } | { ok: false; error: string } {
  const raw = body.deliveryAddress;
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "delivery_address_incomplete" };
  }
  const street = String(raw.street ?? "").trim();
  const houseNumber = String(raw.houseNumber ?? "").trim();
  const postalCode = normalizePlz(String(raw.postalCode ?? ""));
  const city = String(raw.city ?? "").trim();
  if (!street || !houseNumber || !postalCode || !city) {
    return { ok: false, error: "delivery_address_incomplete" };
  }
  if (!/^\d{4}$/.test(postalCode)) {
    return { ok: false, error: "delivery_address_invalid_plz" };
  }
  const formatted = formatDeliveryAddressForMail({
    street,
    houseNumber,
    staircase: String(raw.staircase ?? "").trim() || undefined,
    floor: String(raw.floor ?? "").trim() || undefined,
    door: String(raw.door ?? "").trim() || undefined,
    postalCode,
    city
  });
  return { ok: true, formatted };
}

function formatOrderDateTimeVienna(isoOrText: string | undefined): string | undefined {
  if (!isoOrText) return undefined;
  const trimmed = isoOrText.trim();
  /** Naive `YYYY-MM-DDTHH:mm:ss` = Wiener Restaurant-Wandzeit (kein Z), nicht UTC parsen. */
  const naive = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/.exec(trimmed);
  if (naive) {
    const [, y, mo, d, h, mi] = naive;
    return `${d}.${mo}.${y}, ${h}:${mi}`;
  }
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return trimmed;
  return new Intl.DateTimeFormat("de-AT", {
    timeZone: "Europe/Vienna",
    dateStyle: "short",
    timeStyle: "short"
  }).format(d);
}

function sanitizePdfFilename(orderId: string): string {
  const safe = orderId.replace(/[^a-zA-Z0-9-]/g, "-");
  return `bestellung-${safe}.pdf`;
}

function linesAreValid(lines: unknown): lines is OrderLine[] {
  if (!Array.isArray(lines) || lines.length === 0) return false;
  return lines.every(
    (l) =>
      l &&
      typeof l === "object" &&
      typeof (l as OrderLine).name === "string" &&
      Number.isFinite((l as OrderLine).quantity) &&
      Number.isFinite((l as OrderLine).unitPriceEur) &&
      Number.isFinite((l as OrderLine).lineTotalEur)
  );
}

export async function POST(request: Request) {
  try {
    let body: OrderBody;
    try {
      body = (await request.json()) as OrderBody;
    } catch {
      console.error("[order] rejected: invalid or non-JSON request body");
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    if (!linesAreValid(body.lines)) {
      console.error("[order] rejected: invalid or empty line items (cart)");
      return NextResponse.json({ error: "empty_cart" }, { status: 400 });
    }

    if (!canAcceptNewOrdersVienna()) {
      console.error("[order] rejected: after order cutoff (Vienna)");
      return NextResponse.json({ error: "orders_closed_cutoff" }, { status: 400 });
    }

    const customerName = String(body.name ?? "").trim();
    if (!customerName) {
      console.error("[order] rejected: missing customer name");
      return NextResponse.json({ error: "missing_customer_name" }, { status: 400 });
    }

    const rawPhone = String(body.phone ?? "").trim();
    let orderPhone: string | null = null;

    const store = await cookies();
    if (body.fulfillment === "delivery") {
      const normalized = normalizeToE164(rawPhone);
      if (!normalized) {
        console.error("[order] rejected delivery: missing or invalid phone number");
        return NextResponse.json({ error: "invalid_customer_phone" }, { status: 400 });
      }
      orderPhone = normalized;
      if (!process.env.ORDER_PHONE_VERIFY_SECRET) {
        console.error(
          "[order] rejected delivery: ORDER_PHONE_VERIFY_SECRET is not set (SMS verification cannot be secured)"
        );
        return NextResponse.json({ error: "delivery_phone_secret_missing" }, { status: 503 });
      }
      const proof = store.get(ORDER_PHONE_COOKIE)?.value;
      const verified = parseVerifiedPhoneCookie(proof);
      if (!verified) {
        return NextResponse.json({ error: "phone_not_verified" }, { status: 403 });
      }
      if (orderPhone !== verified.phoneE164) {
        return NextResponse.json({ error: "phone_mismatch" }, { status: 403 });
      }
    }
    /** Pickup: phone not required; optional valid number is stored if sent */
    else if (rawPhone) {
      const normalized = normalizeToE164(rawPhone);
      if (normalized) orderPhone = normalized;
    }
    if (body.fulfillment === "delivery" && Number(body.subtotalEur || 0) < DELIVERY_MIN_ORDER_EUR) {
      return NextResponse.json({ error: "delivery_min_order" }, { status: 400 });
    }
    let deliveryAddressLine = "";
    if (body.fulfillment === "delivery") {
      const addr = validateDeliveryAddress(body);
      if (!addr.ok) {
        return NextResponse.json({ error: addr.error }, { status: 400 });
      }
      const pc = normalizePlz(String(body.deliveryAddress?.postalCode ?? ""));
      if (!isAllowedDeliveryPostalCode(pc)) {
        return NextResponse.json({ error: "delivery_outside_area" }, { status: 400 });
      }
      deliveryAddressLine = addr.formatted;
      const deliveryDateKey = String(body.deliveryDate ?? "").trim();
      const dVal = validateDeliveryDateKey(deliveryDateKey);
      if (!dVal.ok) {
        return NextResponse.json({ error: dVal.error }, { status: 400 });
      }
    }
    if (body.fulfillment === "pickup") {
      const pVal = validatePickupNaiveIso(String(body.pickupTime ?? ""));
      if (!pVal.ok) {
        return NextResponse.json({ error: pVal.error }, { status: 400 });
      }
    }

    const orderId = await allocateNextOrderNumber();
    const itemsSubtotalEur = body.lines.reduce((s, l) => s + Number(l.lineTotalEur || 0), 0);
    const grandTotalEur = Number(body.subtotalEur || 0);

    const chopsticks = Number(body.cutlery?.chopsticksCount || 0);
    const woodSpoon = Number(body.cutlery?.woodSpoonCount || 0);
    const woodFork = Number(body.cutlery?.woodForkCount || 0);
    const cutleryTotalEur = Number(body.cutlery?.totalEur || 0);
    const cutleryPdf =
      chopsticks > 0 || woodSpoon > 0 || woodFork > 0
        ? { chopsticks, woodSpoon, woodFork, totalEur: cutleryTotalEur }
        : null;

    const deliveryDateKey =
      body.fulfillment === "delivery" ? String(body.deliveryDate ?? "").trim() : "";

    const pdfInput: OrderPdfInput = {
      orderId,
      fulfillment: body.fulfillment,
      createdAt: new Date(),
      customerName,
      phone: orderPhone ?? undefined,
      email: String(body.email ?? "").trim() || undefined,
      deliveryAddressLine: body.fulfillment === "delivery" ? deliveryAddressLine : undefined,
      pickupTime: body.fulfillment === "pickup" ? formatOrderDateTimeVienna(body.pickupTime) : undefined,
      deliveryDayLabel:
        body.fulfillment === "delivery" && deliveryDateKey ? formatDateKeyDeShort(deliveryDateKey) : undefined,
      deliveryTimeEstimate: body.fulfillment === "delivery" ? DELIVERY_TIME_ESTIMATE_DE : undefined,
      comment: String(body.comment ?? "").trim() || undefined,
      lines: body.lines.map((l) => ({
        name: l.name,
        quantity: l.quantity,
        unitPriceEur: l.unitPriceEur,
        lineTotalEur: l.lineTotalEur
      })),
      cutlery: cutleryPdf,
      giftEligible: !!body.giftEligible,
      giftMessage: body.giftEligible ? String(body.giftMessage ?? "").trim() || undefined : undefined,
      itemsSubtotalEur,
      grandTotalEur,
      deliveryFeeEur: undefined
    };

    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await buildOrderPdf(pdfInput);
    } catch (err) {
      console.error("[order] PDF generation failed — order not accepted:", err);
      return NextResponse.json({ error: "pdf_failed" }, { status: 500 });
    }

    const subject = `Neue Bestellung ${orderId}`;
    const scheduleLine =
      body.fulfillment === "pickup"
        ? `Abholung: ${formatOrderDateTimeVienna(body.pickupTime) ?? "—"}`
        : `Lieferung: ${formatDateKeyDeShort(deliveryDateKey)} — ${DELIVERY_TIME_ESTIMATE_DE}`;

    const emailLines = [
      subject,
      "",
      `Bestellnr.: ${orderId}`,
      `Zeit (Wien): ${formatOrderDateTimeVienna(new Date().toISOString())}`,
      `Kunde: ${customerName}`,
      `Telefon: ${orderPhone ?? "—"}`,
      scheduleLine,
      "",
      "Details siehe PDF-Anhang."
    ];

    const notifyTo = orderNotifyRecipient();
    try {
      await sendMail({
        to: notifyTo,
        subject,
        lines: emailLines,
        attachments: [
          {
            filename: sanitizePdfFilename(orderId),
            content: pdfBuffer,
            contentType: "application/pdf"
          }
        ]
      });
    } catch (err) {
      if (err instanceof MailerConfigError) {
        console.error("[order] mail_failed: SMTP not configured — order not accepted", {
          notifyTo: notifyTo.replace(/(.{2}).*(@.*)/, "$1…$2")
        });
        return NextResponse.json({ error: "smtp_not_configured" }, { status: 503 });
      }
      if (err instanceof MailerSendError) {
        console.error("[order] mail_failed: SMTP send error after PDF built — order not accepted", err);
        return NextResponse.json({ error: "mail_failed" }, { status: 502 });
      }
      console.error("[order] mail_failed: unexpected error after PDF built — order not accepted", err);
      return NextResponse.json({ error: "mail_failed" }, { status: 502 });
    }

    store.delete(ORDER_PHONE_COOKIE);
    return NextResponse.json({ ok: true, orderId });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[order] Unexpected error — order not accepted:", msg, error);
    return NextResponse.json({ error: "order_internal_error" }, { status: 500 });
  }
}
