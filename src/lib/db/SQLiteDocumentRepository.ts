/**
 * SQLiteDocumentRepository — local SQLite implementation.
 * Methods wrap sync DB calls in Promise.resolve() to satisfy the async DocumentRepository interface.
 */

import db from "@/lib/db";
import type { DocumentRepository } from "@/lib/db/DocumentRepository";
import type { DocumentRecord, NewDocumentRecord } from "@/types/document";

export class SQLiteDocumentRepository implements DocumentRepository {
    async createDocument(data: NewDocumentRecord): Promise<DocumentRecord> {
        const stmt = db.prepare(`
      INSERT INTO documents (doc_code, file_path, file_hash, uploaded_at)
      VALUES (@doc_code, @file_path, @file_hash, @uploaded_at)
    `);
        const result = stmt.run(data);
        const row = db
            .prepare("SELECT * FROM documents WHERE id = ?")
            .get(result.lastInsertRowid) as DocumentRecord;
        return row;
    }

    async getDocumentByCode(docCode: string): Promise<DocumentRecord | null> {
        const row = db
            .prepare("SELECT * FROM documents WHERE doc_code = ?")
            .get(docCode) as DocumentRecord | undefined;
        return row ?? null;
    }

    async listDocuments(): Promise<DocumentRecord[]> {
        return db
            .prepare("SELECT * FROM documents ORDER BY uploaded_at DESC")
            .all() as DocumentRecord[];
    }

    async revokeDocument(docCode: string): Promise<boolean> {
        const result = db
            .prepare("UPDATE documents SET revoked = 1 WHERE doc_code = ?")
            .run(docCode);
        return result.changes > 0;
    }
}
