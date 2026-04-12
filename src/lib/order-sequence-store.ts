import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { head, put } from "@vercel/blob";

const DATA_DIR = path.join(process.cwd(), "data");
const ORDER_SEQ_FILE = path.join(DATA_DIR, "order-sequence.json");
const ORDER_SEQ_BLOB = "sake-vienna/order-sequence.json";

type SeqData = { last: number };

function hasBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function getBlobToken(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is missing");
  return token;
}

function initialLastFromEnv(): number {
  const raw = process.env.ORDER_SEQUENCE_INITIAL_LAST?.trim();
  if (raw && /^\d+$/.test(raw)) return Math.max(0, Number(raw));
  return 0;
}

function formatOrderSequenceId(n: number): string {
  if (!Number.isFinite(n) || n < 1) return "0001";
  if (n < 10000) return String(n).padStart(4, "0");
  return String(n);
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

async function readLast(): Promise<number> {
  if (hasBlobStorage()) {
    try {
      const data = await readJsonFromBlob<SeqData>(ORDER_SEQ_BLOB);
      const last = Number(data?.last);
      return Number.isFinite(last) && last >= 0 ? last : initialLastFromEnv();
    } catch {
      return initialLastFromEnv();
    }
  }
  try {
    const raw = await readFile(ORDER_SEQ_FILE, "utf-8");
    const data = JSON.parse(raw) as SeqData;
    const last = Number(data?.last);
    return Number.isFinite(last) && last >= 0 ? last : initialLastFromEnv();
  } catch {
    return initialLastFromEnv();
  }
}

async function writeLast(last: number): Promise<void> {
  const data: SeqData = { last };
  if (hasBlobStorage()) {
    await writeJsonToBlob(ORDER_SEQ_BLOB, data);
    return;
  }
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(ORDER_SEQ_FILE, JSON.stringify(data, null, 2), "utf-8");
}

/** Serielle Zuweisung pro Node-Instanz (weniger Kollisionen bei Blob-Lese/Schreib-Zyklen). */
let seqChain: Promise<unknown> = Promise.resolve();

/**
 * Nächste fortlaufende Bestellnummer (1, 2, 3, …).
 * Persistiert in Vercel Blob (`sake-vienna/order-sequence.json`) oder lokal `data/order-sequence.json`.
 * Optional: `ORDER_SEQUENCE_INITIAL_LAST` — Startwert, falls noch kein Speicher existiert.
 */
export function allocateNextOrderNumber(): Promise<string> {
  const next = seqChain.then(async () => {
    const last = await readLast();
    const n = last + 1;
    await writeLast(n);
    return formatOrderSequenceId(n);
  });
  seqChain = next.then(() => {}).catch(() => {});
  return next as Promise<string>;
}
