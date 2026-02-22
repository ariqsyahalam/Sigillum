/**
 * GET /api/admin/documents
 * Returns all documents ordered by newest first.
 * Protected by DOCUCERT_ADMIN_TOKEN.
 */

import { NextRequest, NextResponse } from "next/server";
import { getDocumentRepository } from "@/lib/factory";

function unauthorized() {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
}

export async function GET(req: NextRequest) {
    const adminToken = process.env.DOCUCERT_ADMIN_TOKEN;
    const provided = (req.headers.get("authorization") ?? "").replace("Bearer ", "").trim();
    if (!adminToken || provided !== adminToken) return unauthorized();

    const repo = getDocumentRepository();
    const documents = repo.listDocuments();

    return NextResponse.json({ success: true, documents });
}
