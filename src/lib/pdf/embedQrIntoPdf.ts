/**
 * embedQrIntoPdf
 *
 * Embeds a QR code image onto the bottom-right corner of every page in a PDF.
 *
 * @param inputPdfBuffer  - Raw PDF bytes (original is never mutated)
 * @param verificationUrl - URL to encode into the QR image
 * @returns               - New PDF buffer with QR stamped on each page
 */

import { PDFDocument } from "pdf-lib";
import QRCode from "qrcode";

const QR_SIZE = 80;   // points (1 pt = 1/72 inch)
const MARGIN = 20;    // distance from bottom and right edges

/**
 * Generates a QR code as a raw PNG Buffer.
 */
async function generateQrPng(url: string): Promise<Buffer> {
    // toBuffer returns a Buffer directly when no callback is passed
    return QRCode.toBuffer(url, {
        type: "png",
        width: 200,        // higher resolution → sharper when scaled down in PDF
        margin: 1,
        color: {
            dark: "#000000",
            light: "#ffffff",
        },
    });
}

export async function embedQrIntoPdf(
    inputPdfBuffer: Buffer,
    verificationUrl: string
): Promise<Buffer> {
    // 1. Generate the QR PNG once — reuse across all pages
    const qrPngBuffer = await generateQrPng(verificationUrl);

    // 2. Load the source PDF into a NEW document (preserves original bytes)
    const pdfDoc = await PDFDocument.load(inputPdfBuffer);

    // 3. Embed the PNG image into the PDF document
    const qrImage = await pdfDoc.embedPng(qrPngBuffer);

    // 4. Stamp QR onto every page
    const pages = pdfDoc.getPages();

    for (const page of pages) {
        const { width, height } = page.getSize();

        // Bottom-right corner, with margin from both edges
        const x = width - QR_SIZE - MARGIN;
        const y = MARGIN;  // pdf-lib y=0 is bottom of page

        page.drawImage(qrImage, {
            x,
            y,
            width: QR_SIZE,
            height: QR_SIZE,
        });
    }

    // 5. Serialise and return the new PDF — original buffer untouched
    const outputBytes = await pdfDoc.save();
    return Buffer.from(outputBytes);
}
