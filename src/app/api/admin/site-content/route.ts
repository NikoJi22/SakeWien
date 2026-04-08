import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-auth";
import type { SiteContentConfig } from "@/lib/menu-types";
import { readSiteContentFromDisk, writeSiteContentToDisk } from "@/lib/menu-store";
import { defaultSiteContent } from "@/lib/site-content-default";
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
  if (!hero || !cards) return false;
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

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json(await readSiteContentFromDisk());
  } catch {
    return NextResponse.json(defaultSiteContent);
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
    await writeSiteContentToDisk(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/site-content] Failed to persist site content", error);
    return NextResponse.json({ error: "Write failed while saving website content." }, { status: 500 });
  }
}
