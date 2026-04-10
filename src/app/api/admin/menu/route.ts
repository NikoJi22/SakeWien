import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-auth";
import type { LunchStarterChoice, LunchStarterOption, MenuCategory, MenuItem } from "@/lib/menu-types";
import { normalizeAllergenCodes } from "@/lib/allergen-codes";
import { readMenuFromDisk, writeMenuToDisk } from "@/lib/menu-store";
import { menuCategories } from "@/lib/menu-data";
import { LUNCH_CATEGORY_ID } from "@/lib/order-config";
import { cookies } from "next/headers";

/** Gespeicherte Menüs (z. B. älterer Blob-Export) können ohne Lunch-Kategorie sein — Admin soll sie immer bearbeiten können. */
function ensureLunchCategoryForAdmin(cats: MenuCategory[]): MenuCategory[] {
  if (cats.some((c) => c.id === LUNCH_CATEGORY_ID)) return cats;
  const fallback = menuCategories.find((c) => c.id === LUNCH_CATEGORY_ID);
  if (!fallback) return cats;
  return [...cats, JSON.parse(JSON.stringify(fallback)) as MenuCategory];
}

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

async function requireAdmin() {
  const store = await cookies();
  return verifyAdminSession(store.get(ADMIN_COOKIE)?.value);
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await readMenuFromDisk();
    return NextResponse.json(ensureLunchCategoryForAdmin(data));
  } catch {
    return NextResponse.json(ensureLunchCategoryForAdmin(menuCategories));
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

  const bodyWithLunch = ensureLunchCategoryForAdmin(body);

  for (const cat of bodyWithLunch) {
    for (const item of cat.items) {
      if (
        !item.id ||
        !item.name ||
        typeof item.priceEur !== "number" ||
        !item.image ||
        !item.description
      ) {
        return NextResponse.json({ error: `Invalid item in category ${cat.id}` }, { status: 400 });
      }
      if (item.allergens !== undefined) {
        if (!Array.isArray(item.allergens) || !item.allergens.every((x) => typeof x === "string")) {
          return NextResponse.json({ error: `Invalid allergens for item ${item.id}` }, { status: 400 });
        }
      }
      if (typeof item.image !== "string" || !/^https?:\/\//i.test(item.image)) {
        return NextResponse.json({ error: `Invalid image URL for item ${item.id}` }, { status: 400 });
      }
    }
  }

  try {
    const sanitized = bodyWithLunch.map((cat) => ({
      ...cat,
      items: cat.items.map((item) => {
        const mi = item as MenuItem;
        const allergens = mi.allergens?.length ? normalizeAllergenCodes(mi.allergens) : undefined;
        const lunchStarterChoice = sanitizeLunchStarterChoice(mi.lunchStarterChoice);
        const spicyLevel =
          mi.spicyLevel === 2 || mi.spicyLevel === 1 || mi.spicyLevel === 0
            ? mi.spicyLevel
            : mi.spicy
              ? 1
              : 0;
        return {
          ...mi,
          ...(allergens?.length ? { allergens } : { allergens: undefined }),
          spicyLevel,
          lunchStarterChoice
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
