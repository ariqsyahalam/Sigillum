"use client";

/**
 * VerifyFilePanel — Interactive file-verification section.
 *
 * Client component: accepts a PDF from the user, POSTs it with the doc_code
 * to /api/documents/verify-file, and shows a clear match / no-match result.
 */

import { useState, useRef } from "react";

interface Props {
    docCode: string;
}

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
        if (!file) { setError("Please select a PDF file to verify."); return; }

        setBusy(true);
        setResult(null);
        setError("");

        const form = new FormData();
        form.append("file", file);
        form.append("doc_code", docCode);

        try {
            const res = await fetch("/api/documents/verify-file", { method: "POST", body: form });
            const json = await res.json();

            if (!json.success) {
                setError(json.error ?? `HTTP ${res.status}`);
                return;
            }

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
            <p style={s.panelTitle}>Verify your local file</p>
            <p style={s.panelSub}>
                Upload the PDF you received to check whether it exactly matches the registered version.
            </p>

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
                style={{ ...s.btn, opacity: busy ? 0.6 : 1 }}
            >
                {busy ? "Verifying…" : "Verify PDF"}
            </button>

            {error && (
                <div style={s.errorBox}>⚠ {error}</div>
            )}

            {result && (
                <div style={result.match ? s.matchBox : s.noMatchBox}>
                    <p style={s.verdict}>
                        {result.match ? "✅ DOCUMENT MATCHES REGISTERED VERSION" : "❌ DOCUMENT DOES NOT MATCH"}
                    </p>
                    <div style={s.hashRow}>
                        <span style={s.hashLabel}>Your file hash</span>
                        <code style={s.hashVal}>{result.uploaded_hash}</code>
                    </div>
                    <div style={s.hashRow}>
                        <span style={s.hashLabel}>Registered hash</span>
                        <code style={s.hashVal}>{result.stored_hash}</code>
                    </div>
                </div>
            )}
        </div>
    );
}

const s: Record<string, React.CSSProperties> = {
    panel: {
        marginTop: "28px",
        padding: "20px 24px",
        background: "#fafafa",
        border: "1px solid #e8e8e8",
        borderRadius: "10px",
        textAlign: "left",
    },
    panelTitle: {
        fontWeight: 700,
        fontSize: "15px",
        color: "#111",
        margin: "0 0 4px",
    },
    panelSub: {
        fontSize: "13px",
        color: "#777",
        margin: "0 0 14px",
        lineHeight: 1.5,
    },
    fileInput: { fontSize: "14px", display: "block", marginBottom: "10px", cursor: "pointer" },
    btn: {
        padding: "9px 22px",
        background: "#333",
        color: "#fff",
        border: "none",
        borderRadius: "7px",
        fontSize: "14px",
        fontWeight: 600,
        cursor: "pointer",
    },
    errorBox: {
        marginTop: "12px",
        padding: "10px 14px",
        background: "#fff0f0",
        border: "1px solid #fcc",
        borderRadius: "6px",
        color: "#c00",
        fontSize: "13px",
    },
    matchBox: {
        marginTop: "14px",
        padding: "14px 18px",
        background: "#f0fff4",
        border: "1px solid #6ee7b7",
        borderRadius: "8px",
    },
    noMatchBox: {
        marginTop: "14px",
        padding: "14px 18px",
        background: "#fff5f5",
        border: "1px solid #fca5a5",
        borderRadius: "8px",
    },
    verdict: {
        fontWeight: 700,
        fontSize: "14px",
        margin: "0 0 12px",
        color: "#111",
    },
    hashRow: { marginBottom: "6px" },
    hashLabel: {
        display: "block",
        fontSize: "11px",
        fontWeight: 600,
        color: "#666",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginBottom: "2px",
    },
    hashVal: {
        display: "block",
        fontFamily: "monospace",
        fontSize: "11px",
        color: "#333",
        wordBreak: "break-all",
        background: "rgba(0,0,0,0.04)",
        padding: "3px 7px",
        borderRadius: "4px",
    },
};
