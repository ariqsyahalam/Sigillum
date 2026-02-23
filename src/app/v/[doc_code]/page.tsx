/**
 * /v/[doc_code] — Document Verification Page.
 * Server component — queries the repository directly for up-to-date revoked status.
 */

import { notFound } from "next/navigation";
import { getDocumentRepository } from "@/lib/factory";
import AppShell, { token } from "@/components/layout/AppShell";
import VerifyFilePanel from "./VerifyFilePanel";

interface Props {
    params: Promise<{ doc_code: string }>;
}

export default async function VerifyPage({ params }: Props) {
    const { doc_code } = await params;

    const repo = getDocumentRepository();
    const record = await repo.getDocumentByCode(doc_code);

    if (!record) notFound();

    const isRevoked = record.revoked === 1;
    const pdfUrl = `/api/documents/resolve/${doc_code}`;

    return (
        <AppShell
            title="Verification Result"
            description={isRevoked
                ? "This document has been revoked by the issuer."
                : "This document is registered in the Sigillum system."}
            hideNav
        >
            {/* ── Revocation warning ── */}
            {isRevoked && (
                <div style={s.revokedBanner}>
                    <div style={s.revokedDot} />
                    <div>
                        <p style={s.revokedTitle}>This document has been revoked</p>
                        <p style={s.revokedSub}>
                            It is no longer considered valid. Contact the issuer for more information.
                        </p>
                    </div>
                </div>
            )}

            {/* ── Document card ── */}
            <div style={s.card}>
                {/* Status row */}
                <div style={s.statusRow}>
                    <span style={isRevoked ? s.statusDotRevoked : s.statusDotActive} />
                    <span style={s.statusLabel}>
                        {isRevoked ? "Revoked" : "Registered and Active"}
                    </span>
                </div>

                <div style={s.divider} />

                {/* Doc code */}
                <div style={s.infoRow}>
                    <span style={s.infoKey}>Document Code</span>
                    <code style={s.infoVal}>{doc_code}</code>
                </div>

                {/* Uploaded at */}
                <div style={s.infoRow}>
                    <span style={s.infoKey}>Registered</span>
                    <span style={{ ...s.infoVal, fontFamily: token.fontFamily, fontSize: "13px" }}>
                        {new Date(record.uploaded_at).toLocaleString()}
                    </span>
                </div>

                <div style={s.divider} />

                {/* PDF link */}
                <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={isRevoked ? s.pdfLinkMuted : s.pdfLink}
                >
                    Open Registered PDF →
                </a>
                {isRevoked && (
                    <p style={s.pdfNote}>
                        The file is still accessible but this document is no longer certified.
                    </p>
                )}
            </div>

            {/* ── File integrity check ── */}
            <VerifyFilePanel docCode={doc_code} />
        </AppShell>
    );
}

const s: Record<string, React.CSSProperties> = {
    revokedBanner: {
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
        padding: "14px 16px",
        background: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: 8,
        marginBottom: "16px",
    },
    revokedDot: {
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: "#dc2626",
        flexShrink: 0,
        marginTop: 4,
    },
    revokedTitle: { fontWeight: 700, fontSize: "14px", color: "#991b1b", margin: "0 0 3px" },
    revokedSub: { fontSize: "13px", color: "#b91c1c", margin: 0, lineHeight: 1.5 },
    card: {
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: "24px 28px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
    },
    statusRow: { display: "flex", alignItems: "center", gap: "8px" },
    statusLabel: { fontSize: "14px", fontWeight: 600, color: "#111" },
    statusDotActive: {
        width: 8, height: 8, borderRadius: "50%", background: "#16a34a", flexShrink: 0,
    },
    statusDotRevoked: {
        width: 8, height: 8, borderRadius: "50%", background: "#dc2626", flexShrink: 0,
    },
    divider: { height: 1, background: "#f3f4f6" },
    infoRow: { display: "flex", flexDirection: "column", gap: "3px" },
    infoKey: {
        fontSize: "11px",
        fontWeight: 600,
        color: token.colorMuted,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
    },
    infoVal: {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#111",
        background: "#f3f4f6",
        padding: "4px 10px",
        borderRadius: 5,
        display: "inline-block",
        letterSpacing: "0.08em",
        fontWeight: 700,
    },
    pdfLink: {
        display: "inline-block",
        fontSize: "14px",
        fontWeight: 600,
        color: "#0EA5E9",
        textDecoration: "none",
    },
    pdfLinkMuted: {
        display: "inline-block",
        fontSize: "14px",
        fontWeight: 600,
        color: token.colorMuted,
        textDecoration: "none",
    },
    pdfNote: { fontSize: "12px", color: token.colorMuted, margin: 0, lineHeight: 1.5 },
};
