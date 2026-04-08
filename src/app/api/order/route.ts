import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sendMail } from "@/lib/mailer";
import { normalizeToE164 } from "@/lib/phone-normalize";
import { ORDER_PHONE_COOKIE, parseVerifiedPhoneCookie } from "@/lib/order-phone-cookie";
import { buildOrderPdf } from "@/lib/order-pdf";
import { DELIVERY_MIN_ORDER_EUR } from "@/lib/order-config";

type OrderLine = {
  id: string;
  name: string;
  quantity: number;
  unitPriceEur: number;
  lineTotalEur: number;
};

type OrderBody = {
  fulfillment: "pickup" | "delivery";
  name: string;
  phone: string;
  email?: string;
  address?: string;
  pickupTime?: string;
  deliveryTime?: string;
  paymentMethod?: string;
  comment?: string;
  language?: string;
  subtotalEur: number;
  giftEligible?: boolean;
  giftMessage?: string;
  cutlery?: { chopsticksCount?: number; woodenCutleryCount?: number; unitPriceEur?: number; totalEur?: number } | null;
  lines: OrderLine[];
};

export async function POST(request: Request) {
  try {
    if (!process.env.ORDER_PHONE_VERIFY_SECRET) {
      return NextResponse.json({ error: "server_misconfigured" }, { status: 503 });
    }

    const body = (await request.json()) as OrderBody;
    const orderPhone = normalizeToE164(String(body.phone ?? ""));
    const store = await cookies();
    const proof = store.get(ORDER_PHONE_COOKIE)?.value;
    const verified = parseVerifiedPhoneCookie(proof);
    if (!verified) {
      return NextResponse.json({ error: "phone_not_verified" }, { status: 403 });
    }
    if (!orderPhone || orderPhone !== verified.phoneE164) {
      return NextResponse.json({ error: "phone_mismatch" }, { status: 403 });
    }
    if (body.fulfillment === "delivery" && Number(body.subtotalEur || 0) < DELIVERY_MIN_ORDER_EUR) {
      return NextResponse.json({ error: "delivery_min_order" }, { status: 400 });
    }
    if (body.fulfillment === "pickup" && body.pickupTime) {
      const d = new Date(body.pickupTime);
      const now = new Date();
      if (d.getFullYear() !== now.getFullYear() || d.getMonth() !== now.getMonth() || d.getDate() !== now.getDate()) {
        return NextResponse.json({ error: "pickup_same_day_only" }, { status: 400 });
      }
    }

    if (!Array.isArray(body.lines) || body.lines.length === 0) {
      return NextResponse.json({ error: "empty_cart" }, { status: 400 });
    }

    const linesText = body.lines
      .map((l) => `  - ${l.name} x${l.quantity} @ €${l.unitPriceEur.toFixed(2)} = €${l.lineTotalEur.toFixed(2)}`)
      .join("\n");

    const paymentLine =
      body.fulfillment === "delivery"
        ? "Payment: Cash on delivery only (no online payment)."
        : "Payment: Cash on pickup (as shown on website). Card payment also available on site at the terminal.";

    const extra: string[] = [
      `Fulfillment: ${body.fulfillment}`,
      `Name: ${body.name || ""}`,
      `Phone (SMS verified): ${orderPhone}`,
      `Email: ${body.email || ""}`,
      paymentLine
    ];

    if (body.fulfillment === "delivery") {
      extra.push(`Address: ${body.address || ""}`);
      extra.push(`Delivery time: ${body.deliveryTime || ""}`);
    } else {
      extra.push(`Pickup time: ${body.pickupTime || ""}`);
    }

    extra.push(`Comment: ${body.comment || ""}`);
    extra.push(`Language: ${body.language || ""}`);
    extra.push(`Subtotal: €${Number(body.subtotalEur || 0).toFixed(2)}`);
    if (body.giftEligible) {
      extra.push(`Bonus gift: YES — ${body.giftMessage || ""}`);
    }
    if (body.cutlery) {
      const chopsticks = Number(body.cutlery.chopsticksCount || 0);
      const wooden = Number(body.cutlery.woodenCutleryCount || 0);
      if (chopsticks > 0 || wooden > 0) {
        extra.push(`Cutlery: chopsticks x${chopsticks}, wooden x${wooden}`);
      }
      if (Number(body.cutlery.totalEur || 0) > 0) {
        extra.push(`Cutlery surcharge: €${Number(body.cutlery.totalEur || 0).toFixed(2)}`);
      }
    }

    const subject = `New order — Sake Vienna (${body.fulfillment}) — €${Number(body.subtotalEur || 0).toFixed(2)}`;
    const pdfBuffer = await buildOrderPdf(subject, ["Items:", linesText, "", ...extra]);

    await sendMail({
      subject,
      lines: ["Items:", linesText, "", ...extra],
      attachments: [{ filename: "order-invoice.pdf", content: pdfBuffer, contentType: "application/pdf" }]
    });

    store.delete(ORDER_PHONE_COOKIE);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}
