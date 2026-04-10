import { NextResponse } from "next/server";
import { normalizeToE164 } from "@/lib/phone-normalize";
import {
  allowSendCodeForIp,
  allowSendCodeForPhone,
  clientIpFromRequest,
  markPhoneCodeSent
} from "@/lib/sms-rate-limit";
import { getTwilioVerifyClient, getVerifyServiceSid } from "@/lib/twilio-verify";

export const runtime = "nodejs";

const MIN_RESEND_MS = 60_000;

export async function POST(request: Request) {
  try {
    let body: { phone?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    const ip = clientIpFromRequest(request);
    if (!allowSendCodeForIp(ip)) {
      return NextResponse.json({ error: "rate_limit" }, { status: 429 });
    }

    const phoneE164 = normalizeToE164(String(body.phone ?? ""));
    if (!phoneE164) {
      return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
    }

    if (!allowSendCodeForPhone(phoneE164, MIN_RESEND_MS)) {
      return NextResponse.json({ error: "wait_before_resend" }, { status: 429 });
    }

    const client = getTwilioVerifyClient();
    const serviceSid = getVerifyServiceSid();

    await client.verify.v2.services(serviceSid).verifications.create({
      to: phoneE164,
      channel: "sms"
    });

    markPhoneCodeSent(phoneE164);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    if (msg.includes("is not set")) {
      console.error("[send-code] SMS (Twilio Verify) not configured:", msg);
      return NextResponse.json({ error: "sms_not_configured" }, { status: 503 });
    }
    console.error("[send-code] Twilio Verify request failed:", msg);
    return NextResponse.json({ error: "twilio_error", detail: msg }, { status: 502 });
  }
}
