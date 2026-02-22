import { NextResponse } from "next/server";
import { saveFile } from "@/lib/storage";

/**
 * POST /api/test-storage
 * Saves a small test text file to /storage/documents/test.txt
 * and returns its absolute path.
 */
export async function POST() {
    const content = `DocuCert storage test\nWritten at: ${new Date().toISOString()}`;
    const filePath = saveFile("test.txt", content);

    return NextResponse.json({ success: true, file_path: filePath }, { status: 201 });
}
