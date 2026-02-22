/**
 * DocumentRepository — abstract interface for document persistence.
 *
 * Implementations can be backed by SQLite (local) or Supabase (cloud)
 * without any changes to the calling business logic.
 */

import type { DocumentRecord, NewDocumentRecord } from "@/types/document";

export interface DocumentRepository {
    /**
     * Persist a new document record and return the full saved record (including id).
     */
    createDocument(data: NewDocumentRecord): DocumentRecord;

    /**
     * Find a document by its unique code. Returns null if not found.
     */
    getDocumentByCode(docCode: string): DocumentRecord | null;

    /**
     * Return all documents, ordered by uploaded_at descending.
     */
    listDocuments(): DocumentRecord[];
}
