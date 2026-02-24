import { Readable } from "stream";

/**
 * Computes the BLAKE3 hash of a readable stream incrementally.
 * This avoids loading the entire file into memory at once.
 * Returns a 256-bit (64 character) hex string.
 *
 * @param stream Node.js Readable stream
 * @returns Hex string of the BLAKE3 hash
 */
export async function hashFileStream(stream: Readable): Promise<string> {
    // Dynamic require referencing the CJS build directly, evading Next.js Turbopack 
    // ESM strict module resolution errors on the blake3 wrapper.
    const blakeModule = require("blake3/dist/index.js");
    const hasher = blakeModule.createHash();

    for await (const chunk of stream) {
        hasher.update(chunk);
    }

    return hasher.digest("hex");
}
