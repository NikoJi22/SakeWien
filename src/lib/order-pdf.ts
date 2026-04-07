import PDFDocument from "pdfkit";

export function buildOrderPdf(subject: string, lines: string[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 48 });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(16).text("Sake Vienna - Order / Invoice");
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor("#333").text(subject);
    doc.moveDown();
    lines.forEach((line) => doc.text(line));
    doc.end();
  });
}
