import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";

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
    const body = (await request.json()) as OrderBody;

    const linesText = body.lines
      .map((l) => `  - ${l.name} x${l.quantity} @ €${l.unitPriceEur.toFixed(2)} = €${l.lineTotalEur.toFixed(2)}`)
      .join("\n");

    const extra: string[] = [
      `Fulfillment: ${body.fulfillment}`,
      `Name: ${body.name || ""}`,
      `Phone: ${body.phone || ""}`,
      `Email: ${body.email || ""}`
    ];

    if (body.fulfillment === "delivery") {
      extra.push(`Address: ${body.address || ""}`);
      extra.push(`Delivery time: ${body.deliveryTime || ""}`);
      extra.push(`Payment: ${body.paymentMethod || ""}`);
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

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}
