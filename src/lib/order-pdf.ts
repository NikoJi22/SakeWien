import path from "path";
import sharp from "sharp";
import { PDFDocument, StandardFonts, type PDFFont, type PDFPage } from "pdf-lib";

const COMPANY_NAME = "Sake Pan Jun Tao KG";
const COMPANY_STREET = "Kaiserstraße 81/6";
const COMPANY_CITY = "1070 Wien";

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
  /** Empty for pickup when customer did not provide a number */
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
  /** Summe Gerichte (ohne Besteck) */
  itemsSubtotalEur: number;
  /** Gesamtbetrag inkl. Besteck (wie vom Client übermittelt) */
  grandTotalEur: number;
  /** Lieferkosten EUR, nur anzeigen wenn > 0 */
  deliveryFeeEur?: number;
};

function formatEur(n: number): string {
  return `€ ${n.toFixed(2).replace(".", ",")}`;
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

const MARGIN = 48;
const LINE_H = 14;
const PAGE_W = 595.28;
const PAGE_H = 841.89;

function ensureSpace(page: PDFPage, y: number, need: number, pdfDoc: PDFDocument): { page: PDFPage; y: number } {
  if (y - need >= MARGIN) return { page, y };
  const newPage = pdfDoc.addPage([PAGE_W, PAGE_H]);
  return { page: newPage, y: PAGE_H - MARGIN };
}

export async function buildOrderPdf(input: OrderPdfInput): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  const draw = (text: string, opts?: { size?: number; bold?: boolean; indent?: number }) => {
    const size = opts?.size ?? 10;
    const f = opts?.bold ? fontBold : font;
    const x = MARGIN + (opts?.indent ?? 0);
    page.drawText(text, { x, y, size, font: f });
    y -= size + 3;
  };

  const drawParagraph = (text: string, size = 10) => {
    const maxW = PAGE_W - MARGIN * 2;
    const lines = wrapLine(text, font, size, maxW);
    for (const ln of lines) {
      ({ page, y } = ensureSpace(page, y, LINE_H + 4, pdfDoc));
      page.drawText(ln, { x: MARGIN, y, size, font });
      y -= LINE_H;
    }
  };

  // Logo (Datei kann JPEG/WebP o. Ä. sein — sharp erzeugt ein echtes PNG für pdf-lib)
  try {
    const logoPath = path.join(process.cwd(), "public", "sake-logo.png");
    const pngBuffer = await sharp(logoPath).png().toBuffer();
    const image = await pdfDoc.embedPng(pngBuffer);
    const targetW = 120;
    const scale = targetW / image.width;
    const h = image.height * scale;
    ({ page, y } = ensureSpace(page, y, h + 16, pdfDoc));
    page.drawImage(image, { x: MARGIN, y: y - h, width: targetW, height: h });
    y -= h + 12;
  } catch (e) {
    console.error("[order-pdf] Could not embed logo:", e);
    draw("SAKE", { size: 18, bold: true });
    y -= 4;
  }

  draw(COMPANY_NAME, { size: 11, bold: true });
  draw(COMPANY_STREET, { size: 10 });
  draw(COMPANY_CITY, { size: 10 });
  y -= 8;

  draw(`Bestellnummer: ${input.orderId}`, { size: 12, bold: true });
  draw(`Datum / Uhrzeit (Wien): ${formatViennaDateTime(input.createdAt)}`, { size: 10 });
  draw(`Bestellart: ${fulfillmentLabel(input.fulfillment)}`, { size: 10, bold: true });
  y -= 4;

  draw(`Kunde: ${input.customerName || "—"}`, { size: 10 });
  draw(`Telefon: ${input.phone || "—"}`, { size: 10 });
  if (input.email?.trim()) draw(`E-Mail: ${input.email.trim()}`, { size: 10 });

  if (input.fulfillment === "delivery" && input.deliveryAddressLine) {
    y -= 2;
    draw("Lieferadresse:", { size: 10, bold: true });
    drawParagraph(input.deliveryAddressLine, 10);
  }

  if (input.fulfillment === "pickup" && input.pickupTime) {
    draw(`Abholzeit: ${input.pickupTime}`, { size: 10 });
  }
  if (input.fulfillment === "delivery" && input.deliveryTime) {
    draw(`Lieferzeit: ${input.deliveryTime}`, { size: 10 });
  }

  y -= 8;
  ({ page, y } = ensureSpace(page, y, 40, pdfDoc));
  draw("Positionen", { size: 11, bold: true });
  y -= 4;

  const colQty = MARGIN;
  const colDesc = MARGIN + 36;
  const colUnit = PAGE_W - MARGIN - 160;
  const colSum = PAGE_W - MARGIN - 70;
  const descMaxW = colUnit - colDesc - 8;

  const headerY = y;
  page.drawText("Menge", { x: colQty, y: headerY, size: 9, font: fontBold });
  page.drawText("Gericht / Optionen", { x: colDesc, y: headerY, size: 9, font: fontBold });
  page.drawText("Einzel", { x: colUnit, y: headerY, size: 9, font: fontBold });
  page.drawText("Summe", { x: colSum, y: headerY, size: 9, font: fontBold });
  y -= LINE_H + 2;

  for (const line of input.lines) {
    const nameLines = wrapLine(line.name, font, 9, descMaxW);
    const rowH = Math.max(LINE_H, nameLines.length * LINE_H) + 4;
    ({ page, y } = ensureSpace(page, y, rowH + 8, pdfDoc));

    const rowTop = y;
    page.drawText(String(line.quantity), { x: colQty, y: rowTop, size: 9, font });
    page.drawText(formatEur(line.unitPriceEur), { x: colUnit, y: rowTop, size: 9, font });
    page.drawText(formatEur(line.lineTotalEur), { x: colSum, y: rowTop, size: 9, font });

    let ty = rowTop;
    for (const nl of nameLines) {
      page.drawText(nl, { x: colDesc, y: ty, size: 9, font });
      ty -= LINE_H - 1;
    }
    y = Math.min(ty, rowTop - (nameLines.length - 1) * (LINE_H - 1)) - 6;
  }

  if (input.cutlery && (input.cutlery.chopsticks > 0 || input.cutlery.wooden > 0)) {
    ({ page, y } = ensureSpace(page, y, LINE_H * 5, pdfDoc));
    y -= 4;
    draw("Besteck / Extras", { size: 10, bold: true });
    const parts: string[] = [];
    if (input.cutlery.chopsticks > 0) parts.push(`Stäbchen × ${input.cutlery.chopsticks}`);
    if (input.cutlery.wooden > 0) parts.push(`Holzbesteck × ${input.cutlery.wooden}`);
    drawParagraph(parts.join(", "), 9);
    if (input.cutlery.totalEur > 0) {
      ({ page, y } = ensureSpace(page, y, LINE_H + 6, pdfDoc));
      page.drawText(`Summe Besteck: ${formatEur(input.cutlery.totalEur)}`, {
        x: PAGE_W - MARGIN - 220,
        y,
        size: 9,
        font
      });
      y -= LINE_H + 2;
    }
  }

  if (input.giftEligible) {
    ({ page, y } = ensureSpace(page, y, LINE_H * 3, pdfDoc));
    y -= 4;
    draw("Bonus / Geschenk", { size: 10, bold: true });
    drawParagraph(input.giftMessage?.trim() || "Aktiv (Schwellenwert erreicht)", 9);
  }

  if (input.comment?.trim()) {
    ({ page, y } = ensureSpace(page, y, LINE_H * 3, pdfDoc));
    y -= 4;
    draw("Anmerkung", { size: 10, bold: true });
    drawParagraph(input.comment.trim(), 9);
  }

  y -= 12;
  ({ page, y } = ensureSpace(page, y, 80, pdfDoc));
  const fee = Number(input.deliveryFeeEur || 0);
  page.drawText(`Zwischensumme: ${formatEur(input.itemsSubtotalEur)}`, {
    x: PAGE_W - MARGIN - 220,
    y,
    size: 10,
    font
  });
  y -= LINE_H + 2;

  if (input.cutlery && input.cutlery.totalEur > 0) {
    page.drawText(`Besteck (Summe): ${formatEur(input.cutlery.totalEur)}`, {
      x: PAGE_W - MARGIN - 220,
      y,
      size: 10,
      font
    });
    y -= LINE_H + 2;
  }

  if (fee > 0) {
    page.drawText(`Lieferkosten: ${formatEur(fee)}`, {
      x: PAGE_W - MARGIN - 220,
      y,
      size: 10,
      font
    });
    y -= LINE_H + 2;
  }

  y -= 6;
  page.drawText(`Gesamtbetrag: ${formatEur(input.grandTotalEur)}`, {
    x: PAGE_W - MARGIN - 260,
    y,
    size: 14,
    font: fontBold
  });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
