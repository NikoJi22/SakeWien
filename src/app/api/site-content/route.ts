import { NextResponse } from "next/server";
import { readSiteContentFromDisk } from "@/lib/menu-store";
import { defaultSiteContent } from "@/lib/site-content-default";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await readSiteContentFromDisk();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(defaultSiteContent);
  }
}
