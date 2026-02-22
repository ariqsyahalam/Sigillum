/**
 * One-off script to generate a minimal 2-page sample PDF for testing.
 * Run with: node scripts/generate-sample-pdf.mjs
 */

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, "..", "storage", "sample-input.pdf");

mkdirSync(join(__dirname, "..", "storage"), { recursive: true });

const doc = await PDFDocument.create();
const font = await doc.embedFont(StandardFonts.Helvetica);

// Page 1
const p1 = doc.addPage([595, 842]); // A4
p1.drawText("DocuCert Sample PDF — Page 1", {
    x: 50, y: 780, size: 18, font, color: rgb(0.1, 0.1, 0.6),
});
p1.drawText("This PDF is used to verify the QR embedding pipeline.", {
    x: 50, y: 750, size: 12, font,
});

// Page 2
const p2 = doc.addPage([595, 842]);
p2.drawText("DocuCert Sample PDF — Page 2", {
    x: 50, y: 780, size: 18, font, color: rgb(0.1, 0.1, 0.6),
});
p2.drawText("The QR code should appear on the bottom-right of both pages.", {
    x: 50, y: 750, size: 12, font,
});

const bytes = await doc.save();
writeFileSync(OUTPUT_PATH, bytes);
console.log("✅ Written:", OUTPUT_PATH, `(${bytes.length} bytes)`);
