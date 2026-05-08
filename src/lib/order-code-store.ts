import { mkdir, readFile, writeFile } from "fs/promises";
import { randomInt } from "crypto";
import path from "path";
import { head, put } from "@vercel/blob";

const DATA_DIR = path.join(process.cwd(), "data");
const ORDER_CODES_FILE = path.join(DATA_DIR, "order-codes.json");
const ORDER_CODES_BLOB = "sake-vienna/order-codes.json";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const ORDER_CODE_LENGTH = 4;

type CodesData = {
  /** Legacy format (global used codes) */
  codes?: string[];
  /** New format: daily uniqueness buckets in Vienna timezone */
  codesByDay?: Record<string, string[]>;
  /** Legacy codes kept to avoid reusing historical ids */
  legacyCodes?: string[];
};

type NormalizedCodesData = {
  legacyCodes: Set<string>;
  codesByDay: Map<string, Set<string>>;
};

function hasBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function getBlobToken(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is missing");
  return token;
}

function generateRandomOrderCode(): string {
  let out = "";
  for (let i = 0; i < ORDER_CODE_LENGTH; i++) {
    out += ALPHABET[randomInt(0, ALPHABET.length)]!;
  }
  return out;
}

function viennaDateKey(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Vienna",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(d);
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

function normalizeCodesData(raw: unknown): NormalizedCodesData {
  const legacyCodes = new Set<string>();
  const codesByDay = new Map<string, Set<string>>();

  if (!raw || typeof raw !== "object") return { legacyCodes, codesByDay };

  const data = raw as CodesData;
  const collectCodes = (arr: unknown) => {
    if (!Array.isArray(arr)) return;
    for (const code of arr) {
      if (typeof code !== "string") continue;
      const trimmed = code.trim();
      if (!trimmed) continue;
      legacyCodes.add(trimmed);
    }
  };

  collectCodes(data.codes);
  collectCodes(data.legacyCodes);

  const byDay = data.codesByDay;
  if (byDay && typeof byDay === "object") {
    for (const [dayKey, codes] of Object.entries(byDay)) {
      if (!Array.isArray(codes)) continue;
      const daySet = new Set<string>();
      for (const code of codes) {
        if (typeof code !== "string") continue;
        const trimmed = code.trim();
        if (!trimmed) continue;
        daySet.add(trimmed);
      }
      if (daySet.size > 0) codesByDay.set(dayKey, daySet);
    }
  }

  return { legacyCodes, codesByDay };
}

async function readUsedCodes(): Promise<NormalizedCodesData> {
  if (hasBlobStorage()) {
    try {
      const data = await readJsonFromBlob<unknown>(ORDER_CODES_BLOB);
      return normalizeCodesData(data);
    } catch {
      return { legacyCodes: new Set(), codesByDay: new Map() };
    }
  }
  try {
    const raw = await readFile(ORDER_CODES_FILE, "utf-8");
    return normalizeCodesData(JSON.parse(raw) as unknown);
  } catch {
    return { legacyCodes: new Set(), codesByDay: new Map() };
  }
}

async function writeUsedCodes(used: NormalizedCodesData): Promise<void> {
  const data: CodesData = {
    legacyCodes: [...used.legacyCodes],
    codesByDay: Object.fromEntries(
      [...used.codesByDay.entries()].map(([dayKey, codes]) => [dayKey, [...codes]])
    )
  };
  if (hasBlobStorage()) {
    await writeJsonToBlob(ORDER_CODES_BLOB, data);
    return;
  }
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(ORDER_CODES_FILE, JSON.stringify(data, null, 2), "utf-8");
}

/** Serielle Zuweisung pro Node-Instanz (weniger Kollisionen bei Blob-Lese/Schreib-Zyklen). */
let codeChain: Promise<unknown> = Promise.resolve();

const MAX_ALLOC_ATTEMPTS = 64;

/**
 * Vergeben einer eindeutigen Bestell-Kennung: 4 Zeichen (A–Z und 0–9).
 * Persistiert die Menge bereits vergebener Codes in Vercel Blob (`sake-vienna/order-codes.json`)
 * oder lokal `data/order-codes.json` (analog zur früheren Bestellnummern-Datei).
 */
export function allocateUniqueOrderCode(): Promise<string> {
  const next = codeChain.then(async () => {
    const used = await readUsedCodes();
    const dayKey = viennaDateKey(new Date());
    const usedToday = new Set<string>(used.codesByDay.get(dayKey) ?? []);
    for (let attempt = 0; attempt < MAX_ALLOC_ATTEMPTS; attempt++) {
      const code = generateRandomOrderCode();
      if (!usedToday.has(code) && !used.legacyCodes.has(code)) {
        usedToday.add(code);
        used.codesByDay.set(dayKey, usedToday);
        await writeUsedCodes(used);
        return code;
      }
    }
    throw new Error("order_code_allocation_exhausted");
  });
  codeChain = next.then(() => {}).catch(() => {});
  return next as Promise<string>;
}
