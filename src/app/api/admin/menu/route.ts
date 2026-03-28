import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-auth";
import type { MenuCategory } from "@/lib/menu-types";
import { readMenuFromDisk, writeMenuToDisk } from "@/lib/menu-store";
import { menuCategories } from "@/lib/menu-data";
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
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(menuCategories);
  }
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isMenuCategoryArray(body)) {
    return NextResponse.json({ error: "Invalid menu payload" }, { status: 400 });
  }

  for (const cat of body) {
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
    }
  }

  await writeMenuToDisk(body);
  return NextResponse.json({ ok: true });
}
