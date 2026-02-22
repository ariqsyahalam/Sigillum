/**
 * /v/[doc_code] — Public document verification page.
 *
 * Server component: checks document exists, renders the registration card
 * and the client-side VerifyFilePanel for hash comparison.
 */

import { notFound } from "next/navigation";
import VerifyFilePanel from "./VerifyFilePanel";

interface Props {
    params: Promise<{ doc_code: string }>;
}

async function getDocument(docCode: string) {
    const res = await fetch(`http://localhost:3000/api/documents/resolve/${docCode}`, {
        method: "GET",
        cache: "no-store",
    });
    return { status: res.status, ok: res.ok };
}

export default async function VerifyPage({ params }: Props) {
    const { doc_code } = await params;
    const { status, ok } = await getDocument(doc_code);

    if (status === 404) notFound();

    if (!ok) {
        return (
            <main style={s.page}>
                <div style={s.card}>
                    <span style={s.icon}>⚠️</span>
                    <h1 style={s.title}>Storage Error</h1>
                    <p style={s.meta}>
                        A record was found for <code style={s.code}>{doc_code}</code>, but the file
                        could not be retrieved. Please contact the document issuer.
                    </p>
                </div>
            </main>
        );
    }

    const pdfUrl = `/api/documents/resolve/${doc_code}`;

    return (
        <main style={s.page}>
            <div style={s.card}>
                {/* ── Registration status ── */}
                <span style={s.icon}>✅</span>
                <h1 style={s.title}>Document Registered</h1>

                <p style={s.label}>Document Code</p>
                <code style={s.code}>{doc_code}</code>

                <div style={s.divider} />

                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={s.link}>
                    Open PDF ↗
                </a>
                <p style={s.hint}>
                    The PDF opens inline in your browser. The QR code embedded in it links back to this page.
                </p>

                {/* ── File verification panel (client component) ── */}
                <VerifyFilePanel docCode={doc_code} />
            </div>
        </main>
    );
}

// ── Inline styles ─────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
    page: {
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
        maxWidth: "520px",
        width: "100%",
        textAlign: "center",
        boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
    },
    icon: { fontSize: "48px" },
    title: { fontSize: "22px", fontWeight: 700, margin: "16px 0 8px", color: "#111" },
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
    divider: { height: "1px", background: "#eee", margin: "24px 0" },
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
    hint: { marginTop: "16px", fontSize: "13px", color: "#999", lineHeight: 1.5 },
    meta: { fontSize: "14px", color: "#555", lineHeight: 1.6, marginTop: "12px" },
};
