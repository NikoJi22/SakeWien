import { createHmac, timingSafeEqual } from "crypto";

export const ORDER_PHONE_COOKIE = "sake_order_phone_proof";

const TTL_SECONDS = 15 * 60;

function requireSecret(): string {
  const s = process.env.ORDER_PHONE_VERIFY_SECRET;
  if (!s) throw new Error("ORDER_PHONE_VERIFY_SECRET is not set");
  return s;
}

function optionalSecret(): string | null {
  return process.env.ORDER_PHONE_VERIFY_SECRET || null;
}

export function signVerifiedPhoneCookie(phoneE164: string): string {
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const payload = Buffer.from(JSON.stringify({ p: phoneE164, exp }), "utf8").toString("base64url");
  const sig = createHmac("sha256", requireSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function parseVerifiedPhoneCookie(token: string | undefined): { phoneE164: string } | null {
  const s = optionalSecret();
  if (!s) return null;
  if (!token || !token.includes(".")) return null;
  const i = token.lastIndexOf(".");
  const payload = token.slice(0, i);
  const sig = token.slice(i + 1);
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", s).update(payload).digest("base64url");
  let a: Buffer;
  let b: Buffer;
  try {
    a = Buffer.from(sig, "base64url");
    b = Buffer.from(expected, "base64url");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { p?: string; exp?: number };
    if (!data.p || typeof data.exp !== "number") return null;
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return { phoneE164: data.p };
  } catch {
    return null;
  }
}

export function verifiedPhoneCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: TTL_SECONDS
  };
}
