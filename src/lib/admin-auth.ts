import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "sake_admin";

export function createAdminSessionToken(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
  if (!secret) return "";
  return createHmac("sha256", secret).update("sake-admin-session-v1").digest("hex");
}

export function verifyAdminSession(token: string | undefined): boolean {
  if (!token || !process.env.ADMIN_PASSWORD) return false;
  const expected = createAdminSessionToken();
  if (!expected) return false;
  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(token, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
