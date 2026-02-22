import { NextResponse } from "next/server";
import db from "@/lib/db";
import type { Document } from "@/types/document";

/**
 * POST /api/test-db
 * Inserts a dummy document row into the documents table and returns it.
 */
export async function POST() {
    const now = new Date().toISOString();

    // Build a unique doc_code so repeated calls don't violate the UNIQUE constraint
    const dummyDoc = {
        doc_code: `TEST-${Date.now()}`,
        file_path: "/storage/documents/dummy.pdf",
        file_hash: "abc123dummyhash",
        uploaded_at: now,
    };

    const stmt = db.prepare(`
    INSERT INTO documents (doc_code, file_path, file_hash, uploaded_at)
    VALUES (@doc_code, @file_path, @file_hash, @uploaded_at)
  `);

    const result = stmt.run(dummyDoc);

    // Fetch the newly inserted row
    const inserted = db
        .prepare("SELECT * FROM documents WHERE id = ?")
        .get(result.lastInsertRowid) as Document;

    return NextResponse.json({ success: true, document: inserted }, { status: 201 });
}
