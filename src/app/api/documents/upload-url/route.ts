/**
 * GET /api/documents/upload-url
 *
 * Returns upload mode + a presigned R2 PUT URL (R2 mode) OR signals direct upload (local mode).
 *
 * R2 mode:    { mode: "presigned", doc_code, upload_url, process_url }
 * Local mode: { mode: "direct" }
 *
 * The browser uses this to decide how to upload:
 *   - presigned: PUT file to upload_url directly (bypasses Vercel body limit), then POST to process_url
 *   - direct:    POST multipart form to /api/documents/upload as before
 *
 * Protected by admin token.
 */

import { NextRequest, NextResponse } from "next/server";
import { getStorageService } from "@/lib/factory";
import { generateDocCode } from "@/lib/utils/generateDocCode";

const secHeaders = {
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
};

function err(message: string, status: number) {
    return NextResponse.json({ success: false, error: message }, { status, headers: secHeaders });
}

export async function GET(req: NextRequest) {
    // Auth
    const adminToken = process.env.DOCUCERT_ADMIN_TOKEN;
    const provided = (req.headers.get("authorization") ?? "").replace("Bearer ", "").trim();
    if (!adminToken || provided !== adminToken) return err("Unauthorized.", 401);

    const storageMode = process.env.STORAGE_MODE ?? "local";

    if (storageMode !== "r2") {
        // Local mode — client should POST directly to /api/documents/upload
        return NextResponse.json({ mode: "direct" }, { headers: secHeaders });
    }

    try {
        const doc_code = generateDocCode();
        const tempKey = `uploads/temp/${doc_code}.pdf`;

        const storage = getStorageService();
        type R2 = { getSignedUploadUrl: (key: string, ttl: number) => Promise<string> };
        const r2 = storage as unknown as R2;
        const upload_url = await r2.getSignedUploadUrl(tempKey, 300); // 5-minute window

        return NextResponse.json(
            {
                mode: "presigned",
                doc_code,
                upload_url,
                temp_key: tempKey,
            },
            { headers: secHeaders }
        );
    } catch (error: unknown) {
        console.error("[upload-url] Unexpected error:", error instanceof Error ? error.stack : error);
        return err("Internal server error.", 500);
    }
}
