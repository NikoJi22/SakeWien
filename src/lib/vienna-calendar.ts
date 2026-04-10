/** Kalenderdatum (YYYY-MM-DD) in Europe/Vienna — für Abholung „nur heute“ unabhängig von UTC. */
export function viennaCalendarDateKey(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Vienna",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value ?? "0000";
  const m = parts.find((p) => p.type === "month")?.value ?? "00";
  const day = parts.find((p) => p.type === "day")?.value ?? "00";
  return `${y}-${m}-${day}`;
}

/** Abholzeit-Payload: heute (Wien) + Uhrzeit HH:mm */
export function viennaTodayPickupIso(hhmm: string): string {
  return `${viennaCalendarDateKey(new Date())}T${hhmm}:00`;
}

const PICKUP_DATE_PREFIX = /^(\d{4}-\d{2}-\d{2})T\d{2}:\d{2}:\d{2}/;

export function pickupDeclaredDateKey(pickupTime: string): string | null {
  const m = PICKUP_DATE_PREFIX.exec(pickupTime.trim());
  return m ? m[1] : null;
}

export function isPickupDateSameViennaToday(pickupTime: string, now: Date = new Date()): boolean {
  const declared = pickupDeclaredDateKey(pickupTime);
  if (!declared) return false;
  return declared === viennaCalendarDateKey(now);
}
