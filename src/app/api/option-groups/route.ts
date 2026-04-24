import { NextResponse } from "next/server";
import { readOptionGroupsFromDisk } from "@/lib/menu-store";

const noStoreJson = { "Cache-Control": "private, no-store, must-revalidate" };

export async function GET() {
  try {
    const groups = await readOptionGroupsFromDisk();
    return NextResponse.json(groups, { headers: noStoreJson });
  } catch {
    return NextResponse.json([], { headers: noStoreJson });
  }
}
