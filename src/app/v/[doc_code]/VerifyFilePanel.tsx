"use client";

/**
 * VerifyFilePanel — File integrity check section.
 * Client component: uploads a PDF and compares its SHA-256 hash to the stored record.
 */

import { useState, useRef } from "react";
import { btnStyle, btnOutlineStyle, token } from "@/components/layout/AppShell";

interface Props { docCode: string; }

interface VerifyResult {
    match: boolean;
    uploaded_hash: string;
    stored_hash: string;
}

export default function VerifyFilePanel({ docCode }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState<VerifyResult | null>(null);
    const [error, setError] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    const handleVerify = async () => {
        if (!file) { setError("Select a PDF file to verify."); return; }
        setBusy(true); setResult(null); setError("");

        const form = new FormData();
        form.append("file", file);
        form.append("doc_code", docCode);

        try {
            const res = await fetch("/api/documents/verify-file", { method: "POST", body: form });
            const json = await res.json();

            if (!json.success) { setError(json.error ?? `HTTP ${res.status}`); return; }
            setResult({ match: json.match, uploaded_hash: json.uploaded_hash, stored_hash: json.stored_hash });
            if (fileRef.current) fileRef.current.value = "";
            setFile(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Network error.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div style={s.panel}>
            <p style={s.title}>File Integrity Check</p>
            <p style={s.sub}>
                Upload the PDF you received to confirm it exactly matches the registered version.
            </p>

            <div style={s.inputRow}>
                <input
                    ref={fileRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    style={s.fileInput}
                    onChange={(e) => { setFile(e.target.files?.[0] ?? null); setResult(null); setError(""); }}
                />
                <button
                    onClick={handleVerify}
                    disabled={busy}
                    style={{ ...(file ? btnStyle : btnOutlineStyle), opacity: busy ? 0.65 : 1 }}
                >
                    {busy ? "Checking…" : "Verify File"}
                </button>
            </div>

            {error && (
                <div style={s.errorBox}>{error}</div>
            )}

            {result && (
                <div style={result.match ? s.matchBox : s.noMatchBox}>
                    <div style={s.verdictRow}>
                        <span style={result.match ? s.dotMatch : s.dotNoMatch} />
                        <p style={s.verdict}>
                            {result.match ? "File matches the registered version" : "File does not match the registered version"}
                        </p>
                    </div>
                    <div style={s.hashBlock}>
                        <div style={s.hashRow}>
                            <span style={s.hashLabel}>Your file</span>
                            <code style={s.hashVal}>{result.uploaded_hash}</code>
                        </div>
                        <div style={s.hashRow}>
                            <span style={s.hashLabel}>Registered</span>
                            <code style={s.hashVal}>{result.stored_hash}</code>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const s: Record<string, React.CSSProperties> = {
    panel: {
        marginTop: "16px",
        padding: "20px 24px",
        background: "#fff",
        border: `1px solid #e5e7eb`,
        borderRadius: 10,
    },
    title: { fontWeight: 700, fontSize: "14px", color: "#111", margin: "0 0 4px" },
    sub: { fontSize: "13px", color: token.colorMuted, margin: "0 0 16px", lineHeight: 1.5 },
    inputRow: { display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" },
    fileInput: { fontSize: "13px", cursor: "pointer", flex: 1, minWidth: 0 },
    errorBox: {
        marginTop: "12px",
        padding: "10px 14px",
        background: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: 6,
        color: "#b91c1c",
        fontSize: "13px",
    },
    matchBox: {
        marginTop: "14px",
        padding: "14px 16px",
        background: "#f0fdf4",
        border: "1px solid #86efac",
        borderRadius: 8,
    },
    noMatchBox: {
        marginTop: "14px",
        padding: "14px 16px",
        background: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: 8,
    },
    verdictRow: { display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "10px" },
    dotMatch: { width: 8, height: 8, borderRadius: "50%", background: "#16a34a", flexShrink: 0, marginTop: 4 },
    dotNoMatch: { width: 8, height: 8, borderRadius: "50%", background: "#dc2626", flexShrink: 0, marginTop: 4 },
    verdict: { fontWeight: 700, fontSize: "13px", color: "#111", margin: 0, lineHeight: 1.4 },
    hashBlock: { display: "flex", flexDirection: "column", gap: "6px" },
    hashRow: { display: "flex", flexDirection: "column", gap: "2px" },
    hashLabel: {
        fontSize: "10px",
        fontWeight: 600,
        color: token.colorMuted,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
    },
    hashVal: {
        fontFamily: "monospace",
        fontSize: "11px",
        color: "#374151",
        wordBreak: "break-all",
        background: "rgba(0,0,0,0.04)",
        padding: "3px 8px",
        borderRadius: 4,
        display: "block",
    },
};
