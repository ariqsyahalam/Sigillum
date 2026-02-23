/**
 * GET /api/documents/resolve/[doc_code]
 *
 * Resolves a doc_code to its stored PDF and delivers it to the client.
 *
 * Local mode  (STORAGE_MODE=local) — streams the buffer directly
 * Cloud mode  (STORAGE_MODE=r2)    — returns a 307 redirect to a 60-second
 *                                    pre-signed R2 URL (avoids server bandwidth)
 *
 * A — Read doc_code from route params
 * B — Query DocumentRepository
 * C — 404 if not found
 * D — Log access
 * E — Deliver file (stream or redirect depending on mode)
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
        const record = await repo.getDocumentByCode(doc_code);

        // C — not found
        if (!record) {
            return jsonErr("Document not found.", 404);
        }

        // D — log access (server-side only)
        console.log(`[resolve] doc_code=${doc_code} at=${new Date().toISOString()}`);

        const storage = getStorageService();
        const storageMode = process.env.STORAGE_MODE ?? "local";

        // E — cloud mode: redirect to a short-lived signed R2 URL
        if (storageMode === "r2") {
            // R2StorageService adds getSignedDownloadUrl() beyond the base StorageService interface.
            // Cast through unknown first as TypeScript requires for non-overlapping types.
            type R2 = { getSignedDownloadUrl: (path: string, ttl: number) => Promise<string> };
            const r2 = storage as unknown as R2;
            const signedUrl = await r2.getSignedDownloadUrl(record.file_path, 60);
            return NextResponse.redirect(signedUrl, { status: 307 });
        }

        // E — local mode: verify file on disk then stream buffer
        const exists = await storage.fileExists(record.file_path);
        if (!exists) {
            console.error(`[resolve] DB record found but file missing: ${record.file_path}`);
            return jsonErr("Document record exists but file is missing from storage.", 500);
        }

        const buffer = await storage.readFile(record.file_path);
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
