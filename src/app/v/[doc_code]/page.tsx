/**
 * /v/[doc_code] — Public document verification page.
 *
 * Fetches the document record from the resolve API and shows:
 *  - Registered status
 *  - doc_code
 *  - Clickable link to open the PDF inline
 */

import { notFound } from "next/navigation";

interface Props {
    params: Promise<{ doc_code: string }>;
}

async function getDocument(docCode: string) {
    // Call the resolve endpoint — if it returns PDF headers, the doc exists.
    // We hit the API route directly on the server side to get metadata.
    // For metadata we derive it from a HEAD-style check against the resolve route.
    // Since our resolve route returns the PDF (not JSON), we query the DB-backed
    // resolve route and infer existence from the HTTP status.
    const res = await fetch(`http://localhost:3000/api/documents/resolve/${docCode}`, {
        method: "GET",
        // Don't cache — always fresh
        cache: "no-store",
    });
    return { status: res.status, ok: res.ok };
}

export default async function VerifyPage({ params }: Props) {
    const { doc_code } = await params;

    const { status, ok } = await getDocument(doc_code);

    if (status === 404) {
        notFound();
    }

    if (!ok) {
        return (
            <main style={styles.container}>
                <div style={styles.card}>
                    <span style={styles.iconError}>⚠️</span>
                    <h1 style={styles.title}>Storage Error</h1>
                    <p style={styles.meta}>
                        A record was found for <code style={styles.code}>{doc_code}</code>, but the file
                        could not be retrieved. Please contact the document issuer.
                    </p>
                </div>
            </main>
        );
    }

    const pdfUrl = `/api/documents/resolve/${doc_code}`;

    return (
        <main style={styles.container}>
            <div style={styles.card}>
                <span style={styles.iconOk}>✅</span>
                <h1 style={styles.title}>Document Registered</h1>
                <p style={styles.label}>Document Code</p>
                <code style={styles.code}>{doc_code}</code>
                <div style={styles.divider} />
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={styles.link}>
                    Open PDF ↗
                </a>
                <p style={styles.hint}>
                    The PDF opens inline in your browser. The QR code embedded in it links back to
                    this page.
                </p>
            </div>
        </main>
    );
}

// ── Inline styles (no external CSS dependency) ────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
    container: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
        background: "#f5f5f5",
        padding: "24px",
    },
    card: {
        background: "#fff",
        borderRadius: "12px",
        padding: "40px 48px",
        maxWidth: "480px",
        width: "100%",
        textAlign: "center",
        boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
    },
    iconOk: { fontSize: "48px" },
    iconError: { fontSize: "48px" },
    title: {
        fontSize: "22px",
        fontWeight: 700,
        margin: "16px 0 8px",
        color: "#111",
    },
    label: {
        fontSize: "12px",
        color: "#888",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        margin: "16px 0 4px",
    },
    code: {
        display: "inline-block",
        fontFamily: "monospace",
        fontSize: "18px",
        fontWeight: 700,
        background: "#f0f0f0",
        padding: "6px 14px",
        borderRadius: "6px",
        color: "#333",
        letterSpacing: "0.12em",
    },
    divider: {
        height: "1px",
        background: "#eee",
        margin: "24px 0",
    },
    link: {
        display: "inline-block",
        padding: "12px 28px",
        background: "#111",
        color: "#fff",
        borderRadius: "8px",
        textDecoration: "none",
        fontWeight: 600,
        fontSize: "15px",
    },
    hint: {
        marginTop: "16px",
        fontSize: "13px",
        color: "#999",
        lineHeight: 1.5,
    },
    meta: {
        fontSize: "14px",
        color: "#555",
        lineHeight: 1.6,
        marginTop: "12px",
    },
};
