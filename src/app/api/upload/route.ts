import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-auth";
import { cookies } from "next/headers";

export const runtime = "nodejs";
const UPLOAD_FOLDER = "sake-menu";
const UPLOAD_TRANSFORMATION = "c_fill,g_auto,w_1200,h_900,q_auto,f_auto";

async function requireAdmin() {
  const store = await cookies();
  return verifyAdminSession(store.get(ADMIN_COOKIE)?.value);
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  console.info("[upload] Cloudinary env presence", {
    cloudName: cloudName ? "ja" : "nein",
    apiKey: apiKey ? "ja" : "nein",
    apiSecret: apiSecret ? "ja" : "nein"
  });

  if (!cloudName || !apiKey || !apiSecret) {
    console.error("[upload] Cloudinary env vars missing");
    return NextResponse.json({ error: "Cloudinary error: configuration missing" }, { status: 500 });
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = {
      folder: UPLOAD_FOLDER,
      timestamp,
      transformation: UPLOAD_TRANSFORMATION
    };
    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    return NextResponse.json({
      cloudName,
      apiKey,
      timestamp,
      folder: UPLOAD_FOLDER,
      transformation: UPLOAD_TRANSFORMATION,
      signature
    });
  } catch (error) {
    console.error("[upload] Failed to create Cloudinary signature", error);
    return NextResponse.json({ error: "Cloudinary Fehler: Signatur konnte nicht erstellt werden." }, { status: 500 });
  }
}
