import { NextResponse } from "next/server";
import path from "path";
import { mkdir, unlink, writeFile } from "fs/promises";
import sharp from "sharp";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-auth";
import { DISH_IMAGE_ASPECT, DISH_IMAGE_MAX_WIDTH, dishImageFileStem, isMenuUploadedImageUrl } from "@/lib/dish-image";
import { cookies } from "next/headers";

const MAX_BYTES = 12 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "menu");

async function requireAdmin() {
  const store = await cookies();
  return verifyAdminSession(store.get(ADMIN_COOKIE)?.value);
}

function resolveStoredFileFromPublicUrl(publicPath: string): string | null {
  const pathOnly = publicPath.split("?")[0] || publicPath;
  if (!isMenuUploadedImageUrl(pathOnly)) return null;
  const relative = pathOnly.slice("/uploads/menu/".length);
  if (!relative || relative !== path.posix.basename(relative)) return null;
  if (!/^[a-zA-Z0-9_.-]+\.webp$/.test(relative)) return null;
  const abs = path.join(UPLOAD_DIR, relative);
  const resolved = path.resolve(abs);
  if (!resolved.startsWith(path.resolve(UPLOAD_DIR))) return null;
  return resolved;
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const itemId = form.get("itemId");
  const file = form.get("image");
  if (typeof itemId !== "string" || !itemId.trim()) {
    return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
  }
  if (!(file instanceof Blob) || file.size === 0) {
    return NextResponse.json({ error: "Missing image" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image too large (max 12 MB)" }, { status: 400 });
  }

  const mime = file.type || "";
  if (!mime.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const targetH = Math.round(DISH_IMAGE_MAX_WIDTH / DISH_IMAGE_ASPECT);

  const webpBuffer = await sharp(buffer)
    .rotate()
    .resize(DISH_IMAGE_MAX_WIDTH, targetH, {
      fit: "cover",
      position: "attention"
    })
    .webp({ quality: 82, effort: 4, smartSubsample: true })
    .toBuffer();

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${dishImageFileStem(itemId.trim())}.webp`;
  const outPath = path.join(UPLOAD_DIR, filename);
  await writeFile(outPath, webpBuffer);

  /** Gleicher Pfad bei jedem Upload — Cache-Buster damit Browser & Next/Image die neue Datei laden */
  const url = `/uploads/menu/${filename}?v=${Date.now()}`;
  return NextResponse.json({ url });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const publicPath = searchParams.get("url");
  if (!publicPath) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const abs = resolveStoredFileFromPublicUrl(publicPath);
  if (!abs) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    await unlink(abs);
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code !== "ENOENT") {
      return NextResponse.json({ error: "Could not delete file" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
