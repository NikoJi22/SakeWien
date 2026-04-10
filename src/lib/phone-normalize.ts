import { parsePhoneNumber } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";

const DEFAULT_REGION = (process.env.DEFAULT_PHONE_REGION as CountryCode) || "AT";
const AT_MOBILE_E164_RE = /^\+436\d{7,12}$/;

/** Returns E.164 or null if invalid. */
export function normalizeToE164(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const n = parsePhoneNumber(trimmed, DEFAULT_REGION);
    if (!n?.isValid()) return null;
    const e164 = n.format("E.164");
    // Delivery SMS flow accepts Austrian mobile numbers only.
    if (!AT_MOBILE_E164_RE.test(e164)) return null;
    return e164;
  } catch {
    return null;
  }
}
