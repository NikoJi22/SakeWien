import { viennaCalendarDateKey } from "@/lib/vienna-calendar";

/** Europe/Vienna — Öffnung / Slots */
export const ORDER_TIMEZONE = "Europe/Vienna";

/** Letzte Bestellannahme (Uhrzeit Wien, jeden Kalendertag) */
export const ORDER_CUTOFF_HOUR = 21;
export const ORDER_CUTOFF_MINUTE = 15;

/** Frühester Abhol- bzw. Lieferbeginn (Uhrzeit am gewählten Tag) */
export const EARLIEST_SLOT_HOUR = 11;
export const EARLIEST_SLOT_MINUTE = 30;

/** Letzter Slot (Schließung) */
export const LATEST_SLOT_HOUR = 21;
export const LATEST_SLOT_MINUTE = 30;

/** Liefer-PLZ: Wiener Bezirke 6, 7, 8, 15, 16 */
const DELIVERY_PLZ_RE = /^(106|107|108|115|116)\d{2}$/;

export const DELIVERY_TIME_ESTIMATE_DE = "ca. 45–60 Minuten (unverbindlich)";
export const DELIVERY_TIME_ESTIMATE_EN = "approx. 45–60 minutes (non-binding)";

export const OPENING_HOURS_PDF_DE = "Mi–Mo 11:00–21:30 Uhr · Di geschlossen";

const SHORT_DOW: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6
};

export function viennaDayOfWeekSunday0(now: Date): number {
  const s = new Intl.DateTimeFormat("en-US", {
    timeZone: ORDER_TIMEZONE,
    weekday: "short"
  }).format(now);
  return SHORT_DOW[s] ?? 0;
}

/** Dienstag = Ruhetag (Wien-Kalenderdatum) */
export function isClosedTuesdayViennaDateKey(dateKey: string): boolean {
  const dow = viennaWeekdaySunday0ForDateKey(dateKey);
  return dow === 2;
}

function viennaWeekdaySunday0ForDateKey(dateKey: string): number {
  const [ys, ms, ds] = dateKey.split("-").map((x) => Number(x));
  let t = Date.UTC(ys!, ms! - 1, ds!, 12, 0, 0);
  for (let i = 0; i < 48; i++) {
    if (viennaCalendarDateKey(new Date(t)) === dateKey) {
      return viennaDayOfWeekSunday0(new Date(t));
    }
    t += 3600000;
  }
  return viennaDayOfWeekSunday0(new Date(t));
}

export function viennaMinutesSinceMidnight(now: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: ORDER_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(now);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return h * 60 + m;
}

export function isAfterOrderCutoffVienna(now: Date = new Date()): boolean {
  return viennaMinutesSinceMidnight(now) >= ORDER_CUTOFF_HOUR * 60 + ORDER_CUTOFF_MINUTE;
}

/** Neue Bestellungen nur, solange Wien-Uhrzeit vor 21:15 ist. */
export function canAcceptNewOrdersVienna(now: Date = new Date()): boolean {
  return !isAfterOrderCutoffVienna(now);
}

export function nextViennaCalendarDateKey(dateKey: string): string {
  const [ys, ms, ds] = dateKey.split("-").map((x) => Number(x));
  let t = Date.UTC(ys!, ms! - 1, ds!, 12, 0, 0);
  if (viennaCalendarDateKey(new Date(t)) !== dateKey) {
    t = Date.UTC(ys!, ms! - 1, ds!, 0, 0, 0);
  }
  const before = dateKey;
  for (let step = 0; step < 96; step++) {
    t += 3600000;
    const next = viennaCalendarDateKey(new Date(t));
    if (next !== before) return next;
  }
  return viennaCalendarDateKey(new Date(t + 24 * 60 * 60 * 1000));
}

export function addViennaCalendarDays(dateKey: string, days: number): string {
  let k = dateKey;
  const n = Math.abs(days);
  const dir = days >= 0 ? 1 : -1;
  for (let i = 0; i < n; i++) {
    k = dir > 0 ? nextViennaCalendarDateKey(k) : prevViennaCalendarDateKey(k);
  }
  return k;
}

function prevViennaCalendarDateKey(dateKey: string): string {
  const [ys, ms, ds] = dateKey.split("-").map((x) => Number(x));
  let t = Date.UTC(ys!, ms! - 1, ds!, 12, 0, 0);
  if (viennaCalendarDateKey(new Date(t)) !== dateKey) {
    t = Date.UTC(ys!, ms! - 1, ds!, 23, 0, 0);
  }
  const before = dateKey;
  for (let step = 0; step < 96; step++) {
    t -= 3600000;
    const prev = viennaCalendarDateKey(new Date(t));
    if (prev !== before) return prev;
  }
  return viennaCalendarDateKey(new Date(t - 24 * 60 * 60 * 1000));
}

