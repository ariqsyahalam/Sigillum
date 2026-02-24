/**
 * embedQrIntoPdf
 *
 * Embeds a QR code image onto every page in a PDF, with configurable size and position.
 *
 * @param inputPdfBuffer  - Raw PDF bytes (original is never mutated)
 * @param verificationUrl - URL to encode into the QR image
 * @param options         - Optional size and position configuration
 * @returns               - New PDF buffer with QR stamped on each page
 */

import { PDFDocument } from "pdf-lib";
import QRCode from "qrcode";

export type QrSize = "small" | "medium" | "large";
export type QrPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";

export interface EmbedQrOptions {
    size?: QrSize;
    position?: QrPosition;
}

const SIZE_MAP: Record<QrSize, number> = {
    small: 60,
    medium: 80,
    large: 100,
};

const MARGIN = 20; // Distance from edges

/**
 * Generates a QR code as a raw PNG Buffer.
 */
async function generateQrPng(url: string, qrSizePts: number): Promise<Buffer> {
    // scale up the generated PNG based on the target points so it stays sharp
    const pngWidth = Math.round(qrSizePts * 3);
    return QRCode.toBuffer(url, {
        type: "png",
        width: Math.max(200, pngWidth),
        margin: 1,
        color: {
            dark: "#000000",
            light: "#ffffff",
        },
    });
}

export async function embedQrIntoPdf(
    inputPdfBuffer: Buffer,
    verificationUrl: string,
    options: EmbedQrOptions = {}
): Promise<Buffer> {
    const sizeConf = options.size ?? "medium";
    const posConf = options.position ?? "bottom-right";

    const qrSize = SIZE_MAP[sizeConf] ?? 80;

    // 1. Generate the QR PNG once — reuse across all pages
    const qrPngBuffer = await generateQrPng(verificationUrl, qrSize);

    // 2. Load the source PDF into a NEW document (preserves original bytes)
    const pdfDoc = await PDFDocument.load(inputPdfBuffer);

    // 3. Embed the PNG image into the PDF document
    const qrImage = await pdfDoc.embedPng(qrPngBuffer);

    // 4. Stamp QR onto every page
    const pages = pdfDoc.getPages();

    for (const page of pages) {
        const { width, height } = page.getSize();

        let x = 0;
        let y = 0;

        // Calculate X
        if (posConf.includes("left")) {
            x = MARGIN;
        } else if (posConf.includes("right")) {
            x = width - qrSize - MARGIN;
        } else if (posConf.includes("center")) {
            x = (width / 2) - (qrSize / 2);
        }

        // Calculate Y (pdf-lib y=0 is BOTTOM of page)
        if (posConf.includes("bottom")) {
            y = MARGIN;
        } else if (posConf.includes("top")) {
            y = height - qrSize - MARGIN;
        }

        page.drawImage(qrImage, {
            x,
            y,
            width: qrSize,
            height: qrSize,
        });
    }

    // 5. Serialise and return the new PDF — original buffer untouched
    const outputBytes = await pdfDoc.save();
    return Buffer.from(outputBytes);
}
