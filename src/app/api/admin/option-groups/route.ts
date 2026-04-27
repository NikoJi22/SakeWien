import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-auth";
import type { ReusableOption, ReusableOptionGroup } from "@/lib/menu-types";
import { writeOptionGroupsToDisk, readOptionGroupsFromDisk } from "@/lib/menu-store";

async function requireAdmin() {
  const store = await cookies();
  return verifyAdminSession(store.get(ADMIN_COOKIE)?.value);
}

function sanitizeGroups(raw: unknown): ReusableOptionGroup[] | null {
  if (!Array.isArray(raw)) return null;
  const out: ReusableOptionGroup[] = [];
  for (const g of raw) {
    if (!g || typeof g !== "object") continue;
    const rec = g as Record<string, unknown>;
    if (typeof rec.id !== "string" || !rec.name || typeof rec.name !== "object") continue;
    const name = rec.name as Record<string, unknown>;
    if (typeof name.de !== "string" || typeof name.en !== "string") continue;
    const optionsRaw = Array.isArray(rec.options) ? rec.options : [];
    const options: ReusableOption[] = [];
    for (const o of optionsRaw) {
      if (!o || typeof o !== "object") continue;
      const or = o as Record<string, unknown>;
      if (typeof or.id !== "string" || !or.label || typeof or.label !== "object") continue;
      const lb = or.label as Record<string, unknown>;
      if (typeof lb.de !== "string" || typeof lb.en !== "string") continue;
      const extra = typeof or.extraPriceEur === "number" ? or.extraPriceEur : Number(or.extraPriceEur);
      options.push({
        id: or.id.trim(),
        label: { de: lb.de.trim(), en: lb.en.trim() },
        ...(Number.isFinite(extra) && extra >= 0 ? { extraPriceEur: Math.round(extra * 100) / 100 } : {})
      });
    }
    const linkedCategoryIds = (Array.isArray(rec.linkedCategoryIds) ? rec.linkedCategoryIds : []).filter(
      (x): x is string => typeof x === "string"
    );
    const linkedDishIds = (Array.isArray(rec.linkedDishIds) ? rec.linkedDishIds : []).filter(
      (x): x is string => typeof x === "string"
    );
    const selectionType = rec.selectionType === "multiple" ? "multiple" : "single";
    const required = !!rec.required;
    const minSelections = Math.max(0, Number(rec.minSelections ?? (required ? 1 : 0)) || 0);
    const maxSelections =
      Math.max(minSelections, Number(rec.maxSelections ?? (selectionType === "single" ? 1 : Math.max(1, options.length))) || 0);
    out.push({
      id: rec.id.trim(),
      name: { de: name.de.trim(), en: name.en.trim() },
      required,
      selectionType,
      minSelections,
      maxSelections,
      options,
      linkedCategoryIds,
      linkedDishIds
    });
  }
  return out;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(await readOptionGroupsFromDisk());
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const sanitized = sanitizeGroups(body);
  if (!sanitized) return NextResponse.json({ error: "Invalid option group payload" }, { status: 400 });
  await writeOptionGroupsToDisk(sanitized);
  return NextResponse.json({ ok: true });
}
