import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { normalizeToE164 } from "@/lib/phone-normalize";
import {
  ORDER_PHONE_COOKIE,
  signVerifiedPhoneCookie,
  verifiedPhoneCookieOptions
} from "@/lib/order-phone-cookie";
import { getTwilioVerifyClient, getVerifyServiceSid } from "@/lib/twilio-verify";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    let body: { phone?: string; code?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    const phoneE164 = normalizeToE164(String(body.phone ?? ""));
    if (!phoneE164) {
      return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
    }

    const code = String(body.code ?? "").trim();
    if (!code || code.length < 4) {
      return NextResponse.json({ error: "invalid_code" }, { status: 400 });
    }

    const client = getTwilioVerifyClient();
    const serviceSid = getVerifyServiceSid();

    const check = await client.verify.v2.services(serviceSid).verificationChecks.create({
      to: phoneE164,
      code
    });

    if (check.status !== "approved") {
      return NextResponse.json({ error: "code_rejected" }, { status: 400 });
    }

    const token = signVerifiedPhoneCookie(phoneE164);
    const store = await cookies();
    store.set(ORDER_PHONE_COOKIE, token, verifiedPhoneCookieOptions());

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    if (msg.includes("ORDER_PHONE_VERIFY_SECRET")) {
      console.error("[verify-code] ORDER_PHONE_VERIFY_SECRET missing — cannot set verified-phone cookie for delivery");
      return NextResponse.json({ error: "delivery_phone_secret_missing" }, { status: 503 });
    }
    if (msg.includes("is not set")) {
      console.error("[verify-code] SMS (Twilio Verify) not configured:", msg);
      return NextResponse.json({ error: "sms_not_configured" }, { status: 503 });
    }
    console.error("[verify-code] verification failed:", msg);
    return NextResponse.json({ error: "verify_failed", detail: msg }, { status: 400 });
  }
}
