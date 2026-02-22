/**
 * generateDocCode
 *
 * Generates a random, URL-safe document code.
 * Format: 12 uppercase alphanumeric characters (e.g. "A3F9KX2BQW1M")
 *
 * - Not sequential: derived from crypto randomBytes, not timestamps
 * - URL-safe: characters [A-Z0-9] only
 * - Length: 12 chars → 36^12 ≈ 4.7 trillion unique values
 */

import { randomBytes } from "crypto";

const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous I,O,0,1
const CODE_LENGTH = 12;

export function generateDocCode(): string {
    const bytes = randomBytes(CODE_LENGTH);
    return Array.from(bytes)
        .map((b) => CHARSET[b % CHARSET.length])
        .join("");
}
