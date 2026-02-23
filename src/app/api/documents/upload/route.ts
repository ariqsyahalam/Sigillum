/**
 * POST /api/documents/upload
 *
 * Hardened upload pipeline with admin token authentication.
 *
 * Guards (in order):
 *   [1] Rate limit      — 10 uploads / minute / IP
 *   [2] Admin token     — Authorization: Bearer <DOCUCERT_ADMIN_TOKEN>
 *   [3] Missing file    — must send field "file"
 *   [4] MIME type       — must be application/pdf
 *   [5] Filename ext    — must end with .pdf
 *   [6] Empty file      — size must be > 0
 *   [7] File size       — must be ≤ 10 MB
 *   [8] No overwrite    — file must not already exist in storage
 *
 * Pipeline (A → G):
 *   A  Read buffer
 *   B  Generate doc_code
 *   C  Build verification URL (uses APP_BASE_URL env var)
 *   D  Embed QR onto every page
 *   E  Hash the final PDF
 *   F  Save to storage
 *   G  Insert DB record
 */

import { NextRequest, NextResponse } from "next/server";
import { embedQrIntoPdf } from "@/lib/pdf/embedQrIntoPdf";
import { hashBuffer } from "@/lib/hash/sha256";
import { getDocumentRepository, getStorageService } from "@/lib/factory";
import { generateDocCode } from "@/lib/utils/generateDocCode";
import { checkRateLimit, getClientIp } from "@/lib/utils/rateLimiter";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const RATE_LIMIT = 10;               // max uploads per window
const RATE_WINDOW = 60 * 1000;        // 1 minute in ms

/** Shared security headers for all responses from this route */
const secHeaders = {
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
};

function err(message: string, status: number) {
    return NextResponse.json({ success: false, error: message }, { status, headers: secHeaders });
}

export async function POST(req: NextRequest) {
    // ── [1] Rate limit ────────────────────────────────────────────────────────
    const ip = getClientIp(req);
    const rate = checkRateLimit(ip, RATE_LIMIT, RATE_WINDOW);
    if (!rate.allowed) {
        const retryAfterSec = Math.ceil((rate.retryAfterMs ?? RATE_WINDOW) / 1000);
        return NextResponse.json(
            { success: false, error: `Rate limit exceeded. Try again in ${retryAfterSec}s.` },
            { status: 429, headers: { "Retry-After": String(retryAfterSec), ...secHeaders } }
        );
    }

    // ── [2] Admin token ───────────────────────────────────────────────────────
    const adminToken = process.env.DOCUCERT_ADMIN_TOKEN;
    const authHeader = req.headers.get("authorization") ?? "";
    const provided = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

    if (!adminToken || !provided || provided !== adminToken) {
        return err("Unauthorized.", 401);
    }

    try {
        // ── [3] Parse multipart form ──────────────────────────────────────────
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file || typeof file === "string") {
            return err('Missing field "file" in form data.', 400);
        }

        // ── [4] MIME type ─────────────────────────────────────────────────────
        if (file.type !== "application/pdf") {
            return err(`Invalid file type "${file.type}". Only application/pdf is accepted.`, 415);
        }

        // ── [5] Filename extension ────────────────────────────────────────────
        const originalName = file.name ?? "";
        if (!originalName.toLowerCase().endsWith(".pdf")) {
            return err(`Filename must end with .pdf (got "${originalName}").`, 415);
        }

        // ── [6] Empty file ────────────────────────────────────────────────────
        if (file.size === 0) {
            return err("Uploaded file is empty.", 400);
        }

        // ── [7] File size ─────────────────────────────────────────────────────
        if (file.size > MAX_FILE_SIZE) {
            return err(`File too large (${file.size} bytes). Maximum allowed is 10 MB.`, 413);
        }

        // ── A: Read buffer (user-supplied filename NEVER used for storage) ────
        const inputBuffer = Buffer.from(await file.arrayBuffer());

        // ── B: Generate unique document code ─────────────────────────────────
        const docCode = generateDocCode();

        // ── C: Build verification URL — driven by APP_BASE_URL env var ────────
        const baseUrl = (process.env.APP_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
        const verifyUrl = `${baseUrl}/v/${docCode}`;

        // ── D: Embed QR onto every page ───────────────────────────────────────
        const finalBuffer = await embedQrIntoPdf(inputBuffer, verifyUrl);

        // ── E: Hash the FINAL (post-QR) PDF ──────────────────────────────────
        const fileHash = hashBuffer(finalBuffer);

        // ── [8] Prevent overwrite ─────────────────────────────────────────────
        const storage = getStorageService();
        const targetPath = `${docCode}.pdf`;
        if (await storage.fileExists(targetPath)) {
            return err("Document already exists. Please retry the upload.", 409);
        }

        // ── F: Save final PDF ─────────────────────────────────────────────────
        const relativePath = await storage.saveFile(finalBuffer, targetPath);

        // ── G: Insert DB record ───────────────────────────────────────────────
        const repo = getDocumentRepository();
        const record = await repo.createDocument({
            doc_code: docCode,
            file_path: relativePath,
            file_hash: fileHash,
            uploaded_at: new Date().toISOString(),
        });

        // ── Log upload (server-side only) ─────────────────────────────────────
        console.log(`[upload] doc_code=${docCode} at=${new Date().toISOString()}`);

        return NextResponse.json({
            success: true,
            doc_code: record.doc_code,
            verify_url: verifyUrl,
            // file_path is relative only — never expose absolute FS paths
            file_path: record.file_path,
            file_hash: record.file_hash,
        }, { status: 201, headers: secHeaders });

    } catch (error: unknown) {
        console.error("[/api/documents/upload] Unexpected error:", error instanceof Error ? error.stack : error);
        return err("Internal server error.", 500);
    }
}
