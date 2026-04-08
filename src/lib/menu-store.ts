import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { head, put } from "@vercel/blob";
import type { GiftConfig, MenuCategory, SiteContentConfig } from "./menu-types";

const DATA_DIR = path.join(process.cwd(), "data");
const MENU_FILE = path.join(DATA_DIR, "menu.json");
const GIFT_FILE = path.join(DATA_DIR, "gift-config.json");
const SITE_CONTENT_FILE = path.join(DATA_DIR, "site-content.json");
const MENU_BLOB_PATH = "sake-vienna/menu.json";
const GIFT_BLOB_PATH = "sake-vienna/gift-config.json";
const SITE_CONTENT_BLOB_PATH = "sake-vienna/site-content.json";

function hasBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function getBlobToken(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is missing");
  return token;
}

function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

async function readJsonFromBlob<T>(pathname: string): Promise<T> {
  const blobMeta = await head(pathname, { token: getBlobToken() });
  const res = await fetch(blobMeta.url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch blob ${pathname}: ${res.status}`);
  return (await res.json()) as T;
}

async function writeJsonToBlob(pathname: string, data: unknown): Promise<void> {
  await put(pathname, JSON.stringify(data, null, 2), {
    token: getBlobToken(),
    access: "public",
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: "application/json"
  });
}

export async function readMenuFromDisk(): Promise<MenuCategory[]> {
  if (hasBlobStorage()) {
    const data = await readJsonFromBlob<MenuCategory[]>(MENU_BLOB_PATH);
    if (!Array.isArray(data)) throw new Error("Invalid menu blob shape");
    return data;
  }
  const raw = await readFile(MENU_FILE, "utf-8");
  const data = JSON.parse(raw) as MenuCategory[];
  if (!Array.isArray(data)) throw new Error("Invalid menu.json shape");
  return data;
}

export async function writeMenuToDisk(categories: MenuCategory[]): Promise<void> {
  if (hasBlobStorage()) {
    await writeJsonToBlob(MENU_BLOB_PATH, categories);
    return;
  }
  if (isProductionRuntime()) {
    throw new Error("BLOB_READ_WRITE_TOKEN missing in production; refusing local filesystem write for menu");
  }
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(MENU_FILE, JSON.stringify(categories, null, 2), "utf-8");
}

export async function readGiftFromDisk(): Promise<GiftConfig> {
  if (hasBlobStorage()) {
    return await readJsonFromBlob<GiftConfig>(GIFT_BLOB_PATH);
  }
  const raw = await readFile(GIFT_FILE, "utf-8");
  return JSON.parse(raw) as GiftConfig;
}

export async function writeGiftToDisk(config: GiftConfig): Promise<void> {
  if (hasBlobStorage()) {
    await writeJsonToBlob(GIFT_BLOB_PATH, config);
    return;
  }
  if (isProductionRuntime()) {
    throw new Error("BLOB_READ_WRITE_TOKEN missing in production; refusing local filesystem write for gift config");
  }
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(GIFT_FILE, JSON.stringify(config, null, 2), "utf-8");
}

export async function readSiteContentFromDisk(): Promise<SiteContentConfig> {
  if (hasBlobStorage()) {
    return await readJsonFromBlob<SiteContentConfig>(SITE_CONTENT_BLOB_PATH);
  }
  const raw = await readFile(SITE_CONTENT_FILE, "utf-8");
  return JSON.parse(raw) as SiteContentConfig;
}

export async function writeSiteContentToDisk(config: SiteContentConfig): Promise<void> {
  if (hasBlobStorage()) {
    await writeJsonToBlob(SITE_CONTENT_BLOB_PATH, config);
    return;
  }
  if (isProductionRuntime()) {
    throw new Error("BLOB_READ_WRITE_TOKEN missing in production; refusing local filesystem write for site content");
  }
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(SITE_CONTENT_FILE, JSON.stringify(config, null, 2), "utf-8");
}
