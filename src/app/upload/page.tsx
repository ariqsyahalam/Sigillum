"use client";

/**
 * /upload — Admin upload page.
 *
 * Lets the document owner upload a PDF via browser.
 * Sends the request to POST /api/documents/upload with the admin token.
 * Token is persisted in localStorage so it survives page refreshes.
 */

import { useState, useEffect, useRef } from "react";

interface UploadResult {
    doc_code: string;
    verify_url: string;
    file_hash: string;
    file_path: string;
}

const TOKEN_KEY = "docucert_admin_token";

export default function UploadPage() {
    const [token, setToken] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
    const [result, setResult] = useState<UploadResult | null>(null);
    const [errorMsg, setError] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    // Load saved token from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(TOKEN_KEY);
        if (saved) setToken(saved);
    }, []);

    // Persist token whenever it changes
    const handleTokenChange = (value: string) => {
        setToken(value);
        localStorage.setItem(TOKEN_KEY, value);
    };

    const handleUpload = async () => {
        if (!file) { setError("Please select a PDF file."); setStatus("error"); return; }
        if (!token.trim()) { setError("Please enter the admin token."); setStatus("error"); return; }

        setStatus("uploading");
        setResult(null);
        setError("");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/documents/upload", {
                method: "POST",
                headers: { Authorization: `Bearer ${token.trim()}` },
                body: formData,
            });

            const json = await res.json();

            if (!res.ok || !json.success) {
                setError(json.error ?? `HTTP ${res.status}`);
                setStatus("error");
                return;
            }

            setResult(json);
            setStatus("done");
            // Reset file input
            if (fileRef.current) fileRef.current.value = "";
            setFile(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Network error.");
            setStatus("error");
        }
    };

    return (
        <main style={s.page}>
            <div style={s.card}>
                <h1 style={s.heading}>DocuCert — Upload</h1>
                <p style={s.sub}>Upload a PDF to register it and embed a verification QR code.</p>

                {/* File input */}
                <label style={s.label}>PDF File</label>
                <input
                    ref={fileRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    style={s.fileInput}
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />

                {/* Token input */}
                <label style={s.label}>Admin Token</label>
                <input
                    type="password"
                    placeholder="Bearer token"
                    value={token}
                    onChange={(e) => handleTokenChange(e.target.value)}
                    style={s.textInput}
                    autoComplete="current-password"
                />

                {/* Upload button */}
                <button
                    onClick={handleUpload}
                    disabled={status === "uploading"}
                    style={{ ...s.btn, opacity: status === "uploading" ? 0.6 : 1 }}
                >
                    {status === "uploading" ? "Uploading…" : "Upload PDF"}
                </button>

                {/* Status messages */}
                {status === "error" && (
                    <div style={s.errorBox}>
                        <strong>Error:</strong> {errorMsg}
                    </div>
                )}

                {status === "done" && result && (
                    <div style={s.resultBox}>
                        <p style={s.resultRow}><span style={s.resultKey}>Doc Code</span><code style={s.code}>{result.doc_code}</code></p>
                        <p style={s.resultRow}><span style={s.resultKey}>Verify URL</span><code style={s.code}>{result.verify_url}</code></p>
                        <p style={s.resultRow}><span style={s.resultKey}>SHA-256</span><code style={{ ...s.code, fontSize: "11px", wordBreak: "break-all" }}>{result.file_hash}</code></p>
                        <a href={`/v/${result.doc_code}`} target="_blank" rel="noopener noreferrer" style={s.link}>
                            Open verification page ↗
                        </a>
                    </div>
                )}
            </div>
        </main>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
    page: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
        fontFamily: "system-ui, sans-serif",
        padding: "24px",
    },
    card: {
        background: "#fff",
        borderRadius: "12px",
        padding: "36px 44px",
        width: "100%",
        maxWidth: "520px",
        boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
    },
    heading: { fontSize: "22px", fontWeight: 700, margin: "0 0 4px", color: "#111" },
    sub: { fontSize: "14px", color: "#777", margin: "0 0 20px" },
    label: { fontSize: "12px", fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "12px" },
    fileInput: { marginTop: "6px", fontSize: "14px", cursor: "pointer" },
    textInput: {
        marginTop: "6px",
        padding: "9px 12px",
        fontSize: "14px",
        border: "1px solid #ddd",
        borderRadius: "6px",
        outline: "none",
        fontFamily: "monospace",
    },
    btn: {
        marginTop: "20px",
        padding: "12px",
        background: "#111",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontSize: "15px",
        fontWeight: 600,
        cursor: "pointer",
    },
    errorBox: {
        marginTop: "16px",
        padding: "12px 16px",
        background: "#fff0f0",
        border: "1px solid #fcc",
        borderRadius: "6px",
        color: "#c00",
        fontSize: "14px",
    },
    resultBox: {
        marginTop: "16px",
        padding: "16px",
        background: "#f0fff4",
        border: "1px solid #6ee7b7",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    resultRow: { margin: 0, display: "flex", flexDirection: "column", gap: "2px" },
    resultKey: { fontSize: "11px", fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em" },
    code: {
        fontFamily: "monospace",
        fontSize: "13px",
        background: "rgba(0,0,0,0.05)",
        padding: "3px 7px",
        borderRadius: "4px",
        color: "#111",
        display: "inline-block",
    },
    link: {
        display: "inline-block",
        marginTop: "8px",
        padding: "9px 18px",
        background: "#111",
        color: "#fff",
        borderRadius: "7px",
        textDecoration: "none",
        fontWeight: 600,
        fontSize: "14px",
        alignSelf: "flex-start",
    },
};
