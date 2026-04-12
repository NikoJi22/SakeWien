/**
 * Markenlogo aus `public/` (statisch, kein Cloudinary).
 * Cache-Bust: Query bei jedem echten Dateitausch erhöhen.
 * Hinweis: `public/sake-logo-mark.png` war zeitweise JPEG unter .png (kein Alpha) — siehe `scripts/generate-logo-png-alpha.mjs`.
 */
export const SITE_LOGO_MARK_PATH = "/sake-logo-mark.png?v=20260412";
