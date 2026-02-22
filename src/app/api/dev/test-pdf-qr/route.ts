/**
 * POST /api/dev/test-pdf-qr
 *
 * Test route for the PDF QR embedding pipeline:
 * 1. Reads /storage/sample-input.pdf
 * 2. Embeds a QR code with "https://example.com/test" on every page
 * 3. Saves the result to /storage/sample-output.pdf
 * 4. Returns a JSON success response with file size info
 */

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { embedQrIntoPdf } from "@/lib/pdf/embedQrIntoPdf";

const STORAGE_DIR = path.join(process.cwd(), "storage");
const INPUT_PATH = path.join(STORAGE_DIR, "sample-input.pdf");
const OUTPUT_PATH = path.join(STORAGE_DIR, "sample-output.pdf");

export async function POST() {
    try {
        // Read the sample PDF
        const inputBuffer = await fs.readFile(INPUT_PATH);

        // Embed QR on every page
        const outputBuffer = await embedQrIntoPdf(inputBuffer, "https://example.com/test");

        // Persist the result
        await fs.writeFile(OUTPUT_PATH, outputBuffer);

        return NextResponse.json({
            success: true,
            input_size_bytes: inputBuffer.length,
            output_size_bytes: outputBuffer.length,
            output_path: OUTPUT_PATH,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[/api/dev/test-pdf-qr]", message);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
