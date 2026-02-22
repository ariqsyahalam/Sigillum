/**
 * Service Factory
 *
 * Single source of truth for obtaining service/repository instances.
 * To switch from local SQLite + filesystem to Supabase + Cloudflare R2,
 * only replace the implementations returned here — all callers stay unchanged.
 */

import { SQLiteDocumentRepository } from "@/lib/db/SQLiteDocumentRepository";
import { LocalStorageService } from "@/lib/storage/LocalStorageService";
import type { DocumentRepository } from "@/lib/db/DocumentRepository";
import type { StorageService } from "@/lib/storage/StorageService";

/**
 * Returns the active DocumentRepository implementation.
 * Current: SQLiteDocumentRepository (local)
 * Future:  SupabaseDocumentRepository (cloud)
 */
export function getDocumentRepository(): DocumentRepository {
    return new SQLiteDocumentRepository();
}

/**
 * Returns the active StorageService implementation.
 * Current: LocalStorageService (local /storage/documents/)
 * Future:  R2StorageService (Cloudflare R2)
 */
export function getStorageService(): StorageService {
    return new LocalStorageService();
}
