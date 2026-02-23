"use client";

/**
 * /upload — Upload Document page.
 * Lets the admin upload a PDF via browser and view the registration result.
 */

import { useState, useEffect, useRef } from "react";
import AppShell, { btnStyle, token } from "@/components/layout/AppShell";

interface UploadResult {
    doc_code: string;
    verify_url: string;
    file_hash: string;
    file_path: string;
}

const TOKEN_KEY = "docucert_admin_token";

export default function UploadPage() {
    const [tok, setTok] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
    const [result, setResult] = useState<UploadResult | null>(null);
    const [errMsg, setErrMsg] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const saved = localStorage.getItem(TOKEN_KEY);
        if (saved) setTok(saved);
    }, []);

    const handleTokenChange = (v: string) => {
        setTok(v);
        localStorage.setItem(TOKEN_KEY, v);
    };

    const handleUpload = async () => {
        if (!file) { setErrMsg("Select a PDF file first."); setStatus("error"); return; }
        if (!tok.trim()) { setErrMsg("Enter the admin token first."); setStatus("error"); return; }

        setStatus("uploading"); setResult(null); setErrMsg("");

        const authHeader = { Authorization: `Bearer ${tok.trim()}` };

        try {
            // ── Step 1: Ask server which upload mode to use ───────────────────
            const modeRes = await fetch("/api/documents/upload-url", { headers: authHeader });
            const modeJson = await modeRes.json();

            if (!modeRes.ok) {
                setErrMsg(modeJson.error ?? `HTTP ${modeRes.status}`);
                setStatus("error");
                return;
            }

            if (modeJson.mode === "presigned") {
                // ── R2 mode: PUT directly to R2, then POST /process ───────────
                const { doc_code, upload_url } = modeJson;

                // Step 2: Upload raw PDF directly to R2 (bypasses Vercel body limit)
                const putRes = await fetch(upload_url, {
                    method: "PUT",
                    headers: { "Content-Type": "application/pdf" },
                    body: file,
                });

                if (!putRes.ok) {
                    setErrMsg(`Failed to upload to storage (HTTP ${putRes.status}). Check R2 CORS settings.`);
                    setStatus("error");
                    return;
                }

                // Step 3: Tell server to process the uploaded file (embed QR, hash, record)
                const processRes = await fetch("/api/documents/process", {
                    method: "POST",
                    headers: { ...authHeader, "Content-Type": "application/json" },
                    body: JSON.stringify({ doc_code }),
                });
                const processJson = await processRes.json();

                if (!processRes.ok || !processJson.success) {
                    setErrMsg(processJson.error ?? `HTTP ${processRes.status}`);
                    setStatus("error");
                    return;
                }

                setResult(processJson);
                setStatus("done");
            } else {
                // ── Local mode: direct multipart POST (original flow) ─────────
                const form = new FormData();
                form.append("file", file);

                const res = await fetch("/api/documents/upload", {
                    method: "POST",
                    headers: authHeader,
                    body: form,
                });
                const json = await res.json();

                if (!res.ok || !json.success) {
                    setErrMsg(json.error ?? `HTTP ${res.status}`);
                    setStatus("error");
                    return;
                }

                setResult(json);
                setStatus("done");
            }

            if (fileRef.current) fileRef.current.value = "";
            setFile(null);
        } catch (e) {
            setErrMsg(e instanceof Error ? e.message : "Network error.");
            setStatus("error");
        }
    };


    return (
        <AppShell title="Upload Document" description="Register a PDF to embed a verification QR code and record its cryptographic hash.">
            <div style={s.card}>
                {/* File */}
                <div style={s.field}>
                    <label style={s.label}>PDF File</label>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="application/pdf,.pdf"
                        style={s.fileInput}
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                </div>

                {/* Token */}
                <div style={s.field}>
                    <label style={s.label}>Admin Token</label>
                    <input
                        type="password"
                        placeholder="Bearer token"
                        value={tok}
                        onChange={(e) => handleTokenChange(e.target.value)}
                        style={s.textInput}
                        autoComplete="current-password"
                    />
                </div>

                <button
                    onClick={handleUpload}
                    disabled={status === "uploading"}
                    style={{ ...btnStyle, width: "100%", opacity: status === "uploading" ? 0.65 : 1 }}
                >
                    {status === "uploading" ? "Uploading…" : "Upload Document"}
                </button>

                {status === "error" && (
                    <div style={s.errorBox}><strong>Error:</strong> {errMsg}</div>
                )}

                {status === "done" && result && (
                    <div style={s.resultBox}>
                        <div style={s.resultRow}>
                            <span style={s.resultKey}>Document Code</span>
                            <code style={s.code}>{result.doc_code}</code>
                        </div>
                        <div style={s.resultRow}>
                            <span style={s.resultKey}>Verification URL</span>
                            <code style={s.code}>{result.verify_url}</code>
                        </div>
                        <div style={s.resultRow}>
                            <span style={s.resultKey}>SHA-256</span>
                            <code style={{ ...s.code, fontSize: "11px", wordBreak: "break-all" }}>{result.file_hash}</code>
                        </div>
                        <a href={`/v/${result.doc_code}`} target="_blank" rel="noopener noreferrer" style={s.resultLink}>
                            Open verification page →
                        </a>
                    </div>
                )}
            </div>
        </AppShell>
    );
}

const s: Record<string, React.CSSProperties> = {
    card: {
        background: "#fff",
        border: `1px solid #e5e7eb`,
        borderRadius: 10,
        padding: "28px 32px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
    },
    field: { display: "flex", flexDirection: "column", gap: "6px" },
    label: {
        fontSize: "12px",
        fontWeight: 600,
        color: token.colorMuted,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
    },
    fileInput: { fontSize: "14px", cursor: "pointer", fontFamily: token.fontFamily },
    textInput: {
        padding: "9px 12px",
        fontSize: "14px",
        border: "1px solid #e5e7eb",
        borderRadius: 6,
        outline: "none",
        fontFamily: "monospace",
        color: "#111",
    },
    errorBox: {
        padding: "12px 16px",
        background: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: 6,
        color: "#b91c1c",
        fontSize: "14px",
    },
    resultBox: {
        padding: "20px",
        background: "#f0fdf4",
        border: "1px solid #86efac",
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },
    resultRow: { display: "flex", flexDirection: "column", gap: "3px" },
    resultKey: {
        fontSize: "11px",
        fontWeight: 600,
        color: token.colorMuted,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
    },
    code: {
        fontFamily: "monospace",
        fontSize: "13px",
        background: "rgba(0,0,0,0.05)",
        padding: "3px 8px",
        borderRadius: 4,
        color: "#111",
        display: "inline-block",
    },
    resultLink: {
        fontSize: "14px",
        fontWeight: 600,
        color: "#059669",
        textDecoration: "none",
        marginTop: 4,
    },
};
