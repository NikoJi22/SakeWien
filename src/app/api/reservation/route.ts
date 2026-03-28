import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await sendMail({
      subject: "New Reservation - Sake Vienna",
      lines: [
        `Name: ${body.name || ""}`,
        `Phone: ${body.phone || ""}`,
        `Email: ${body.email || ""}`,
        `Guests: ${body.guests || ""}`,
        `Date: ${body.date || ""}`,
        `Time: ${body.time || ""}`,
        `Notes: ${body.notes || ""}`
      ]
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}
