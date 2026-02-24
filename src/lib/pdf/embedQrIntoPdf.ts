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

    // A. Detect File Size Mode
    const fileSizeMB = inputPdfBuffer.length / (1024 * 1024);
    let largeFileMode = fileSizeMB > 25.0;

    // 1. Generate the QR PNG once
    const qrPngBuffer = await generateQrPng(verificationUrl, qrSize);

    // 2. Load the source PDF
    const pdfDoc = await PDFDocument.load(inputPdfBuffer, { ignoreEncryption: true });

    // B. Detect Page Count Mode
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;
    let largePageMode = totalPages > 80;

    const stampMode = (largeFileMode || largePageMode) ? "LARGE_SAFE" : "FULL";

    console.log(`[PDF Process] Size: ${fileSizeMB.toFixed(2)} MB`);
    console.log(`[PDF Process] Pages: ${totalPages}`);
    console.log(`[PDF Process] Stamp mode: ${stampMode}`);

    // 3. Embed the PNG image into the PDF document
    const qrImage = await pdfDoc.embedPng(qrPngBuffer);

    // 4. Determine which pages to stamp
    let pagesToStamp: typeof pages = [];

    if (stampMode === "FULL") {
        pagesToStamp = pages;
    } else {
        // Only stamp first and last page for large PDFs
        if (totalPages > 0) pagesToStamp.push(pages[0]);
        if (totalPages > 1) pagesToStamp.push(pages[totalPages - 1]);
    }

    // Stamp QR onto selected pages
    for (const page of pagesToStamp) {
        const { width, height } = page.getSize();

        let x = 0;
        let y = 0;

        if (posConf.includes("left")) {
            x = MARGIN;
        } else if (posConf.includes("right")) {
            x = width - qrSize - MARGIN;
        } else if (posConf.includes("center")) {
            x = (width / 2) - (qrSize / 2);
        }

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

    // 5. Serialise and return the new PDF (incremental save / append-only)
    const outputBytes = await pdfDoc.save({ useObjectStreams: false });
    return Buffer.from(outputBytes);
}
