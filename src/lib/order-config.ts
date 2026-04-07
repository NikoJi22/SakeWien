export const DELIVERY_MIN_ORDER_EUR = 15;
export const LUNCH_CATEGORY_ID = "lunch";

export const lunchConfig = {
  startHour: 11,
  endHour: 15,
  holidayDates: [] as string[]
};

export function isLunchMenuActive(now: Date = new Date()): boolean {
  const yyyyMmDd = now.toISOString().slice(0, 10);
  if (lunchConfig.holidayDates.includes(yyyyMmDd)) return false;
  const hour = now.getHours();
  return hour >= lunchConfig.startHour && hour < lunchConfig.endHour;
}
