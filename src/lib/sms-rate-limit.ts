type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const lastSendByPhone = new Map<string, number>();

function windowedAllow(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now > b.resetAt) {
    b = { count: 0, resetAt: now + windowMs };
    buckets.set(key, b);
  }
  if (b.count >= max) return false;
  b.count += 1;
  return true;
}

/** Per-IP limit for send-code (spam). */
export function allowSendCodeForIp(ip: string): boolean {
  return windowedAllow(`ip:${ip}`, 15, 60 * 60 * 1000);
}

/** Per normalized phone: min seconds between sends. */
export function allowSendCodeForPhone(phoneE164: string, minIntervalMs: number): boolean {
  const now = Date.now();
  const last = lastSendByPhone.get(phoneE164) ?? 0;
  if (now - last < minIntervalMs) return false;
  return true;
}

export function markPhoneCodeSent(phoneE164: string) {
  lastSendByPhone.set(phoneE164, Date.now());
}

export function clientIpFromRequest(request: Request): string {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
