/**
 * Service Factory
 *
 * Single source of truth for obtaining service/repository instances.
 * Mode is controlled entirely by environment variables:
 *
 *   DB_MODE=supabase  → SupabaseDocumentRepository
 *   DB_MODE=sqlite    → SQLiteDocumentRepository  (default / local dev)
 *
 *   STORAGE_MODE=r2   → R2StorageService
 *   STORAGE_MODE=local → LocalStorageService       (default / local dev)
 */

import { SQLiteDocumentRepository } from "@/lib/db/SQLiteDocumentRepository";
import { LocalStorageService } from "@/lib/storage/LocalStorageService";
import type { DocumentRepository } from "@/lib/db/DocumentRepository";
import type { StorageService } from "@/lib/storage/StorageService";

/**
 * Returns the active DocumentRepository implementation.
 * Reads DB_MODE env var at call time so it works correctly in both
 * the dev server (where env can change across restarts) and production builds.
 */
export function getDocumentRepository(): DocumentRepository {
    const mode = process.env.DB_MODE ?? "sqlite";

    if (mode === "supabase") {
        // Dynamic import guard: only load Supabase client on demand so it
        // doesn't pull into the local dev bundle when not needed.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { SupabaseDocumentRepository } = require("@/lib/repository/SupabaseDocumentRepository");
        return new SupabaseDocumentRepository() as DocumentRepository;
    }

    return new SQLiteDocumentRepository();
}

/**
 * Returns the active StorageService implementation.
 * Reads STORAGE_MODE env var at call time.
 */
export function getStorageService(): StorageService {
    const mode = process.env.STORAGE_MODE ?? "local";

    if (mode === "r2") {
        // Dynamic require so the AWS SDK is not bundled in local dev mode.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { R2StorageService } = require("@/lib/storage/R2StorageService");
        return new R2StorageService() as StorageService;
    }

    return new LocalStorageService();
}
