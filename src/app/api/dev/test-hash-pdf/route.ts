/**
 * POST /api/dev/test-hash-pdf
 *
 * Tests hashing correctness on the QR-stamped sample PDF:
 * 1. Read /storage/sample-output.pdf into a buffer
 * 2. Compute SHA-256 hash
 * 3. Read the file a SECOND time independently
 * 4. Hash again and confirm both hashes match
 * 5. Return hash, file size, and the consistency check result
 */

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { hashBuffer } from "@/lib/hash/sha256";

const FILE_PATH = path.join(process.cwd(), "storage", "sample-output.pdf");

export async function POST() {
    try {
        // First read + hash
        const buffer1 = await fs.readFile(FILE_PATH);
        const hash1 = hashBuffer(buffer1);

        // Second independent read + hash — must produce identical result
        const buffer2 = await fs.readFile(FILE_PATH);
        const hash2 = hashBuffer(buffer2);

        const hashMatchCheck = hash1 === hash2;

        return NextResponse.json({
            hash: hash1,
            file_size: buffer1.length,
            hash_match_check: hashMatchCheck,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[/api/dev/test-hash-pdf]", message);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
