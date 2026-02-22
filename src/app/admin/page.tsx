"use client";

/**
 * /admin — Document management panel.
 * Lets the admin view all documents and revoke any active one.
 * Token is shared with the upload page via localStorage.
 */

import { useState, useEffect, useCallback } from "react";

const TOKEN_KEY = "docucert_admin_token";

interface DocRow {
    id: number;
    doc_code: string;
    uploaded_at: string;
    file_hash: string | null;
    revoked: number;
}

export default function AdminPage() {
    const [token, setToken] = useState("");
    const [docs, setDocs] = useState<DocRow[]>([]);
    const [loading, setLoad] = useState(false);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState<string | null>(null); // doc_code being revoked

    useEffect(() => {
        const saved = localStorage.getItem(TOKEN_KEY);
        if (saved) setToken(saved);
    }, []);

    const handleTokenChange = (v: string) => {
        setToken(v);
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
        if (!confirm(`Revoke document ${docCode}? This cannot be undone.`)) return;
        setBusy(docCode);
        try {
            const res = await fetch("/api/admin/revoke", {
                method: "POST",
                headers: { Authorization: `Bearer ${token.trim()}`, "Content-Type": "application/json" },
                body: JSON.stringify({ doc_code: docCode }),
            });
            const json = await res.json();
            if (!json.success) { alert(`Error: ${json.error}`); return; }
            await fetchDocs(token); // refresh
        } catch (e) {
            alert(e instanceof Error ? e.message : "Network error.");
        } finally {
            setBusy(null);
        }
    };

    return (
        <main style={s.page}>
            <div style={s.container}>
                <h1 style={s.heading}>DocuCert — Admin Panel</h1>

                {/* Token row */}
                <div style={s.tokenRow}>
                    <input
                        type="password"
                        placeholder="Admin token"
                        value={token}
                        onChange={(e) => handleTokenChange(e.target.value)}
                        style={s.tokenInput}
                    />
                    <button
                        onClick={() => fetchDocs(token)}
                        disabled={loading}
                        style={{ ...s.btn, opacity: loading ? 0.6 : 1 }}
                    >
                        {loading ? "Loading…" : "Load Documents"}
                    </button>
                </div>

                {error && <div style={s.errorBox}>⚠ {error}</div>}

                {/* Document table */}
                {docs.length > 0 && (
                    <div style={s.tableWrap}>
                        <p style={s.count}>{docs.length} document{docs.length !== 1 ? "s" : ""}</p>
                        <table style={s.table}>
                            <thead>
                                <tr style={s.thead}>
                                    <th style={s.th}>Doc Code</th>
                                    <th style={s.th}>Uploaded At</th>
                                    <th style={s.th}>Status</th>
                                    <th style={s.th}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {docs.map((doc) => (
                                    <tr key={doc.doc_code} style={{ background: doc.revoked ? "#fff5f5" : "#fff" }}>
                                        <td style={s.td}>
                                            <a href={`/v/${doc.doc_code}`} target="_blank" rel="noopener noreferrer" style={s.codeLink}>
                                                {doc.doc_code}
                                            </a>
                                        </td>
                                        <td style={s.td}>{new Date(doc.uploaded_at).toLocaleString()}</td>
                                        <td style={s.td}>
                                            {doc.revoked
                                                ? <span style={s.badgeRevoked}>REVOKED</span>
                                                : <span style={s.badgeActive}>ACTIVE</span>}
                                        </td>
                                        <td style={s.td}>
                                            <button
                                                onClick={() => handleRevoke(doc.doc_code)}
                                                disabled={!!doc.revoked || busy === doc.doc_code}
                                                style={{
                                                    ...s.revokeBtn,
                                                    opacity: doc.revoked ? 0.35 : 1,
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
                    <p style={s.empty}>No documents loaded. Enter token and click Load.</p>
                )}
            </div>
        </main>
    );
}

const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#f5f5f5", fontFamily: "system-ui, sans-serif", padding: "32px 24px" },
    container: { maxWidth: "860px", margin: "0 auto" },
    heading: { fontSize: "22px", fontWeight: 700, color: "#111", margin: "0 0 20px" },
    tokenRow: { display: "flex", gap: "10px", marginBottom: "16px" },
    tokenInput: { flex: 1, padding: "9px 12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "6px", fontFamily: "monospace" },
    btn: { padding: "9px 20px", background: "#111", color: "#fff", border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
    errorBox: { marginBottom: "16px", padding: "10px 14px", background: "#fff0f0", border: "1px solid #fcc", borderRadius: "6px", color: "#c00", fontSize: "13px" },
    tableWrap: { background: "#fff", borderRadius: "10px", border: "1px solid #e8e8e8", overflow: "hidden" },
    count: { margin: "0", padding: "12px 16px", fontSize: "13px", color: "#777", borderBottom: "1px solid #eee" },
    table: { width: "100%", borderCollapse: "collapse" },
    thead: { background: "#f8f8f8" },
    th: { padding: "10px 14px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #eee" },
    td: { padding: "11px 14px", fontSize: "13px", color: "#333", borderBottom: "1px solid #f0f0f0", verticalAlign: "middle" },
    codeLink: { fontFamily: "monospace", fontWeight: 700, color: "#111", textDecoration: "none" },
    badgeActive: { padding: "3px 8px", background: "#d1fae5", color: "#065f46", borderRadius: "4px", fontSize: "11px", fontWeight: 700 },
    badgeRevoked: { padding: "3px 8px", background: "#fee2e2", color: "#991b1b", borderRadius: "4px", fontSize: "11px", fontWeight: 700 },
    revokeBtn: { padding: "5px 14px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "5px", fontSize: "12px", fontWeight: 600 },
    empty: { marginTop: "32px", textAlign: "center", color: "#aaa", fontSize: "14px" },
};
