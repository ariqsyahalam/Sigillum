/**
 * Local file storage helper.
 * Manages the /storage/documents/ directory for uploaded document files.
 */

import path from "path";
import fs from "fs";

// Resolve storage path relative to project root
export const DOCUMENTS_DIR = path.join(process.cwd(), "storage", "documents");

/**
 * Ensures the storage directory exists.
 * Call this before any file write operation.
 */
export function ensureStorageDir(): void {
    if (!fs.existsSync(DOCUMENTS_DIR)) {
        fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
    }
}

/**
 * Saves content to a file inside /storage/documents/.
 * @param filename - Name of the file to save (e.g. "test.txt")
 * @param content  - String content to write
 * @returns        Absolute path of the saved file
 */
export function saveFile(filename: string, content: string): string {
    ensureStorageDir();
    const filePath = path.join(DOCUMENTS_DIR, filename);
    fs.writeFileSync(filePath, content, "utf-8");
    return filePath;
}
