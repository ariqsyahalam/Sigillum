/**
 * LocalStorageService
 * Filesystem implementation of the StorageService interface.
 * Saves files under /storage/documents/ relative to the project root.
 */

import fs from "fs/promises";
import path from "path";
import type { StorageService } from "@/lib/storage/StorageService";

// Root directory for all stored documents
const STORAGE_ROOT = path.join(process.cwd(), "storage", "documents");

export class LocalStorageService implements StorageService {
    /**
     * Resolve an absolute path from a relative path (relative to storage root).
     */
    private resolvePath(relativePath: string): string {
        return path.join(STORAGE_ROOT, relativePath);
    }

    /**
     * Save a buffer to disk. Parent directories are created automatically.
     * Returns the relative path (same as the input).
     */
    async saveFile(buffer: Buffer, relativePath: string): Promise<string> {
        const absolutePath = this.resolvePath(relativePath);

        // Ensure the target directory exists
        await fs.mkdir(path.dirname(absolutePath), { recursive: true });

        await fs.writeFile(absolutePath, buffer);

        return relativePath;
    }

    /**
     * Read a file and return its content as a Buffer.
     * Throws if the file does not exist.
     */
    async readFile(relativePath: string): Promise<Buffer> {
        const absolutePath = this.resolvePath(relativePath);
        return fs.readFile(absolutePath);
    }

    /**
     * Check whether a file exists at the given relative path.
     */
    async fileExists(relativePath: string): Promise<boolean> {
        const absolutePath = this.resolvePath(relativePath);
        try {
            await fs.access(absolutePath);
            return true;
        } catch {
            return false;
        }
    }
}
