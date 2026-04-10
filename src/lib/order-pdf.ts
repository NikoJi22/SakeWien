import { PDFDocument, StandardFonts, type PDFFont, type PDFPage } from "pdf-lib";

/** Rechtsträger (Fußzeile / intern) */
const COMPANY_LEGAL = "Sake Pan Jun Tao KG";
const COMPANY_STREET = "Kaiserstraße 81/6";
const COMPANY_CITY = "1070 Wien";

/** Kassenbon: Anzeigename (ohne Logo, thermotauglich) */
const headerRestaurantName = () => process.env.ORDER_PDF_RESTAURANT_NAME?.trim() || "Sake";

const headerRestaurantPhone = () =>
  process.env.RESTAURANT_PHONE?.trim() || process.env.ORDER_PDF_PHONE?.trim() || "";

/** z. B. Mo–So 11:00–22:00 · Di Ruhetag — optional ORDER_PDF_OPENING_HOURS (eine Zeile) */
const openingHoursLine = () =>
  process.env.ORDER_PDF_OPENING_HOURS?.trim() || "Mo–So 11:00–22:00 Uhr · Dienstag Ruhetag";

/** Hinweis Lieferbezirke (fest, thermotauglich; optional ORDER_PDF_DELIVERY_DISTRICTS) */
const deliveryDistrictsNotice = () =>
  process.env.ORDER_PDF_DELIVERY_DISTRICTS?.trim() ||
  "Lieferung nur in den Wiener Bezirken 6, 7, 8, 15 und 16. In alle anderen Bezirke liefern wir nicht.";

export type OrderPdfLine = {
  name: string;
  quantity: number;
  unitPriceEur: number;
  lineTotalEur: number;
};

export type OrderPdfInput = {
  orderId: string;
  fulfillment: "pickup" | "delivery";
  createdAt: Date;
  customerName: string;
  phone?: string;
  email?: string;
  deliveryAddressLine?: string;
  pickupTime?: string;
  deliveryTime?: string;
  comment?: string;
  lines: OrderPdfLine[];
  cutlery: { chopsticks: number; wooden: number; totalEur: number } | null;
  giftEligible: boolean;
  giftMessage?: string;
  itemsSubtotalEur: number;
  grandTotalEur: number;
  deliveryFeeEur?: number;
};

function formatEur(n: number): string {
  return `${n.toFixed(2).replace(".", ",")} €`;
}

function formatViennaDateTime(d: Date): string {
  return new Intl.DateTimeFormat("de-AT", {
    timeZone: "Europe/Vienna",
    dateStyle: "medium",
    timeStyle: "short"
  }).format(d);
}

function fulfillmentLabel(f: "pickup" | "delivery"): string {
  return f === "pickup" ? "Abholung" : "Lieferung";
}

function wrapLine(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];
  const out: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(next, size) <= maxW) cur = next;
    else {
      if (cur) out.push(cur);
      cur = w;
    }
  }
  if (cur) out.push(cur);
  return out;
}

/** 80 mm Breite (Thermo/Kassenbon); Standardhöhe — bei langen Bestellungen neue Seite */
const PAGE_W = (80 * 72) / 25.4;
const PAGE_H = 841.89;

const MARGIN_X = 10;
const MARGIN_TOP = 14;
const MARGIN_BOTTOM = 16;
const LINE_H = 13;
const GAP_SM = 2;
const GAP_MD = 5;

function ensureSpace(
  page: PDFPage,
  y: number,
  need: number,
  pdfDoc: PDFDocument
): { page: PDFPage; y: number } {
  if (y - need >= MARGIN_BOTTOM) return { page, y };
  const newPage = pdfDoc.addPage([PAGE_W, PAGE_H]);
  return { page: newPage, y: PAGE_H - MARGIN_TOP };
}

function drawTextRight(page: PDFPage, y: number, text: string, size: number, font: PDFFont): void {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: PAGE_W - MARGIN_X - w, y, size, font });
}

