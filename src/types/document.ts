// Shared TypeScript types for the documents domain

export interface Document {
  id: number;
  doc_code: string;
  file_path: string;
  file_hash: string;
  uploaded_at: string;
}

export type NewDocument = Omit<Document, "id">;
