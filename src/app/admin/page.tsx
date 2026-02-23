"use client";

/**
 * /admin — Admin Panel.
 * View all registered documents and revoke any active one.
 */

import { useState, useEffect, useCallback } from "react";
import AppShell, { btnStyle, btnDangerStyle, token } from "@/components/layout/AppShell";

const TOKEN_KEY = "docucert_admin_token";

interface DocRow {
    id: number;
    doc_code: string;
    uploaded_at: string;
    file_hash: string | null;
    revoked: number;
}

export default function AdminPage() {
    const [tok, setTok] = useState("");
    const [docs, setDocs] = useState<DocRow[]>([]);
    const [loading, setLoad] = useState(false);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState<string | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem(TOKEN_KEY);
        if (saved) setTok(saved);
    }, []);

    const handleTokenChange = (v: string) => {
        setTok(v);
        localStorage.setItem(TOKEN_KEY, v);
    };

    const fetchDocs = useCallback(async (t: string) => {
        if (!t.trim()) { setError("Enter admin token first."); return; }
        setLoad(true); setError("");
        try {
            const res = await fetch("/api/admin/documents", {
                headers: { Authorization: `Bearer ${t.trim()}` },
            });
            const json = await res.json();
            if (!json.success) { setError(json.error ?? `HTTP ${res.status}`); return; }
            setDocs(json.documents);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Network error.");
        } finally {
            setLoad(false);
        }
    }, []);

    const handleRevoke = async (docCode: string) => {
        if (!confirm(`Revoke ${docCode}? This action cannot be undone.`)) return;
        setBusy(docCode);
        try {
            const res = await fetch("/api/admin/revoke", {
                method: "POST",
                headers: { Authorization: `Bearer ${tok.trim()}`, "Content-Type": "application/json" },
                body: JSON.stringify({ doc_code: docCode }),
            });
            const json = await res.json();
            if (!json.success) { alert(`Error: ${json.error}`); return; }
            await fetchDocs(tok);
        } catch (e) {
            alert(e instanceof Error ? e.message : "Network error.");
        } finally {
            setBusy(null);
        }
    };

    return (
        <AppShell
            title="Admin Panel"
            description="View all registered documents and manage their status."
            maxWidth={900}
        >
            {/* Token row */}
            <div style={s.tokenRow}>
                <input
                    type="password"
                    placeholder="Admin token"
                    value={tok}
                    onChange={(e) => handleTokenChange(e.target.value)}
                    style={s.tokenInput}
                />
                <button
                    onClick={() => fetchDocs(tok)}
                    disabled={loading}
                    style={{ ...btnStyle, opacity: loading ? 0.65 : 1, whiteSpace: "nowrap" }}
                >
                    {loading ? "Loading…" : "Load Documents"}
                </button>
            </div>

            {error && <div style={s.errorBox}>{error}</div>}

            {docs.length > 0 && (
                <div style={s.tableCard}>
                    <div style={s.tableHeader}>
                        <span style={s.tableCount}>{docs.length} document{docs.length !== 1 ? "s" : ""}</span>
                    </div>
                    <table style={s.table}>
                        <thead>
                            <tr>
                                {["Document Code", "Uploaded At", "Status", "Action"].map((h) => (
                                    <th key={h} style={s.th}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {docs.map((doc) => (
                                <tr key={doc.doc_code} style={{ background: doc.revoked ? "#fef2f2" : "#fff" }}>
                                    <td style={s.td}>
                                        <a
                                            href={`/v/${doc.doc_code}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={s.codeLink}
                                        >
                                            {doc.doc_code}
                                        </a>
                                    </td>
                                    <td style={s.td}>{new Date(doc.uploaded_at).toLocaleString()}</td>
                                    <td style={s.td}>
                                        {doc.revoked
                                            ? <span style={s.badgeRevoked}>Revoked</span>
                                            : <span style={s.badgeActive}>Active</span>
                                        }
                                    </td>
                                    <td style={s.td}>
                                        <button
                                            onClick={() => handleRevoke(doc.doc_code)}
                                            disabled={!!doc.revoked || busy === doc.doc_code}
                                            style={{
                                                ...btnDangerStyle,
                                                padding: "6px 14px",
                                                fontSize: "13px",
                                                opacity: doc.revoked ? 0.3 : 1,
                                                cursor: doc.revoked ? "not-allowed" : "pointer",
                                            }}
                                        >
                                            {busy === doc.doc_code ? "Revoking…" : "Revoke"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && docs.length === 0 && !error && (
                <p style={{ color: token.colorMuted, fontSize: "14px", marginTop: 8 }}>
                    No documents loaded. Enter the admin token and click Load Documents.
                </p>
            )}
        </AppShell>
    );
}

const s: Record<string, React.CSSProperties> = {
    tokenRow: { display: "flex", gap: "10px", marginBottom: "16px" },
    tokenInput: {
        flex: 1,
        padding: "9px 12px",
        fontSize: "14px",
        border: "1px solid #e5e7eb",
        borderRadius: 6,
        fontFamily: "monospace",
        color: "#111",
        outline: "none",
    },
    errorBox: {
        marginBottom: "12px",
        padding: "12px 16px",
        background: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: 6,
        color: "#b91c1c",
        fontSize: "14px",
    },
    tableCard: {
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        overflow: "hidden",
    },
    tableHeader: {
        padding: "12px 16px",
        borderBottom: "1px solid #f3f4f6",
        background: "#f9fafb",
    },
    tableCount: { fontSize: "13px", color: token.colorMuted, fontWeight: 500 },
    table: { width: "100%", borderCollapse: "collapse" },
    th: {
        padding: "10px 16px",
        textAlign: "left",
        fontSize: "12px",
        fontWeight: 600,
        color: token.colorMuted,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        borderBottom: "1px solid #f3f4f6",
        background: "#f9fafb",
    },
    td: {
        padding: "12px 16px",
        fontSize: "13px",
        color: "#374151",
        borderBottom: "1px solid #f3f4f6",
        verticalAlign: "middle",
    },
    codeLink: {
        fontFamily: "monospace",
        fontWeight: 700,
        color: "#111",
        textDecoration: "none",
        fontSize: "13px",
    },
    badgeActive: {
        padding: "2px 10px",
        background: "#dcfce7",
        color: "#166534",
        borderRadius: 100,
        fontSize: "12px",
        fontWeight: 600,
    },
    badgeRevoked: {
        padding: "2px 10px",
        background: "#fee2e2",
        color: "#991b1b",
        borderRadius: 100,
        fontSize: "12px",
        fontWeight: 600,
    },
};