export async function buildOrderPdf(input: OrderPdfInput): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN_TOP;

  const contentW = PAGE_W - MARGIN_X * 2;

  const drawCenter = (text: string, size: number, useBold = false) => {
    const f = useBold ? fontBold : font;
    const w = f.widthOfTextAtSize(text, size);
    ({ page, y } = ensureSpace(page, y, size + GAP_SM + 2, pdfDoc));
    page.drawText(text, { x: (PAGE_W - w) / 2, y, size, font: f });
    y -= size + GAP_SM;
  };

  const drawCenterWrapped = (text: string, size: number, useBold = false) => {
    const f = useBold ? fontBold : font;
    const lines = wrapLine(text, f, size, contentW);
    for (const ln of lines) {
      ({ page, y } = ensureSpace(page, y, LINE_H + 1, pdfDoc));
      const w = f.widthOfTextAtSize(ln, size);
      page.drawText(ln, { x: (PAGE_W - w) / 2, y, size, font: f });
      y -= LINE_H;
    }
  };

  const drawLeft = (text: string, opts?: { size?: number; bold?: boolean }) => {
    const size = opts?.size ?? 11;
    const f = opts?.bold ? fontBold : font;
    ({ page, y } = ensureSpace(page, y, size + GAP_SM + 1, pdfDoc));
    page.drawText(text, { x: MARGIN_X, y, size, font: f });
    y -= size + GAP_SM;
  };

  const drawLeftWrapped = (text: string, size = 10) => {
    const lines = wrapLine(text, font, size, contentW);
    for (const ln of lines) {
      ({ page, y } = ensureSpace(page, y, LINE_H + 1, pdfDoc));
      page.drawText(ln, { x: MARGIN_X, y, size, font });
      y -= LINE_H;
    }
  };

  // ——— Kassenkopf (zentriert, sofort Kontakt) ———
  drawCenter(headerRestaurantName(), 14, true);
  drawCenterWrapped(COMPANY_STREET, 11, false);
  drawCenterWrapped(COMPANY_CITY, 11, false);
  const tel = headerRestaurantPhone();
  if (tel) {
    drawCenter(`Tel. ${tel}`, 11, true);
  }
  y -= GAP_MD;

  // ——— Abhol- / Lieferzeit: oben, maximal sichtbar ———
  if (input.fulfillment === "pickup") {
    drawCenter("ABHOLZEIT", 12, true);
    const t = input.pickupTime?.trim() || "—";
    drawCenter(t, 20, true);
  } else {
    drawCenter("LIEFERZEIT", 12, true);
    const t = input.deliveryTime?.trim() || "—";
    drawCenter(t, 20, true);
  }
  y -= GAP_MD;

  // ——— Bestelldaten ———
  drawLeft(`Bestellnr.: ${input.orderId}`, { size: 12, bold: true });
  drawLeft(`Datum (Wien): ${formatViennaDateTime(input.createdAt)}`, { size: 11 });
  drawLeft(`Art: ${fulfillmentLabel(input.fulfillment)}`, { size: 11, bold: true });
  y -= GAP_SM;

  drawLeft(`Kunde: ${input.customerName || "—"}`, { size: 11 });
  drawLeft(`Telefon: ${input.phone || "—"}`, { size: 11 });
  if (input.email?.trim()) drawLeft(`E-Mail: ${input.email.trim()}`, { size: 11 });

  if (input.fulfillment === "delivery" && input.deliveryAddressLine) {
    y -= GAP_SM;
    drawLeft("Lieferadresse:", { size: 11, bold: true });
    drawLeftWrapped(input.deliveryAddressLine, 11);
  }

  y -= GAP_MD;
  ({ page, y } = ensureSpace(page, y, LINE_H * 2 + 8, pdfDoc));
  drawLeft("POSITIONEN", { size: 12, bold: true });
  y -= GAP_SM;

  const rowFont = 10;
  const priceColW = 52;
  const descMaxW = contentW - priceColW - 6;

  for (const line of input.lines) {
    const leftLabel = `${line.quantity}× ${line.name}`;
    const nameLines = wrapLine(leftLabel, font, rowFont, descMaxW);
    const rowH = nameLines.length * LINE_H + GAP_SM + 4;
    ({ page, y } = ensureSpace(page, y, rowH, pdfDoc));
    const rowTop = y;
    drawTextRight(page, rowTop, formatEur(line.lineTotalEur), rowFont, fontBold);
    let ty = rowTop;
    for (const nl of nameLines) {
      page.drawText(nl, { x: MARGIN_X, y: ty, size: rowFont, font });
      ty -= LINE_H;
    }
    y = ty - GAP_SM;
  }

  if (input.cutlery && (input.cutlery.chopsticks > 0 || input.cutlery.wooden > 0)) {
    y -= GAP_SM;
    drawLeft("Besteck / Extras", { size: 11, bold: true });
    const parts: string[] = [];
    if (input.cutlery.chopsticks > 0) parts.push(`Stäbchen × ${input.cutlery.chopsticks}`);
    if (input.cutlery.wooden > 0) parts.push(`Holzbesteck × ${input.cutlery.wooden}`);
    drawLeftWrapped(parts.join(", "), 10);
    if (input.cutlery.totalEur > 0) {
      ({ page, y } = ensureSpace(page, y, LINE_H + 4, pdfDoc));
      drawTextRight(page, y, `Besteck: ${formatEur(input.cutlery.totalEur)}`, 10, font);
      y -= LINE_H + 2;
    }
  }

  if (input.giftEligible) {
    y -= GAP_SM;
    drawLeft("Bonus / Geschenk", { size: 11, bold: true });
    drawLeftWrapped(input.giftMessage?.trim() || "Aktiv (Schwellenwert erreicht)", 10);
  }

  if (input.comment?.trim()) {
    y -= GAP_SM;
    drawLeft("Anmerkung", { size: 11, bold: true });
    drawLeftWrapped(input.comment.trim(), 10);
  }

  y -= GAP_MD;
  ({ page, y } = ensureSpace(page, y, 72, pdfDoc));

  const fee = Number(input.deliveryFeeEur || 0);
  drawTextRight(page, y, `Zwischensumme: ${formatEur(input.itemsSubtotalEur)}`, 11, font);
  y -= LINE_H + 2;

  if (input.cutlery && input.cutlery.totalEur > 0) {
    drawTextRight(page, y, `Besteck (Summe): ${formatEur(input.cutlery.totalEur)}`, 11, font);
    y -= LINE_H + 2;
  }

  if (fee > 0) {
    drawTextRight(page, y, `Lieferkosten: ${formatEur(fee)}`, 11, font);
    y -= LINE_H + 2;
  }

  y -= GAP_SM;
  ({ page, y } = ensureSpace(page, y, 28, pdfDoc));
  const totalStr = `GESAMT: ${formatEur(input.grandTotalEur)}`;
  const totalSize = 15;
  const tw = fontBold.widthOfTextAtSize(totalStr, totalSize);
  page.drawText(totalStr, { x: PAGE_W - MARGIN_X - tw, y, size: totalSize, font: fontBold });
  y -= totalSize + GAP_MD;

  // ——— Fuß: Liefergebiete + Öffnungszeiten (keine Website) ———
  y -= GAP_MD;
  ({ page, y } = ensureSpace(page, y, LINE_H * 6, pdfDoc));
  drawLeft("LIEFERGEBIET", { size: 10, bold: true });
  drawLeftWrapped(deliveryDistrictsNotice(), 9);
  y -= GAP_MD;
  drawLeft("ÖFFNUNGSZEITEN", { size: 10, bold: true });
  drawLeftWrapped(openingHoursLine(), 9);
  y -= GAP_SM;
  drawLeftWrapped(COMPANY_LEGAL, 7);

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
