/**
 * DocumentRepository — abstract interface for document persistence.
 */

import type { DocumentRecord, NewDocumentRecord } from "@/types/document";

export interface DocumentRepository {
    /** Persist a new document record and return it with its generated id. */
    createDocument(data: NewDocumentRecord): DocumentRecord;

    /** Find a document by its unique code. Returns null if not found. */
    getDocumentByCode(docCode: string): DocumentRecord | null;

    /** Return all documents, ordered by uploaded_at descending. */
    listDocuments(): DocumentRecord[];

    /**
     * Mark a document as revoked (sets revoked = 1).
     * Returns true if a row was updated, false if doc_code was not found.
     */
    revokeDocument(docCode: string): boolean;
}
