// Shared TypeScript types for the documents domain

/**
 * Represents a full document record as stored in the database.
 */
export interface DocumentRecord {
  id: number;
  doc_code: string;
  file_path: string;
  file_hash: string | null;
  uploaded_at: string;
}

/**
 * Shape of the data needed to create a new document (no id, no auto fields).
 */
export type NewDocumentRecord = Omit<DocumentRecord, "id">;
