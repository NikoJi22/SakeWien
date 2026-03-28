import { NextResponse } from "next/server";
import { menuCategories } from "@/lib/menu-data";
import { readMenuFromDisk } from "@/lib/menu-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await readMenuFromDisk();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(menuCategories);
  }
}
