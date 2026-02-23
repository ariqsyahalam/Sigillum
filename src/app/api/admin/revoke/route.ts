/**
 * POST /api/admin/revoke
 * Marks a document as revoked (revoked = 1).
 * Protected by DOCUCERT_ADMIN_TOKEN.
 * Does NOT delete files or database rows.
 */

import { NextRequest, NextResponse } from "next/server";
import { getDocumentRepository } from "@/lib/factory";

const secHeaders = {
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
};

function err(message: string, status: number) {
    return NextResponse.json({ success: false, error: message }, { status, headers: secHeaders });
}

export async function POST(req: NextRequest) {
    const adminToken = process.env.DOCUCERT_ADMIN_TOKEN;
    const provided = (req.headers.get("authorization") ?? "").replace("Bearer ", "").trim();
    if (!adminToken || provided !== adminToken) return err("Unauthorized.", 401);

    let body: { doc_code?: string };
    try {
        body = await req.json();
    } catch {
        return err("Request body must be JSON.", 400);
    }

    try {
        const docCode = body.doc_code?.trim();
        if (!docCode) return err("Missing field: doc_code.", 400);

        const repo = getDocumentRepository();
        const record = repo.getDocumentByCode(docCode);
        if (!record) return err("Document not found.", 404);
        if (record.revoked) return err("Document is already revoked.", 409);

        const updated = repo.revokeDocument(docCode);
        if (!updated) return err("Failed to revoke document.", 500);

        return NextResponse.json({ success: true, doc_code: docCode, revoked: true }, { headers: secHeaders });
    } catch (error: unknown) {
        console.error("[/api/admin/revoke] Unexpected error:", error instanceof Error ? error.stack : error);
        return err("Internal server error.", 500);
    }
}
