/**
 * In-memory rate limiter for API routes.
 *
 * Tracks requests per IP using a sliding window approach:
 * each IP gets a counter that resets after WINDOW_MS milliseconds
 * from the time of their FIRST request in that window.
 *
 * Suitable for single-process local deployments.
 * For multi-process / cloud deployments, replace with Redis/Upstash.
 */

interface RateEntry {
    count: number;
    resetAt: number; // epoch ms
}

const store = new Map<string, RateEntry>();

/**
 * Check whether an IP is within its allowed rate.
 *
 * @param ip        - Client IP address string
 * @param limit     - Max requests allowed per window
 * @param windowMs  - Window duration in milliseconds
 * @returns         - { allowed: true } or { allowed: false, retryAfterMs }
 */
export function checkRateLimit(
    ip: string,
    limit: number,
    windowMs: number
): { allowed: boolean; retryAfterMs?: number } {
    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || now >= entry.resetAt) {
        // First request in this window (or window has expired)
        store.set(ip, { count: 1, resetAt: now + windowMs });
        return { allowed: true };
    }

    if (entry.count >= limit) {
        return { allowed: false, retryAfterMs: entry.resetAt - now };
    }

    entry.count += 1;
    return { allowed: true };
}

/**
 * Extract the real client IP from a Next.js request.
 * Falls back to "unknown" if unavailable (e.g. local testing).
 */
export function getClientIp(req: Request): string {
    return (
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
        req.headers.get("x-real-ip") ??
        "unknown"
    );
}
