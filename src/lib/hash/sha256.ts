/**
 * SHA-256 hashing utility.
 * Uses Node.js built-in `crypto` — no external dependencies.
 *
 * Works on any Buffer (PDF, image, text, binary).
 * Always hashes the FULL buffer in memory — no streaming, no truncation.
 */

import { createHash } from "crypto";

/**
 * Compute the SHA-256 hash of a buffer and return a lowercase hex string.
 *
 * @param buffer - Any binary buffer (PDF bytes, image bytes, etc.)
 * @returns      64-character lowercase hex string
 *
 * @example
 * const hash = hashBuffer(pdfBuffer);
 * // → "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
 */
export function hashBuffer(buffer: Buffer): string {
    return createHash("sha256").update(buffer).digest("hex");
}
