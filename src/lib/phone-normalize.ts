import { parsePhoneNumber } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";

const DEFAULT_REGION = (process.env.DEFAULT_PHONE_REGION as CountryCode) || "AT";

/** Returns E.164 or null if invalid. */
export function normalizeToE164(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const n = parsePhoneNumber(trimmed, DEFAULT_REGION);
    if (!n?.isValid()) return null;
    return n.format("E.164");
  } catch {
    return null;
  }
}
