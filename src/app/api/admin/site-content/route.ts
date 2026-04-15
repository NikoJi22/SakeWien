import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-auth";
import type { SiteContentConfig } from "@/lib/menu-types";
import { readSiteContentFromDisk, writeSiteContentToDisk } from "@/lib/menu-store";
import { normalizeSiteContentConfig } from "@/lib/site-content";
import { cookies } from "next/headers";

function isLocalizedText(v: unknown): v is { en: string; de: string } {
  if (!v || typeof v !== "object") return false;
  const x = v as { en?: unknown; de?: unknown };
  return typeof x.en === "string" && typeof x.de === "string";
}

function isSiteContentConfig(v: unknown): v is SiteContentConfig {
  if (!v || typeof v !== "object") return false;
  const c = v as Record<string, unknown>;
  const hero = c.hero as Record<string, unknown> | undefined;
  const cards = c.cards as Record<string, unknown> | undefined;
  const ordering = c.ordering as Record<string, unknown> | undefined;
  if (!hero || !cards) return false;
  if (!ordering) return false;
  const vacationMode = ordering.vacationMode as Record<string, unknown> | undefined;
  if (
    !vacationMode ||
    typeof vacationMode.active !== "boolean" ||
    typeof vacationMode.startDate !== "string" ||
    typeof vacationMode.endDate !== "string"
  ) {
    return false;
  }
  const order = cards.order as Record<string, unknown> | undefined;
  const reservation = cards.reservation as Record<string, unknown> | undefined;
  const about = cards.about as Record<string, unknown> | undefined;
  return (
    isLocalizedText(hero.title) &&
    typeof hero.mainImage === "string" &&
    !!order &&
    !!reservation &&
    !!about &&
    isLocalizedText(order.label) &&
    typeof order.image === "string" &&
    isLocalizedText(reservation.label) &&
    typeof reservation.image === "string" &&
    isLocalizedText(about.label) &&
    typeof about.image === "string"
  );
}

async function requireAdmin() {
  const store = await cookies();
  return verifyAdminSession(store.get(ADMIN_COOKIE)?.value);
}

const noStoreJson = { "Cache-Control": "private, no-store, must-revalidate" };

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const stored = await readSiteContentFromDisk();
    return NextResponse.json(normalizeSiteContentConfig(stored), { headers: noStoreJson });
  } catch (err) {
    console.error("[admin/site-content] GET: storage read failed — not using built-in default images.", err);
    return NextResponse.json(
      { error: "site_content_load_failed", message: "Could not load site content from Blob/disk." },
      { status: 502, headers: noStoreJson }
    );
  }
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    console.error("[admin/site-content] Invalid JSON payload", error);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!isSiteContentConfig(body)) {
    return NextResponse.json({ error: "Invalid site content payload" }, { status: 400 });
  }
  try {
    await writeSiteContentToDisk(normalizeSiteContentConfig(body));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/site-content] Failed to persist site content", error);
    return NextResponse.json({ error: "Write failed while saving website content." }, { status: 500 });
  }
}
