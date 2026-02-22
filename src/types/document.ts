// Shared TypeScript types for the documents domain

/**
 * Represents a full document record as stored in the database.
 * `revoked` is stored as a SQLite INTEGER (0 = active, 1 = revoked).
 */
export interface DocumentRecord {
  id: number;
  doc_code: string;
  file_path: string;
  file_hash: string | null;
  uploaded_at: string;
  revoked: number; // 0 = active, 1 = revoked
}

export type NewDocumentRecord = Omit<DocumentRecord, "id" | "revoked">;
