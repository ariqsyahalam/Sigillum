/**
 * StorageService — abstract interface for file storage.
 *
 * Implementations can be backed by the local filesystem (dev) or
 * Cloudflare R2 / Supabase Storage (production) without changing callers.
 */

export interface StorageService {
    /**
     * Save a file buffer to the given relative path.
     * Directories are created automatically.
     * @param buffer       Raw file data
     * @param relativePath Path relative to the storage root (e.g. "invoices/abc.pdf")
     * @returns            The relative path that was saved (same as input)
     */
    saveFile(buffer: Buffer, relativePath: string): Promise<string>;

    /**
     * Read a file by its relative path.
     * @returns Buffer with the file contents
     * @throws  Error if the file does not exist
     */
    readFile(relativePath: string): Promise<Buffer>;

    /**
     * Check whether a file exists at the given relative path.
     */
    fileExists(relativePath: string): Promise<boolean>;
}
