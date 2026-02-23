/**
 * GET /api/documents/resolve/[doc_code]
 *
 * Resolves a doc_code to its stored PDF and streams it back.
 *
 * A — Read doc_code from route params
 * B — Query DocumentRepository
 * C — 404 if not found
 * D — Check file exists via StorageService
 * E — Read file buffer via StorageService
 * F — Return PDF with correct Content-Type / Content-Disposition
 */

import { NextRequest, NextResponse } from "next/server";
import { getDocumentRepository, getStorageService } from "@/lib/factory";

interface Params {
    params: Promise<{ doc_code: string }>;
}

const secHeaders = {
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
};

function jsonErr(message: string, status: number) {
    return NextResponse.json({ error: message }, { status, headers: secHeaders });
}

export async function GET(_req: NextRequest, { params }: Params) {
    try {
        // A — extract doc_code
        const { doc_code } = await params;

        // B — look up the document record
        const repo = getDocumentRepository();
        const record = repo.getDocumentByCode(doc_code);

        // C — not found
        if (!record) {
            return jsonErr("Document not found.", 404);
        }

        // Log access (server-side only)
        console.log(`[resolve] doc_code=${doc_code} at=${new Date().toISOString()}`);

        // D — verify the file is actually on disk
        const storage = getStorageService();
        const exists = await storage.fileExists(record.file_path);

        if (!exists) {
            console.error(`[resolve] DB record found but file missing: ${record.file_path}`);
            return jsonErr("Document record exists but file is missing from storage.", 500);
        }

        // E — read the file buffer
        const buffer = await storage.readFile(record.file_path);

        // F — return as inline PDF (no-store so each request is fresh)
        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="${doc_code}.pdf"`,
                "Content-Length": buffer.length.toString(),
                "X-Content-Type-Options": "nosniff",
                "Cache-Control": "no-store",
            },
        });

    } catch (error: unknown) {
        console.error("[/api/documents/resolve] Unexpected error:", error instanceof Error ? error.stack : error);
        return jsonErr("Internal server error.", 500);
    }
}