/** Frühestes Kalenderdatum für Abholung/Lieferung (Wien), Dienstage übersprungen; nach Cutoff erst Folgetag. */
export function earliestFulfillmentDateKeyVienna(now: Date = new Date()): string {
  let key = viennaCalendarDateKey(now);
  if (isAfterOrderCutoffVienna(now)) {
    key = nextViennaCalendarDateKey(key);
  }
  while (isClosedTuesdayViennaDateKey(key)) {
    key = nextViennaCalendarDateKey(key);
  }
  return key;
}

export function latestFulfillmentDateKeyVienna(now: Date = new Date(), horizonDays = 21): string {
  const start = earliestFulfillmentDateKeyVienna(now);
  return addViennaCalendarDays(start, horizonDays);
}

export function isAllowedDeliveryPostalCode(plz: string): boolean {
  const n = plz.replace(/\s/g, "");
  return DELIVERY_PLZ_RE.test(n);
}

export function earliestSlotMinutes(): number {
  return EARLIEST_SLOT_HOUR * 60 + EARLIEST_SLOT_MINUTE;
}

export function latestSlotMinutes(): number {
  return LATEST_SLOT_HOUR * 60 + LATEST_SLOT_MINUTE;
}

export function hhmmToMinutes(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  if (h > 23 || mi > 59) return null;
  return h * 60 + mi;
}

export function minutesToHHmm(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Mindest-Uhrzeit am gewählten Kalendertag (Wien): ≥ 11:30 und ≥ aktuelle Uhrzeit (gleicher Tag, minutengenau). */
export function minPickupTimeHHmmForDateKey(dateKey: string, now: Date = new Date()): string {
  const todayKey = viennaCalendarDateKey(now);
  const floor = earliestSlotMinutes();
  if (dateKey !== todayKey) {
    return minutesToHHmm(floor);
  }
  const nowM = viennaMinutesSinceMidnight(now);
  const need = Math.max(floor, nowM);
  return minutesToHHmm(Math.min(need, latestSlotMinutes()));
}

export function maxPickupTimeHHmm(): string {
  return minutesToHHmm(latestSlotMinutes());
}

const NAIVE_ISO = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})$/;

export function parseNaiveViennaIso(iso: string): { dateKey: string; minutes: number } | null {
  const m = NAIVE_ISO.exec(iso.trim());
  if (!m) return null;
  const dateKey = m[1]!;
  const minutes = Number(m[2]) * 60 + Number(m[3]!);
  return { dateKey, minutes };
}

export type FulfillmentValidationError =
  | "orders_closed_cutoff"
  | "pickup_invalid_datetime"
  | "pickup_closed_tuesday"
  | "pickup_date_out_of_range"
  | "pickup_time_out_of_range"
  | "delivery_invalid_date"
  | "delivery_closed_tuesday"
  | "delivery_date_out_of_range";

export function validatePickupNaiveIso(
  iso: string | undefined,
  now: Date = new Date()
): { ok: true } | { ok: false; error: FulfillmentValidationError } {
  if (!iso) return { ok: false, error: "pickup_invalid_datetime" };
  const parsed = parseNaiveViennaIso(iso);
  if (!parsed) return { ok: false, error: "pickup_invalid_datetime" };
  const { dateKey, minutes } = parsed;
  if (isClosedTuesdayViennaDateKey(dateKey)) {
    return { ok: false, error: "pickup_closed_tuesday" };
  }
  const minD = earliestFulfillmentDateKeyVienna(now);
  const maxD = latestFulfillmentDateKeyVienna(now);
  if (dateKey < minD || dateKey > maxD) {
    return { ok: false, error: "pickup_date_out_of_range" };
  }
  const minT = hhmmToMinutes(minPickupTimeHHmmForDateKey(dateKey, now))!;
  const maxT = latestSlotMinutes();
  if (minutes < minT || minutes > maxT) {
    return { ok: false, error: "pickup_time_out_of_range" };
  }
  return { ok: true };
}

export function validateDeliveryDateKey(
  dateKey: string | undefined,
  now: Date = new Date()
): { ok: true } | { ok: false; error: FulfillmentValidationError } {
  if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return { ok: false, error: "delivery_invalid_date" };
  }
  if (isClosedTuesdayViennaDateKey(dateKey)) {
    return { ok: false, error: "delivery_closed_tuesday" };
  }
  const minD = earliestFulfillmentDateKeyVienna(now);
  const maxD = latestFulfillmentDateKeyVienna(now);
  if (dateKey < minD || dateKey > maxD) {
    return { ok: false, error: "delivery_date_out_of_range" };
  }
  return { ok: true };
}

export function formatDateKeyDeShort(dateKey: string): string {
  const [y, mo, d] = dateKey.split("-").map((x) => Number(x));
  return `${String(d).padStart(2, "0")}.${String(mo).padStart(2, "0")}.${y}`;
}

export function formatDateKeyEnShort(dateKey: string): string {
  const [y, mo, d] = dateKey.split("-").map((x) => Number(x));
  return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
