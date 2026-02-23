/**
 * SupabaseDocumentRepository
 * Supabase Postgres implementation of the DocumentRepository interface.
 *
 * Required env vars:
 *   SUPABASE_URL               — project URL, e.g. https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY  — service role key (server-side only, never expose to client)
 *
 * Expected Supabase table schema (matches existing SQLite schema):
 *
 *   CREATE TABLE documents (
 *     id          BIGSERIAL PRIMARY KEY,
 *     doc_code    TEXT UNIQUE NOT NULL,
 *     file_path   TEXT NOT NULL,
 *     file_hash   TEXT,
 *     uploaded_at TIMESTAMPTZ NOT NULL,
 *     revoked     INT NOT NULL DEFAULT 0
 *   );
 */

import { createClient } from "@supabase/supabase-js";
import type { DocumentRepository } from "@/lib/db/DocumentRepository";
import type { DocumentRecord, NewDocumentRecord } from "@/types/document";

function getSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error(
            "SupabaseDocumentRepository: missing env vars. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
        );
    }

    return createClient(url, key);
}

export class SupabaseDocumentRepository implements DocumentRepository {
    async createDocument(data: NewDocumentRecord): Promise<DocumentRecord> {
        const supabase = getSupabase();

        const { data: row, error } = await supabase
            .from("documents")
            .insert({
                doc_code: data.doc_code,
                file_path: data.file_path,
                file_hash: data.file_hash,
                uploaded_at: data.uploaded_at,
                revoked: 0,
            })
            .select()
            .single();

        if (error || !row) {
            throw new Error(`SupabaseDocumentRepository.createDocument: ${error?.message ?? "no row returned"}`);
        }

        return row as DocumentRecord;
    }

    async getDocumentByCode(docCode: string): Promise<DocumentRecord | null> {
        const supabase = getSupabase();

        const { data: row, error } = await supabase
            .from("documents")
            .select("*")
            .eq("doc_code", docCode)
            .maybeSingle();

        if (error) {
            throw new Error(`SupabaseDocumentRepository.getDocumentByCode: ${error.message}`);
        }

        return (row as DocumentRecord) ?? null;
    }

    async listDocuments(): Promise<DocumentRecord[]> {
        const supabase = getSupabase();

        const { data: rows, error } = await supabase
            .from("documents")
            .select("*")
            .order("uploaded_at", { ascending: false });

        if (error) {
            throw new Error(`SupabaseDocumentRepository.listDocuments: ${error.message}`);
        }

        return (rows ?? []) as DocumentRecord[];
    }

    async revokeDocument(docCode: string): Promise<boolean> {
        const supabase = getSupabase();

        const { data, error } = await supabase
            .from("documents")
            .update({ revoked: 1 })
            .eq("doc_code", docCode)
            .select("id");

        if (error) {
            throw new Error(`SupabaseDocumentRepository.revokeDocument: ${error.message}`);
        }

        return (data?.length ?? 0) > 0;
    }
}
