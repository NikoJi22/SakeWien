import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import type { GiftConfig, MenuCategory } from "./menu-types";

const DATA_DIR = path.join(process.cwd(), "data");
const MENU_FILE = path.join(DATA_DIR, "menu.json");
const GIFT_FILE = path.join(DATA_DIR, "gift-config.json");

export async function readMenuFromDisk(): Promise<MenuCategory[]> {
  const raw = await readFile(MENU_FILE, "utf-8");
  const data = JSON.parse(raw) as MenuCategory[];
  if (!Array.isArray(data)) throw new Error("Invalid menu.json shape");
  return data;
}

export async function writeMenuToDisk(categories: MenuCategory[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(MENU_FILE, JSON.stringify(categories, null, 2), "utf-8");
}

export async function readGiftFromDisk(): Promise<GiftConfig> {
  const raw = await readFile(GIFT_FILE, "utf-8");
  return JSON.parse(raw) as GiftConfig;
}

export async function writeGiftToDisk(config: GiftConfig): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(GIFT_FILE, JSON.stringify(config, null, 2), "utf-8");
}
