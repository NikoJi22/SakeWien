/** Default menu photo when no upload exists (matches seed / empty dish). */
export const DEFAULT_DISH_PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=900&q=80";

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

/** True when the URL is the built-in placeholder (ignores query string). */
export function isDefaultDishPlaceholderUrl(url: string): boolean {
  const u = url.split("?")[0] || url;
  const d = DEFAULT_DISH_PLACEHOLDER_IMAGE.split("?")[0] || DEFAULT_DISH_PLACEHOLDER_IMAGE;
  return u === d;
}

