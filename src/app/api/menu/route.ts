import { NextResponse } from "next/server";
import { readMenuFromDisk } from "@/lib/menu-store";
import { isLunchMenuActive, LUNCH_CATEGORY_ID } from "@/lib/order-config";

export const dynamic = "force-dynamic";

const noStoreJson = { "Cache-Control": "private, no-store, must-revalidate" };

export async function GET() {
  try {
    const data = await readMenuFromDisk();
    // Frontend-only lunch visibility rule: outside lunch hours we hide lunch category for customers.
    const customerVisible = isLunchMenuActive()
      ? data
      : data.filter((category) => category.id !== LUNCH_CATEGORY_ID);
    return NextResponse.json(customerVisible, { headers: noStoreJson });
  } catch (err) {
    console.error("[api/menu] Menu storage read failed (no seed fallback — fix Blob/token or disk fallback).", err);
    return NextResponse.json(
      { error: "menu_unavailable", message: "Menu could not be loaded from storage." },
      { status: 503, headers: noStoreJson }
    );
  }
}
