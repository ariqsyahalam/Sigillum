/**
 * DocumentRepository — abstract interface for document persistence.
 *
 * All methods are async so both SQLite (wrapped in Promise.resolve) and
 * Supabase (natively async) can implement this interface without adaptation.
 */

import type { DocumentRecord, NewDocumentRecord } from "@/types/document";

export interface DocumentRepository {
    /** Persist a new document record and return it with its generated id. */
    createDocument(data: NewDocumentRecord): Promise<DocumentRecord>;

    /** Find a document by its unique code. Returns null if not found. */
    getDocumentByCode(docCode: string): Promise<DocumentRecord | null>;

    /** Return all documents, ordered by uploaded_at descending. */
    listDocuments(): Promise<DocumentRecord[]>;

    /**
     * Mark a document as revoked (sets revoked = 1).
     * Returns true if a row was updated, false if doc_code was not found.
     */
    revokeDocument(docCode: string): Promise<boolean>;
}
