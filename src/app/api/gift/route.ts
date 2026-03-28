import { NextResponse } from "next/server";
import { orderGiftConfig } from "@/config/order-gift";
import { readGiftFromDisk } from "@/lib/menu-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await readGiftFromDisk();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      thresholdEur: orderGiftConfig.thresholdEur,
      message: { ...orderGiftConfig.message }
    });
  }
}
