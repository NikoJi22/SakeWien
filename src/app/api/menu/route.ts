import { NextResponse } from "next/server";
import { readMenuFromDisk } from "@/lib/menu-store";

export const dynamic = "force-dynamic";

const noStoreJson = { "Cache-Control": "private, no-store, must-revalidate" };

export async function GET() {
  try {
    const data = await readMenuFromDisk();
    return NextResponse.json(data, { headers: noStoreJson });
  } catch (err) {
    console.error("[api/menu] Menu storage read failed (no seed fallback — fix Blob/token or disk fallback).", err);
    return NextResponse.json(
      { error: "menu_unavailable", message: "Menu could not be loaded from storage." },
      { status: 503, headers: noStoreJson }
    );
  }
}
