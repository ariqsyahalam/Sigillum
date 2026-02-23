/**
 * AppShell — shared layout wrapper for all internal Sigillum pages.
 *
 * Provides:
 *   - Sticky top header with product name and optional nav link
 *   - Centred, max-width constrained content area
 *   - Consistent background, font, and vertical spacing
 */

import React from "react";
import Link from "next/link";

interface Props {
    children: React.ReactNode;
    /** Page title shown below the header (e.g. "Upload Document") */
    title: string;
    /** Optional short description shown below the title */
    description?: string;
    /** Max content width override — defaults to 600px */
    maxWidth?: number;
    /** When true, hide the Upload / Admin nav links (e.g. on public verify page) */
    hideNav?: boolean;
}

export default function AppShell({ children, title, description, maxWidth = 600, hideNav = false }: Props) {
    return (
        <div style={s.root}>
            {/* ── Header ── */}
            <header style={s.header}>
                <div style={s.headerInner}>
                    <Link href="/" style={s.logo}>SIGILLUM</Link>
                    {!hideNav && (
                        <nav style={s.headerNav}>
                            <Link href="/upload" style={s.navLink}>Upload</Link>
                            <Link href="/admin" style={s.navLink}>Admin</Link>
                        </nav>
                    )}
                </div>
            </header>

            {/* ── Page content ── */}
            <main style={s.main}>
                <div style={{ ...s.content, maxWidth }}>
                    {/* Page heading */}
                    <div style={s.pageHead}>
                        <h1 style={s.pageTitle}>{title}</h1>
                        {description && <p style={s.pageDesc}>{description}</p>}
                    </div>

                    {/* Slot */}
                    {children}
                </div>
            </main>
        </div>
    );
}

// ── Design tokens ─────────────────────────────────────────────────────────────
export const token = {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    colorBg: "#f7f8fa",
    colorSurface: "#ffffff",
    colorBorder: "#e5e7eb",
    colorText: "#111827",
    colorMuted: "#6b7280",
    colorAccent: "#0EA5E9",
    radius: 8,
    radiusSm: 6,
};

// ── Shared button style (import this wherever you render a button) ─────────────
export const btnStyle: React.CSSProperties = {
    padding: "10px 20px",
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: token.radius,
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: token.fontFamily,
    lineHeight: 1.4,
};

export const btnOutlineStyle: React.CSSProperties = {
    ...btnStyle,
    background: "transparent",
    color: "#111827",
    border: `1.5px solid ${token.colorBorder}`,
};

export const btnDangerStyle: React.CSSProperties = {
    ...btnStyle,
    background: "#dc2626",
};

// ── Inner styles ──────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
    root: {
        minHeight: "100vh",
        background: token.colorBg,
        fontFamily: token.fontFamily,
        color: token.colorText,
    },
    header: {
        position: "sticky",
        top: 0,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${token.colorBorder}`,
        zIndex: 100,
    },
    headerInner: {
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "0 32px",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    logo: {
        fontWeight: 800,
        fontSize: "16px",
        color: "#111827",
        textDecoration: "none",
        letterSpacing: "-0.03em",
    },
    headerNav: { display: "flex", gap: "24px", alignItems: "center" },
    navLink: {
        fontSize: "14px",
        fontWeight: 500,
        color: token.colorMuted,
        textDecoration: "none",
    },
    main: {
        padding: "40px 24px 80px",
    },
    content: {
        margin: "0 auto",
        width: "100%",
    },
    pageHead: {
        marginBottom: "24px",
    },
    pageTitle: {
        fontSize: "22px",
        fontWeight: 700,
        color: token.colorText,
        margin: "0 0 6px",
        letterSpacing: "-0.02em",
    },
    pageDesc: {
        fontSize: "14px",
        color: token.colorMuted,
        margin: 0,
        lineHeight: 1.6,
    },
};
