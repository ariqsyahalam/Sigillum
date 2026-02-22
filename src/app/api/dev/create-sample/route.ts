/**
 * POST /api/dev/create-sample
 */

import { NextResponse } from "next/server";
import { getDocumentRepository, getStorageService } from "@/lib/factory";

export async function POST() {
    try {
        const docCode = `DOC-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
        const relativePath = `samples/${docCode}.txt`;
        const now = new Date().toISOString();

        const content = `Sample document\nCode: ${docCode}\nCreated: ${now}`;
        const buffer = Buffer.from(content, "utf-8");

        const storage = getStorageService();
        const savedPath = await storage.saveFile(buffer, relativePath);

        const repo = getDocumentRepository();
        const record = repo.createDocument({
            doc_code: docCode,
            file_path: savedPath,
            file_hash: null,
            uploaded_at: now,
        });

        return NextResponse.json({ success: true, document: record }, { status: 201 });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[/api/dev/create-sample]", message);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
