import type { SiteContentConfig } from "@/lib/menu-types";
import { defaultSiteContent } from "@/lib/site-content-default";
import { viennaCalendarDateKey } from "@/lib/vienna-calendar";

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

function validDateKey(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return DATE_KEY_RE.test(trimmed) ? trimmed : "";
}

export function normalizeSiteContentConfig(input: unknown): SiteContentConfig {
  const base = defaultSiteContent;
  if (!input || typeof input !== "object") return base;
  const raw = input as Partial<SiteContentConfig>;
  const vacationRaw = raw.ordering?.vacationMode;
  return {
    ...base,
    ...raw,
    hero: {
      ...base.hero,
      ...(raw.hero ?? {}),
      title: {
        ...base.hero.title,
        ...(raw.hero?.title ?? {})
      }
    },
    cards: {
      ...base.cards,
      order: {
        ...base.cards.order,
        ...(raw.cards?.order ?? {}),
        label: {
          ...base.cards.order.label,
          ...(raw.cards?.order?.label ?? {})
        }
      },
      reservation: {
        ...base.cards.reservation,
        ...(raw.cards?.reservation ?? {}),
        label: {
          ...base.cards.reservation.label,
          ...(raw.cards?.reservation?.label ?? {})
        }
      },
      about: {
        ...base.cards.about,
        ...(raw.cards?.about ?? {}),
        label: {
          ...base.cards.about.label,
          ...(raw.cards?.about?.label ?? {})
        }
      }
    },
    ordering: {
      vacationMode: {
        active: Boolean(vacationRaw?.active),
        startDate: validDateKey(vacationRaw?.startDate),
        endDate: validDateKey(vacationRaw?.endDate)
      }
    }
  };
}

export function isVacationModeActive(
  vacation: SiteContentConfig["ordering"]["vacationMode"],
  now: Date = new Date()
): boolean {
  if (!vacation.active) return false;
  const start = validDateKey(vacation.startDate);
  const end = validDateKey(vacation.endDate);
  if (!start || !end) return false;
  if (start > end) return false;
  const today = viennaCalendarDateKey(now);
  return today >= start && today <= end;
}
