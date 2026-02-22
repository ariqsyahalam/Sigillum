/**
 * SQLiteDocumentRepository
 * Local SQLite implementation of the DocumentRepository interface.
 * Uses the shared singleton db connection from src/lib/db/index.ts.
 */

import db from "@/lib/db";
import type { DocumentRepository } from "@/lib/db/DocumentRepository";
import type { DocumentRecord, NewDocumentRecord } from "@/types/document";

export class SQLiteDocumentRepository implements DocumentRepository {
    /**
     * Insert a new document record and return the full saved row.
     */
    createDocument(data: NewDocumentRecord): DocumentRecord {
        const stmt = db.prepare(`
      INSERT INTO documents (doc_code, file_path, file_hash, uploaded_at)
      VALUES (@doc_code, @file_path, @file_hash, @uploaded_at)
    `);

        const result = stmt.run(data);

        const inserted = db
            .prepare("SELECT * FROM documents WHERE id = ?")
            .get(result.lastInsertRowid) as DocumentRecord;

        return inserted;
    }

    /**
     * Fetch a single document by its unique doc_code. Returns null if not found.
     */
    getDocumentByCode(docCode: string): DocumentRecord | null {
        const row = db
            .prepare("SELECT * FROM documents WHERE doc_code = ?")
            .get(docCode) as DocumentRecord | undefined;

        return row ?? null;
    }

    /**
     * Return all documents ordered by most recently uploaded first.
     */
    listDocuments(): DocumentRecord[] {
        return db
            .prepare("SELECT * FROM documents ORDER BY uploaded_at DESC")
            .all() as DocumentRecord[];
    }
}
