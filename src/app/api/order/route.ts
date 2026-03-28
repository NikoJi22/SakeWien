import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sendMail } from "@/lib/mailer";
import { normalizeToE164 } from "@/lib/phone-normalize";
import { ORDER_PHONE_COOKIE, parseVerifiedPhoneCookie } from "@/lib/order-phone-cookie";

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
  lines: OrderLine[];
};

export async function POST(request: Request) {
  try {
    if (!process.env.ORDER_PHONE_VERIFY_SECRET) {
      return NextResponse.json({ error: "server_misconfigured" }, { status: 503 });
    }

    const store = await cookies();
    const proof = store.get(ORDER_PHONE_COOKIE)?.value;
    const verified = parseVerifiedPhoneCookie(proof);

    if (!verified) {
      return NextResponse.json({ error: "phone_not_verified" }, { status: 403 });
    }

    const body = (await request.json()) as OrderBody;
    const orderPhone = normalizeToE164(String(body.phone ?? ""));

    if (!orderPhone || orderPhone !== verified.phoneE164) {
      return NextResponse.json({ error: "phone_mismatch" }, { status: 403 });
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

    await sendMail({
      subject: `New order — Sake Vienna (${body.fulfillment}) — €${Number(body.subtotalEur || 0).toFixed(2)}`,
      lines: ["Items:", linesText, "", ...extra]
    });

    store.delete(ORDER_PHONE_COOKIE);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}
