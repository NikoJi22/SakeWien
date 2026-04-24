import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-auth";
import type { LunchStarterChoice, LunchStarterOption, MenuCategory, MenuItem, MenuItemVariant } from "@/lib/menu-types";
import { normalizeAllergenCodes } from "@/lib/allergen-codes";
import { DEFAULT_DISH_PLACEHOLDER_IMAGE } from "@/lib/dish-image";
import { readMenuFromDisk, writeMenuToDisk } from "@/lib/menu-store";
import { cookies } from "next/headers";

function isMenuCategoryArray(x: unknown): x is MenuCategory[] {
  if (!Array.isArray(x)) return false;
  return x.every(
    (c) =>
      c &&
      typeof c === "object" &&
      typeof (c as MenuCategory).id === "string" &&
      (c as MenuCategory).title &&
      typeof (c as MenuCategory).title.en === "string" &&
      typeof (c as MenuCategory).title.de === "string" &&
      Array.isArray((c as MenuCategory).items)
  );
}

function sanitizeLunchStarterChoice(raw: unknown): LunchStarterChoice | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as Record<string, unknown>;
  const label = r.label;
  if (!label || typeof label !== "object") return undefined;
  const lb = label as Record<string, unknown>;
  if (typeof lb.en !== "string" || typeof lb.de !== "string") return undefined;
  const options = r.options;
  if (!Array.isArray(options) || options.length === 0) return undefined;
  const cleaned: LunchStarterOption[] = [];
  for (const o of options) {
    if (!o || typeof o !== "object") continue;
    const rec = o as Record<string, unknown>;
    if (typeof rec.id !== "string" || !rec.name || typeof rec.name !== "object") continue;
    const n = rec.name as Record<string, unknown>;
    if (typeof n.en !== "string" || typeof n.de !== "string") continue;
    const id = rec.id.trim();
    if (!id) continue;
    cleaned.push({ id, name: { de: n.de.trim(), en: n.en.trim() } });
  }
  if (cleaned.length === 0) return undefined;
  return { label: { de: lb.de.trim(), en: lb.en.trim() }, options: cleaned };
}

function sanitizeVariants(raw: unknown): MenuItemVariant[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const cleaned: MenuItemVariant[] = [];
  for (const v of raw) {
    if (!v || typeof v !== "object") continue;
    const rec = v as Record<string, unknown>;
    if (typeof rec.id !== "string" || !rec.label || typeof rec.label !== "object") continue;
    const lb = rec.label as Record<string, unknown>;
    if (typeof lb.de !== "string" || typeof lb.en !== "string") continue;
    const priceRaw = rec.priceEur;
    const price = typeof priceRaw === "number" ? priceRaw : Number(priceRaw);
    if (!Number.isFinite(price) || price < 0) continue;
    const id = rec.id.trim();
    if (!id) continue;
    cleaned.push({
      id,
      label: { de: lb.de.trim(), en: lb.en.trim() },
      priceEur: Math.round(price * 100) / 100
    });
  }
  return cleaned.length ? cleaned : undefined;
}

async function requireAdmin() {
  const store = await cookies();
  return verifyAdminSession(store.get(ADMIN_COOKIE)?.value);
}

function normalizeMenuItemImage(raw: unknown): string {
  if (typeof raw !== "string") return DEFAULT_DISH_PLACEHOLDER_IMAGE;
  const t = raw.trim();
  if (!t) return DEFAULT_DISH_PLACEHOLDER_IMAGE;
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith("/")) return t;
  return DEFAULT_DISH_PLACEHOLDER_IMAGE;
}

const noStoreJson = { "Cache-Control": "private, no-store, must-revalidate" };

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await readMenuFromDisk();
    return NextResponse.json(data, { headers: noStoreJson });
  } catch (err) {
    console.error("[admin/menu] GET: storage read failed — not falling back to TypeScript seed (would reset images).", err);
    return NextResponse.json(
      { error: "menu_load_failed", message: "Could not load menu from Blob/disk. Check BLOB_READ_WRITE_TOKEN and logs." },
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
    console.error("[admin/menu] Invalid JSON payload", error);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isMenuCategoryArray(body)) {
    return NextResponse.json({ error: "Invalid menu payload" }, { status: 400 });
  }

  for (const cat of body) {
    for (const item of cat.items) {
      if (!item.id || !item.name || typeof item.priceEur !== "number" || !item.description) {
        return NextResponse.json({ error: `Invalid item in category ${cat.id}` }, { status: 400 });
      }
      if (item.allergens !== undefined) {
        if (!Array.isArray(item.allergens) || !item.allergens.every((x) => typeof x === "string")) {
          return NextResponse.json({ error: `Invalid allergens for item ${item.id}` }, { status: 400 });
        }
      }
    }
  }

  try {
    const sanitized = body.map((cat) => ({
      ...cat,
      items: cat.items.map((item) => {
        const mi = item as MenuItem;
        const allergens = mi.allergens?.length ? normalizeAllergenCodes(mi.allergens) : undefined;
        const lunchStarterChoice = sanitizeLunchStarterChoice(mi.lunchStarterChoice);
        const variants = sanitizeVariants((mi as { variants?: unknown }).variants);
        const spicyLevel =
          mi.spicyLevel === 2 || mi.spicyLevel === 1 || mi.spicyLevel === 0
            ? mi.spicyLevel
            : mi.spicy
              ? 1
              : 0;
        return {
          ...mi,
          image: normalizeMenuItemImage(mi.image),
          ...(allergens?.length ? { allergens } : { allergens: undefined }),
          spicyLevel,
          lunchStarterChoice,
          variants
        };
      })
    }));

    await writeMenuToDisk(sanitized);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/menu] Failed to persist menu", error);
    return NextResponse.json(
      { error: "Write failed while saving menu. Check server logs for details." },
      { status: 500 }
    );
  }
}
