import { NextResponse } from "next/server";
import { menuCategories } from "@/lib/menu-data";
import { readMenuFromDisk } from "@/lib/menu-store";
import { isLunchMenuActive, LUNCH_CATEGORY_ID } from "@/lib/order-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const lunchActive = isLunchMenuActive();
  const applyVisibility = (cats: typeof menuCategories) =>
    cats.filter((cat) => lunchActive || cat.id !== LUNCH_CATEGORY_ID);
  try {
    const data = await readMenuFromDisk();
    return NextResponse.json(applyVisibility(data));
  } catch {
    return NextResponse.json(applyVisibility(menuCategories));
  }
}
