import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-auth";
import { cookies } from "next/headers";

const MAX_BYTES = 12 * 1024 * 1024;
export const runtime = "nodejs";

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

  let form: FormData;
  try {
    form = await request.formData();
  } catch (error) {
    console.error("[upload] Invalid form data", error);
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof Blob) || file.size === 0) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Datei zu groß (max. 12 MB)." }, { status: 413 });
  }

  if (!(file.type || "").startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });

  try {
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "sake-menu",
          resource_type: "image",
          transformation: [
            {
              width: 1200,
              height: 900,
              crop: "fill",
              gravity: "auto",
              quality: "auto",
              fetch_format: "auto"
            }
          ]
        },
        (error, uploadResult) => {
          if (error) return reject(error);
          if (!uploadResult?.secure_url) return reject(new Error("Missing secure_url from Cloudinary"));
          resolve({ secure_url: uploadResult.secure_url });
        }
      );

      stream.on("error", reject);
      stream.end(buffer);
    });

    return NextResponse.json({ secure_url: result.secure_url });
  } catch (error) {
    console.error("[upload] Cloudinary upload failed", error);
    return NextResponse.json({ error: "Cloudinary Fehler: Upload fehlgeschlagen." }, { status: 502 });
  }
}
