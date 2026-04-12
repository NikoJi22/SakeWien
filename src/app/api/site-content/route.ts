import { NextResponse } from "next/server";
import { readSiteContentFromDisk } from "@/lib/menu-store";

export const dynamic = "force-dynamic";

const noStoreJson = { "Cache-Control": "private, no-store, must-revalidate" };

export async function GET() {
  try {
    const data = await readSiteContentFromDisk();
    return NextResponse.json(data, { headers: noStoreJson });
  } catch (err) {
    console.error("[api/site-content] Storage read failed (no built-in Unsplash fallback).", err);
    return NextResponse.json(
      { error: "site_content_unavailable", message: "Site content could not be loaded from storage." },
      { status: 503, headers: noStoreJson }
    );
  }
}
