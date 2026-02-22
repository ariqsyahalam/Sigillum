/**
 * /v/[doc_code] — Public document verification page.
 *
 * Server component: queries the repository directly for fast, fresh data.
 * Shows revocation banner if the document has been revoked.
 */

import { notFound } from "next/navigation";
import { getDocumentRepository } from "@/lib/factory";
import VerifyFilePanel from "./VerifyFilePanel";

interface Props {
    params: Promise<{ doc_code: string }>;
}

export default async function VerifyPage({ params }: Props) {
    const { doc_code } = await params;

    // Query DB directly — faster than an HTTP self-call and gives us revoked status
    const repo = getDocumentRepository();
    const record = repo.getDocumentByCode(doc_code);

    if (!record) notFound();

    const isRevoked = record.revoked === 1;
    const pdfUrl = `/api/documents/resolve/${doc_code}`;

    return (
        <main style={s.page}>
            <div style={s.card}>

                {/* ── Revocation banner ── */}
                {isRevoked && (
                    <div style={s.revokedBanner}>
                        <span style={s.revokedIcon}>🚫</span>
                        <div>
                            <p style={s.revokedTitle}>THIS DOCUMENT HAS BEEN REVOKED</p>
                            <p style={s.revokedSub}>
                                This document is no longer considered valid. Contact the issuer for more information.
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Registration status ── */}
                <span style={s.icon}>{isRevoked ? "⚠️" : "✅"}</span>
                <h1 style={s.title}>{isRevoked ? "Document Revoked" : "Document Registered"}</h1>

                <p style={s.label}>Document Code</p>
                <code style={s.code}>{doc_code}</code>

                <div style={s.divider} />

                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={isRevoked ? s.linkRevoked : s.link}>
                    Open PDF ↗
                </a>
                <p style={s.hint}>
                    {isRevoked
                        ? "You can still view the PDF, but this document is no longer certified."
                        : "The PDF opens inline in your browser. The QR code embedded in it links back to this page."}
                </p>

                {/* ── File verification panel (client component) ── */}
                <VerifyFilePanel docCode={doc_code} />
            </div>
        </main>
    );
}

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
    revokedBanner: {
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        background: "#fff1f2",
        border: "1.5px solid #fca5a5",
        borderRadius: "8px",
        padding: "14px 16px",
        marginBottom: "20px",
        textAlign: "left",
    },
    revokedIcon: { fontSize: "24px", flexShrink: 0, marginTop: "2px" },
    revokedTitle: { fontWeight: 800, fontSize: "14px", color: "#991b1b", margin: "0 0 4px", letterSpacing: "0.03em" },
    revokedSub: { fontSize: "12px", color: "#b91c1c", margin: 0, lineHeight: 1.5 },
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
    linkRevoked: {
        display: "inline-block",
        padding: "12px 28px",
        background: "#6b7280",
        color: "#fff",
        borderRadius: "8px",
        textDecoration: "none",
        fontWeight: 600,
        fontSize: "15px",
    },
    hint: { marginTop: "16px", fontSize: "13px", color: "#999", lineHeight: 1.5 },
};
