/**
 * GET /api/health
 *
 * Production-safe uptime/liveness endpoint.
 * Suitable for UptimeRobot, Vercel cron keep-alive, and Supabase connection warm-up.
 *
 * Checks (all run in parallel):
 *   - Database: Supabase "SELECT 1" equivalnet  OR  SQLite db open check
 *   - Storage:  R2 HeadBucket-equivalent check  OR  local directory existence
 *
 * Rules:
 *   - No auth required
 *   - No secrets exposed in response
 *   - No document reads or writes
 *   - No stack traces in response
 *   - Returns 200 if all OK, 503 if any check fails
 */

import { NextResponse } from "next/server";

const secHeaders = {
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
};

// ── Database check ─────────────────────────────────────────────────────────────

async function checkDatabase(): Promise<"reachable" | string> {
    const mode = process.env.DB_MODE ?? "sqlite";

    if (mode === "supabase") {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !key) return "missing env vars";

        try {
            // Minimal query — count(0) on an empty result set is ~1ms
            const { createClient } = await import("@supabase/supabase-js");
            const supabase = createClient(url, key);
            const { error } = await supabase
                .from("documents")
                .select("id", { count: "exact", head: true });

            if (error) return `query failed: ${error.message}`;
            return "reachable";
        } catch {
            return "unreachable";
        }
    }

    // SQLite — just verify the db module loads and opens without error
    try {
        const db = (await import("@/lib/db")).default;
        db.prepare("SELECT 1").get();
        return "reachable";
    } catch {
        return "unreachable";
    }
}

// ── Storage check ──────────────────────────────────────────────────────────────

async function checkStorage(): Promise<"reachable" | string> {
    const mode = process.env.STORAGE_MODE ?? "local";

    if (mode === "r2") {
        const endpoint = process.env.R2_ENDPOINT;
        const accessKeyId = process.env.R2_ACCESS_KEY;
        const secretAccessKey = process.env.R2_SECRET_KEY;
        const bucket = process.env.R2_BUCKET;

        if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
            return "missing env vars";
        }

        try {
            const { S3Client, HeadBucketCommand } = await import("@aws-sdk/client-s3");
            const client = new S3Client({
                region: "auto",
                endpoint,
                credentials: { accessKeyId, secretAccessKey },
            });
            await client.send(new HeadBucketCommand({ Bucket: bucket }));
            return "reachable";
        } catch {
            return "unreachable";
        }
    }

    // Local filesystem — check that the storage directory exists
    try {
        const fs = await import("fs/promises");
        const path = await import("path");
        const dir = path.join(process.cwd(), "storage", "documents");
        await fs.access(dir);
        return "reachable";
    } catch {
        return "unreachable";
    }
}

// ── Handler ────────────────────────────────────────────────────────────────────

export async function GET() {
    console.log("Health check ping received");

    // Run both checks in parallel for speed
    const [database, storage] = await Promise.all([
        checkDatabase(),
        checkStorage(),
    ]);

    const allOk = database === "reachable" && storage === "reachable";

    return NextResponse.json(
        {
            status: allOk ? "ok" : "error",
            time: new Date().toISOString(),
            database,
            storage,
        },
        {
            status: allOk ? 200 : 503,
            headers: secHeaders,
        }
    );
}
