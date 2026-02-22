/**
 * SQLiteDocumentRepository — local SQLite implementation.
 */

import db from "@/lib/db";
import type { DocumentRepository } from "@/lib/db/DocumentRepository";
import type { DocumentRecord, NewDocumentRecord } from "@/types/document";

export class SQLiteDocumentRepository implements DocumentRepository {
    createDocument(data: NewDocumentRecord): DocumentRecord {
        const stmt = db.prepare(`
      INSERT INTO documents (doc_code, file_path, file_hash, uploaded_at)
      VALUES (@doc_code, @file_path, @file_hash, @uploaded_at)
    `);
        const result = stmt.run(data);
        return db
            .prepare("SELECT * FROM documents WHERE id = ?")
            .get(result.lastInsertRowid) as DocumentRecord;
    }

    getDocumentByCode(docCode: string): DocumentRecord | null {
        const row = db
            .prepare("SELECT * FROM documents WHERE doc_code = ?")
            .get(docCode) as DocumentRecord | undefined;
        return row ?? null;
    }

    listDocuments(): DocumentRecord[] {
        return db
            .prepare("SELECT * FROM documents ORDER BY uploaded_at DESC")
            .all() as DocumentRecord[];
    }

    revokeDocument(docCode: string): boolean {
        const result = db
            .prepare("UPDATE documents SET revoked = 1 WHERE doc_code = ?")
            .run(docCode);
        return result.changes > 0;
    }
}
