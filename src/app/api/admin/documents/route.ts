/**
 * GET /api/admin/documents
 * Returns all documents ordered by newest first.
 * Protected by DOCUCERT_ADMIN_TOKEN.
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

export async function GET(req: NextRequest) {
    const adminToken = process.env.DOCUCERT_ADMIN_TOKEN;
    const provided = (req.headers.get("authorization") ?? "").replace("Bearer ", "").trim();
    if (!adminToken || provided !== adminToken) return err("Unauthorized.", 401);

    try {
        const repo = getDocumentRepository();
        const documents = await repo.listDocuments();
        return NextResponse.json({ success: true, documents }, { headers: secHeaders });
    } catch (error: unknown) {
        console.error("[/api/admin/documents] Unexpected error:", error instanceof Error ? error.stack : error);
        return err("Internal server error.", 500);
    }
}
