/**
 * POST /api/documents/upload
 *
 * Full local document upload pipeline:
 *
 * A — Parse multipart form, read PDF into buffer
 * B — Generate unique doc_code
 * C — Build verification URL
 * D — Embed QR code onto every page
 * E — Hash the final PDF (post-QR)
 * F — Save final PDF to local storage
 * G — Insert document record into SQLite
 *
 * Returns JSON with doc_code, verify_url, file_path (relative), and file_hash.
 */

import { NextRequest, NextResponse } from "next/server";
import { embedQrIntoPdf } from "@/lib/pdf/embedQrIntoPdf";
import { hashBuffer } from "@/lib/hash/sha256";
import { getDocumentRepository, getStorageService } from "@/lib/factory";
import { generateDocCode } from "@/lib/utils/generateDocCode";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
    try {
        // ── A: Parse multipart/form-data ───────────────────────────────────────
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file || typeof file === "string") {
            return NextResponse.json(
                { success: false, error: 'Missing field "file" in form data.' },
                { status: 400 }
            );
        }

        // Validate MIME type
        if (file.type !== "application/pdf") {
            return NextResponse.json(
                { success: false, error: `Invalid file type "${file.type}". Only PDF is accepted.` },
                { status: 415 }
            );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { success: false, error: `File too large (${file.size} bytes). Maximum is 10 MB.` },
                { status: 413 }
            );
        }

        // Read uploaded file into a Node Buffer
        const arrayBuffer = await file.arrayBuffer();
        const inputBuffer = Buffer.from(arrayBuffer);

        // ── B: Generate unique document code ──────────────────────────────────
        const docCode = generateDocCode();

        // ── C: Build verification URL ─────────────────────────────────────────
        const verifyUrl = `http://localhost:3000/v/${docCode}`;

        // ── D: Embed QR onto every page of the PDF ────────────────────────────
        const finalBuffer = await embedQrIntoPdf(inputBuffer, verifyUrl);

        // ── E: Hash the FINAL (post-QR) PDF buffer ────────────────────────────
        const fileHash = hashBuffer(finalBuffer);

        // ── F: Save final PDF to local storage ────────────────────────────────
        const storage = getStorageService();
        const relativePath = await storage.saveFile(finalBuffer, `${docCode}.pdf`);

        // ── G: Insert document record into SQLite ─────────────────────────────
        const repo = getDocumentRepository();
        const record = repo.createDocument({
            doc_code: docCode,
            file_path: relativePath,
            file_hash: fileHash,
            uploaded_at: new Date().toISOString(),
        });

        return NextResponse.json({
            success: true,
            doc_code: record.doc_code,
            verify_url: verifyUrl,
            file_path: record.file_path,   // relative path only — no absolute FS path exposed
            file_hash: record.file_hash,
        }, { status: 201 });

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[/api/documents/upload]", message);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
