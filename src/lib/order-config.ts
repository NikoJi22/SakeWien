export const DELIVERY_MIN_ORDER_EUR = 15;
export const LUNCH_CATEGORY_ID = "lunch";

export const lunchConfig = {
  startHour: 11,
  endHour: 15,
  holidayDates: [] as string[]
};

const LUNCH_TIMEZONE = "Europe/Vienna";

function getViennaDateParts(now: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: LUNCH_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false
  });

  const parts = formatter.formatToParts(now);
  const year = parts.find((p) => p.type === "year")?.value ?? "0000";
  const month = parts.find((p) => p.type === "month")?.value ?? "00";
  const day = parts.find((p) => p.type === "day")?.value ?? "00";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");

  return {
    yyyyMmDd: `${year}-${month}-${day}`,
    hour
  };
}

export function isLunchMenuActive(now: Date = new Date()): boolean {
  const { yyyyMmDd, hour } = getViennaDateParts(now);
  if (lunchConfig.holidayDates.includes(yyyyMmDd)) return false;
  return hour >= lunchConfig.startHour && hour < lunchConfig.endHour;
}
