/**
 * POST /api/documents/verify-file
 *
 * Accepts a PDF upload and a doc_code, hashes the uploaded file,
 * and compares it against the stored hash in the database.
 *
 * Does NOT modify the file, embed QR, or store anything.
 * The uploaded buffer is hashed in memory and discarded.
 */

import { NextRequest, NextResponse } from "next/server";
import { getDocumentRepository } from "@/lib/factory";
import { hashFileStream } from "@/lib/hash/fileHash";
import { Readable } from "stream";

const secHeaders = {
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
};

function err(message: string, status: number) {
    return NextResponse.json({ success: false, error: message }, { status, headers: secHeaders });
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        // ── Validate inputs ───────────────────────────────────────────────────
        const file = formData.get("file");
        const docCode = formData.get("doc_code");

        if (!docCode || typeof docCode !== "string" || docCode.trim() === "") {
            return err("Missing field: doc_code.", 400);
        }

        if (!file || typeof file === "string") {
            return err("Missing field: file.", 400);
        }

        // ── Look up stored document ───────────────────────────────────────────
        const repo = getDocumentRepository();
        const record = await repo.getDocumentByCode(docCode.trim());

        if (!record) {
            return NextResponse.json(
                { success: false, error: "Document not registered.", doc_code: docCode },
                { status: 404, headers: secHeaders }
            );
        }

        if (!record.file_hash) {
            return err("Stored document has no hash on record. Cannot verify.", 422);
        }

        // ── Hash the uploaded file (BLAKE3 Stream) ────────────
        const arrayBuffer = await file.arrayBuffer();
        const uploadedBuffer = Buffer.from(arrayBuffer);
        const fileStream = Readable.from(uploadedBuffer);
        const uploadedHash = await hashFileStream(fileStream);

        // ── Compare ───────────────────────────────────────────────────────────
        const match = uploadedHash === record.file_hash;

        return NextResponse.json({
            success: true,
            doc_code: record.doc_code,
            uploaded_hash: uploadedHash,
            stored_hash: record.file_hash,
            match,
        }, { headers: secHeaders });

    } catch (error: unknown) {
        console.error("[/api/documents/verify-file] Unexpected error:", error instanceof Error ? error.stack : error);
        return err("Internal server error.", 500);
    }
}
