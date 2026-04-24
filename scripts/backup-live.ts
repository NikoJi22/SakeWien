import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { head } from "@vercel/blob";

type BackupPayload = {
  menu: unknown;
  gift: unknown;
  siteContent: unknown;
};

const MENU_BLOB_PATH = "sake-vienna/menu.json";
const GIFT_BLOB_PATH = "sake-vienna/gift-config.json";
const SITE_CONTENT_BLOB_PATH = "sake-vienna/site-content.json";

function stamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

async function readBlobJson(pathname: string, token: string) {
  const meta = await head(pathname, { token });
  const res = await fetch(meta.url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch blob ${pathname}: ${res.status}`);
  return res.json();
}

async function readFromBlob(token: string): Promise<BackupPayload> {
  const [menu, gift, siteContent] = await Promise.all([
    readBlobJson(MENU_BLOB_PATH, token),
    readBlobJson(GIFT_BLOB_PATH, token),
    readBlobJson(SITE_CONTENT_BLOB_PATH, token)
  ]);
  return { menu, gift, siteContent };
}

async function readApiJson(baseUrl: string, endpoint: string) {
  const url = `${baseUrl.replace(/\/+$/, "")}${endpoint}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

async function readFromLiveSite(baseUrl: string): Promise<BackupPayload> {
  const [menu, gift, siteContent] = await Promise.all([
    readApiJson(baseUrl, "/api/menu"),
    readApiJson(baseUrl, "/api/gift"),
    readApiJson(baseUrl, "/api/site-content")
  ]);
  return { menu, gift, siteContent };
}

async function main() {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  const liveSiteUrl = process.env.LIVE_SITE_URL?.trim();
  const ts = stamp();
  const outDir = join(process.cwd(), "backups");

  let payload: BackupPayload;
  let source: "blob" | "live-site";

  if (token) {
    payload = await readFromBlob(token);
    source = "blob";
  } else if (liveSiteUrl) {
    payload = await readFromLiveSite(liveSiteUrl);
    source = "live-site";
  } else {
    throw new Error(
      "Missing backup source. Provide BLOB_READ_WRITE_TOKEN (recommended) or LIVE_SITE_URL."
    );
  }

  await mkdir(outDir, { recursive: true });

  const menuFile = join(outDir, `menu-live-${ts}.json`);
  const giftFile = join(outDir, `gift-live-${ts}.json`);
  const siteFile = join(outDir, `site-content-live-${ts}.json`);

  await Promise.all([
    writeFile(menuFile, JSON.stringify(payload.menu, null, 2), "utf-8"),
    writeFile(giftFile, JSON.stringify(payload.gift, null, 2), "utf-8"),
    writeFile(siteFile, JSON.stringify(payload.siteContent, null, 2), "utf-8")
  ]);

  console.log(`[backup-live] Source: ${source}`);
  console.log(`[backup-live] Wrote: ${menuFile}`);
  console.log(`[backup-live] Wrote: ${giftFile}`);
  console.log(`[backup-live] Wrote: ${siteFile}`);
}

main().catch((error) => {
  console.error("[backup-live] Failed:", error);
  process.exitCode = 1;
});
