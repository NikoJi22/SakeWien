import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-auth";
import type { GiftConfig } from "@/lib/menu-types";
import { readGiftFromDisk, writeGiftToDisk } from "@/lib/menu-store";
import { cookies } from "next/headers";

function isGiftConfig(x: unknown): x is GiftConfig {
  if (!x || typeof x !== "object") return false;
  const g = x as GiftConfig;
  return (
    typeof g.thresholdEur === "number" &&
    g.message &&
    typeof g.message.en === "string" &&
    typeof g.message.de === "string"
  );
}

async function requireAdmin() {
  const store = await cookies();
  return verifyAdminSession(store.get(ADMIN_COOKIE)?.value);
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json(await readGiftFromDisk());
  } catch {
    return NextResponse.json({ error: "No gift config" }, { status: 404 });
  }
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isGiftConfig(body)) {
    return NextResponse.json({ error: "Invalid gift config" }, { status: 400 });
  }

  await writeGiftToDisk(body);
  return NextResponse.json({ ok: true });
}
