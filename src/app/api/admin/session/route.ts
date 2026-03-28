import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-auth";
import { cookies } from "next/headers";

export async function GET() {
  const store = await cookies();
  const ok = verifyAdminSession(store.get(ADMIN_COOKIE)?.value);
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true });
}
