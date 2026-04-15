import { NextResponse } from "next/server";
import { orderGiftConfig } from "@/config/order-gift";
import { normalizeGiftConfig } from "@/lib/gift-config";
import { readGiftFromDisk } from "@/lib/menu-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await readGiftFromDisk();
    return NextResponse.json(normalizeGiftConfig(data));
  } catch {
    return NextResponse.json(
      normalizeGiftConfig({
        message: { ...orderGiftConfig.message },
        freeItemIds: []
      })
    );
  }
}
