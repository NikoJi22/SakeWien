import { NextResponse } from "next/server";
import { readMenuFromDisk } from "@/lib/menu-store";
import type { MenuCategory } from "@/lib/menu-types";
import { isLunchMenuActive, LUNCH_CATEGORY_ID } from "@/lib/order-config";

export const dynamic = "force-dynamic";

const noStoreJson = { "Cache-Control": "private, no-store, must-revalidate" };

export async function GET() {
  const lunchActive = isLunchMenuActive();
  const applyVisibility = (cats: MenuCategory[]) =>
    cats.filter((cat) => lunchActive || cat.id !== LUNCH_CATEGORY_ID);
  try {
    const data = await readMenuFromDisk();
    return NextResponse.json(applyVisibility(data), { headers: noStoreJson });
  } catch (err) {
    console.error("[api/menu] Menu storage read failed (no seed fallback — fix Blob/token or disk fallback).", err);
    return NextResponse.json(
      { error: "menu_unavailable", message: "Menu could not be loaded from storage." },
      { status: 503, headers: noStoreJson }
    );
  }
}
