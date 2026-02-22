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

export async function GET(_req: NextRequest, { params }: Params) {
    // A — extract doc_code
    const { doc_code } = await params;

    // B — look up the document record
    const repo = getDocumentRepository();
    const record = repo.getDocumentByCode(doc_code);

    // C — not found
    if (!record) {
        return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    // D — verify the file is actually on disk
    const storage = getStorageService();
    const exists = await storage.fileExists(record.file_path);

    if (!exists) {
        console.error(`[resolve] DB record found but file missing: ${record.file_path}`);
        return NextResponse.json(
            { error: "Document record exists but file is missing from storage." },
            { status: 500 }
        );
    }

    // E — read the file buffer
    const buffer = await storage.readFile(record.file_path);

    // F — return as inline PDF
    return new NextResponse(buffer, {
        status: 200,
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${doc_code}.pdf"`,
            "Content-Length": buffer.length.toString(),
        },
    });
}
