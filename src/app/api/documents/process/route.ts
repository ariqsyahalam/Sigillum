/**
 * POST /api/documents/process
 *
 * Phase 2 of the R2 upload flow (used when STORAGE_MODE=r2).
 *
 * After the browser uploads the raw PDF directly to R2 via a presigned PUT URL,
 * this endpoint:
 *   A  Reads the raw file from R2 (temp location)
 *   B  Builds the verification URL
 *   C  Embeds QR code onto every page
 *   D  Computes SHA-256 hash of the final PDF
 *   E  Saves the processed PDF to its permanent R2 location
 *   F  Records the document in the database
 *   G  Deletes the temp file from R2
 *
 * Body (JSON): { doc_code: string }
 * Protected by admin token (same as upload).
 */

import { NextRequest, NextResponse } from "next/server";
import { embedQrIntoPdf } from "@/lib/pdf/embedQrIntoPdf";
import { hashFileStream } from "@/lib/hash/fileHash";
import { getDocumentRepository, getStorageService } from "@/lib/factory";
import { Readable } from "stream";

const secHeaders = {
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
};

function err(message: string, status: number) {
    return NextResponse.json({ success: false, error: message }, { status, headers: secHeaders });
}

export async function POST(req: NextRequest) {
    // Auth
    const adminToken = process.env.DOCUCERT_ADMIN_TOKEN;
    const provided = (req.headers.get("authorization") ?? "").replace("Bearer ", "").trim();
    if (!adminToken || provided !== adminToken) return err("Unauthorized.", 401);

    try {
        const body = await req.json();
        const { doc_code, qr_size, qr_position } = body as { doc_code?: string; qr_size?: string; qr_position?: string };

        if (!doc_code || typeof doc_code !== "string") {
            return err("Missing or invalid field: doc_code.", 400);
        }

        const storage = getStorageService();
        const tempKey = `uploads/temp/${doc_code}.pdf`;

        // A — read raw uploaded PDF from R2 temp location
        const exists = await storage.fileExists(tempKey);
        if (!exists) {
            return err("Uploaded file not found in temp storage. Upload may have failed or expired.", 404);
        }
        const rawBuffer = await storage.readFile(tempKey);

        // B — build verification URL
        const baseUrl = (process.env.APP_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
        const verifyUrl = `${baseUrl}/v/${doc_code}`;

        // C — embed QR code onto every page
        const finalBuffer = await embedQrIntoPdf(rawBuffer, verifyUrl, {
            size: (qr_size as any) || "medium",
            position: (qr_position as any) || "bottom-right",
        });

        // D — BLAKE3 hash of the final PDF (streamed to avoid large memory spikes in hashing layer)
        const fileStream = Readable.from(finalBuffer);
        const fileHash = await hashFileStream(fileStream);

        // E — save to permanent R2 location
        const targetPath = `documents/${doc_code}.pdf`;
        const relativePath = await storage.saveFile(finalBuffer, targetPath);

        // F — record in database
        const repo = getDocumentRepository();
        const record = await repo.createDocument({
            doc_code,
            file_path: relativePath,
            file_hash: fileHash,
            uploaded_at: new Date().toISOString(),
        });

        // G — clean up temp file (best-effort, don't fail if this errors)
        try {
            type R2WithDelete = { deleteFile: (key: string) => Promise<void> };
            const r2 = storage as unknown as R2WithDelete;
            await r2.deleteFile(tempKey);
        } catch {
            console.warn(`[process] Could not delete temp file ${tempKey} — will remain in R2`);
        }

        console.log(`[upload] doc_code=${doc_code} at=${new Date().toISOString()}`);

        return NextResponse.json(
            {
                success: true,
                doc_code: record.doc_code,
                verify_url: verifyUrl,
                file_path: record.file_path,
                file_hash: record.file_hash,
            },
            { status: 201, headers: secHeaders }
        );
    } catch (error: unknown) {
        console.error("[/api/documents/process] Unexpected error:", error instanceof Error ? error.stack : error);
        return err("Internal server error.", 500);
    }
}
