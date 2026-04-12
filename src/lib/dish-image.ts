/** Default menu photo when no upload exists (legacy; avoid for new deployments — prefer `NEXT_PUBLIC_DISH_PLACEHOLDER_URL`). */
export const DEFAULT_DISH_PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=900&q=80";

/** Platzhalter nach „Bild löschen“: eigene Cloudinary-URL per Env, sonst Legacy-Unsplash. */
export function resolvedDishPlaceholderUrl(): string {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_DISH_PLACEHOLDER_URL?.trim()) {
    const u = process.env.NEXT_PUBLIC_DISH_PLACEHOLDER_URL.trim();
    if (/^https:\/\//i.test(u)) return u;
  }
  return DEFAULT_DISH_PLACEHOLDER_IMAGE;
}

/** Fixed crop aspect for dish cards (width / height). */
export const DISH_IMAGE_ASPECT = 4 / 3;

/** Max width after processing on the server (height follows aspect). */
export const DISH_IMAGE_MAX_WIDTH = 1200;

const LOCAL_UPLOAD_URL_PREFIX = "/uploads/menu/";
const CLOUDINARY_HOST = "res.cloudinary.com";

export function isMenuUploadedImageUrl(url: string): boolean {
  const pathOnly = url.split("?")[0] || url;
  if (pathOnly.startsWith(LOCAL_UPLOAD_URL_PREFIX)) return true;
  try {
    const parsed = new URL(pathOnly);
    return parsed.hostname === CLOUDINARY_HOST;
  } catch {
    return false;
  }
}

/** True when the URL is the built-in or env-configured placeholder (ignores query string). */
export function isDefaultDishPlaceholderUrl(url: string): boolean {
  const u = url.split("?")[0] || url;
  const d = DEFAULT_DISH_PLACEHOLDER_IMAGE.split("?")[0] || DEFAULT_DISH_PLACEHOLDER_IMAGE;
  if (u === d) return true;
  const env = process.env.NEXT_PUBLIC_DISH_PLACEHOLDER_URL?.trim();
  if (env) {
    const e = env.split("?")[0] || env;
    if (u === e) return true;
  }
  return false;
}

