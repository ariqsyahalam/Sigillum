/**
 * R2StorageService
 * Cloudflare R2 (S3-compatible) implementation of the StorageService interface.
 *
 * Required env vars:
 *   R2_ENDPOINT   — e.g. https://<account-id>.r2.cloudflarestorage.com
 *   R2_ACCESS_KEY — R2 access key ID
 *   R2_SECRET_KEY — R2 secret access key
 *   R2_BUCKET     — bucket name
 */

import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { StorageService } from "@/lib/storage/StorageService";

function getClient(): S3Client {
    const endpoint = process.env.R2_ENDPOINT;
    const accessKeyId = process.env.R2_ACCESS_KEY;
    const secretAccessKey = process.env.R2_SECRET_KEY;

    if (!endpoint || !accessKeyId || !secretAccessKey) {
        throw new Error(
            "R2StorageService: missing env vars. Set R2_ENDPOINT, R2_ACCESS_KEY, R2_SECRET_KEY."
        );
    }

    return new S3Client({
        region: "auto",
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
    });
}

function getBucket(): string {
    const bucket = process.env.R2_BUCKET;
    if (!bucket) throw new Error("R2StorageService: R2_BUCKET env var is not set.");
    return bucket;
}

export class R2StorageService implements StorageService {
    /**
     * Upload a Buffer to R2 at the given key (relative path), e.g. "documents/ABC123.pdf".
     * Returns the same relative path.
     */
    async saveFile(buffer: Buffer, relativePath: string): Promise<string> {
        const client = getClient();
        const bucket = getBucket();

        await client.send(
            new PutObjectCommand({
                Bucket: bucket,
                Key: relativePath,
                Body: buffer,
                ContentType: "application/pdf",
            })
        );

        return relativePath;
    }

    /**
     * Download an object from R2 and return its content as a Buffer.
     * Throws if the key does not exist.
     */
    async readFile(relativePath: string): Promise<Buffer> {
        const client = getClient();
        const bucket = getBucket();

        const response = await client.send(
            new GetObjectCommand({ Bucket: bucket, Key: relativePath })
        );

        if (!response.Body) {
            throw new Error(`R2StorageService: no body returned for key "${relativePath}"`);
        }

        // Collect the readable stream into a Buffer
        const chunks: Uint8Array[] = [];
        for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks);
    }

    /**
     * Check whether an object exists in R2 without downloading it.
     */
    async fileExists(relativePath: string): Promise<boolean> {
        const client = getClient();
        const bucket = getBucket();

        try {
            await client.send(
                new HeadObjectCommand({ Bucket: bucket, Key: relativePath })
            );
            return true;
        } catch (err: unknown) {
            // HeadObject throws a 404-like error when the key doesn't exist
            const code = (err as { name?: string; $metadata?: { httpStatusCode?: number } });
            if (code.name === "NotFound" || code.$metadata?.httpStatusCode === 404) {
                return false;
            }
            throw err;
        }
    }

    /**
     * Generate a short-lived (60 s) pre-signed GET URL for direct browser download.
     * Used by the resolve route in cloud mode to avoid streaming through the server.
     */
    async getSignedDownloadUrl(relativePath: string, expiresInSeconds = 60): Promise<string> {
        const client = getClient();
        const bucket = getBucket();

        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: relativePath,
            ResponseContentType: "application/pdf",
            ResponseContentDisposition: `inline; filename="${relativePath.split("/").pop()}"`,
        });

        return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
    }

    /**
     * Generate a short-lived presigned PUT URL so the browser can upload a file
     * directly to R2 — bypassing the Vercel serverless function body size limit.
     * @param key            R2 object key (e.g. "uploads/temp/ABC123.pdf")
     * @param expiresInSeconds TTL for the presigned URL (default 300 s = 5 min)
     */
    async getSignedUploadUrl(key: string, expiresInSeconds = 300): Promise<string> {
        const client = getClient();
        const bucket = getBucket();

        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            ContentType: "application/pdf",
        });

        return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
    }

    /**
     * Delete an object from R2. Used to clean up temp upload files after processing.
     */
    async deleteFile(relativePath: string): Promise<void> {
        const client = getClient();
        const bucket = getBucket();
        const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
        await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: relativePath }));
    }
}
