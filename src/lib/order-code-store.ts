import { mkdir, readFile, writeFile } from "fs/promises";
import { randomInt } from "crypto";
import path from "path";
import { head, put } from "@vercel/blob";

const DATA_DIR = path.join(process.cwd(), "data");
const ORDER_CODES_FILE = path.join(DATA_DIR, "order-codes.json");
const ORDER_CODES_BLOB = "sake-vienna/order-codes.json";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

type CodesData = { codes: string[] };

function hasBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function getBlobToken(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is missing");
  return token;
}

function generateRandomOrderCode(): string {
  const len = 6 + randomInt(0, 3);
  let out = "";
  for (let i = 0; i < len; i++) {
    out += ALPHABET[randomInt(0, ALPHABET.length)]!;
  }
  return out;
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

function normalizeCodesData(raw: unknown): Set<string> {
  if (!raw || typeof raw !== "object") return new Set();
  const codes = (raw as CodesData).codes;
  if (!Array.isArray(codes)) return new Set();
  const set = new Set<string>();
  for (const c of codes) {
    if (typeof c === "string" && c.length > 0) set.add(c);
  }
  return set;
}

async function readUsedCodes(): Promise<Set<string>> {
  if (hasBlobStorage()) {
    try {
      const data = await readJsonFromBlob<unknown>(ORDER_CODES_BLOB);
      return normalizeCodesData(data);
    } catch {
      return new Set();
    }
  }
  try {
    const raw = await readFile(ORDER_CODES_FILE, "utf-8");
    return normalizeCodesData(JSON.parse(raw) as unknown);
  } catch {
    return new Set();
  }
}

async function writeUsedCodes(used: Set<string>): Promise<void> {
  const data: CodesData = { codes: [...used] };
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
 * Vergeben einer eindeutigen Bestell-Kennung: 6–8 Zeichen (A–Z und 0–9).
 * Persistiert die Menge bereits vergebener Codes in Vercel Blob (`sake-vienna/order-codes.json`)
 * oder lokal `data/order-codes.json` (analog zur früheren Bestellnummern-Datei).
 */
export function allocateUniqueOrderCode(): Promise<string> {
  const next = codeChain.then(async () => {
    const used = await readUsedCodes();
    for (let attempt = 0; attempt < MAX_ALLOC_ATTEMPTS; attempt++) {
      const code = generateRandomOrderCode();
      if (!used.has(code)) {
        used.add(code);
        await writeUsedCodes(used);
        return code;
      }
    }
    throw new Error("order_code_allocation_exhausted");
  });
  codeChain = next.then(() => {}).catch(() => {});
  return next as Promise<string>;
}
