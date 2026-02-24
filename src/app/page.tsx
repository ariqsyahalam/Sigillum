import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sigillum — Self-Hosted Document Certification with QR Verification",
  description:
    "Sigillum is a lightweight document certification system that embeds QR verification into PDFs and stores cryptographic proof of file integrity. A practical alternative between unmanaged files and expensive enterprise signing platforms.",
};

// ── Data ──────────────────────────────────────────────────────────────────────

const steps = [
  {
    n: "01",
    title: "Upload your signed PDF",
    desc: "Drop in any PDF. Sigillum accepts it via a secure, token-protected endpoint.",
  },
  {
    n: "02",
    title: "QR code embedded automatically",
    desc: "A unique verification QR is stamped onto every page before the file is stored.",
  },
  {
    n: "03",
    title: "BLAKE3 hash recorded",
    desc: "The cryptographic fingerprint of the final file is saved alongside the record.",
  },
  {
    n: "04",
    title: "Anyone can verify authenticity",
    desc: "Scan the QR or share the link — anyone can confirm the file is unchanged.",
  },
];

const features = [
  { icon: "🔒", title: "Immutable Records", desc: "Documents are never overwritten. Every code maps to exactly one file forever." },
  { icon: "📲", title: "QR on Every Page", desc: "Built-in QR code links back to the public verification page for document integrity verification." },
  { icon: "🔑", title: "BLAKE3 Integrity", desc: "Hash of the stamped file is stored. Any modification is immediately detectable." },
  { icon: "🏠", title: "Self-Host Friendly", desc: "Run this self-hosted document certification system on your own machine, VPS, or server." },
  { icon: "🛡️", title: "Token-Gated Upload", desc: "Only authorised holders of the admin token can register new documents." },
  { icon: "🔓", title: "No Vendor Lock-in", desc: "Open codebase, SQLite storage, local filesystem. Your data stays yours." },
];

const testimonials = [
  {
    quote:
      "I needed to prove the file existed at that exact moment before signing the contract. Sigillum handled it in minutes.",
    author: "Freelance Designer",
  },
  {
    quote:
      "Finally a document registry that doesn't require a corporate procurement process just to certify one file.",
    author: "Independent Consultant",
  },
  {
    quote:
      "Perfect for internal approvals and contractor submissions. We self-host it on a $5 VPS.",
    author: "Operations Lead, Small Agency",
  },
];

const pricing = [
  {
    label: "Self-Hosted",
    price: "$0",
    sub: "forever",
    accent: true,
    items: [
      "Full source code",
      "Run on any server",
      "Your storage, your files",
      "No subscription ever",
    ],
    cta: "Get Started",
    ctaHref: "#github",
  },
  {
    label: "Personal Server",
    price: "~$5/mo",
    sub: "hosting only",
    accent: false,
    items: [
      "Deploy to a VPS",
      "Control your own data",
      "Custom domain support",
      "Pay only for infra",
    ],
    cta: "Read the Docs",
    ctaHref: "#github",
  },
  {
    label: "Enterprise Tools",
    price: "$$$+",
    sub: "per seat / per year",
    accent: false,
    muted: true,
    items: [
      "Complex onboarding",
      "Vendor-controlled access",
      "Annual contract required",
      "Features you don't use",
    ],
    cta: null,
    ctaHref: null,
  },
];

// Comparison section data
const comparison = [
  {
    title: "Plain Files",
    highlight: false,
    muted: true,
    badge: null,
    items: [
      { text: "No integrity proof", check: false },
      { text: "Can be modified silently", check: false },
      { text: "No verification history", check: false },
      { text: "No public authenticity link", check: false },
    ],
    note: "Suitable only for fully trusted parties.",
  },
  {
    title: "Sigillum",
    highlight: true,
    muted: false,
    badge: "Best for most teams",
    items: [
      { text: "QR verification embedded in every page", check: true },
      { text: "Cryptographic file integrity proof", check: true },
      { text: "Public verification page per document", check: true },
      { text: "Self-hostable, low-cost, open source", check: true },
      { text: "Simple workflow for individuals or teams", check: true },
    ],
    note: "Ideal when you've already signed manually and need proof of authenticity.",
  },
  {
    title: "Enterprise Platforms",
    highlight: false,
    muted: false,
    badge: null,
    items: [
      { text: "Legally certified e-signature workflows", check: true },
      { text: "Compliance and audit trails", check: true },
      { text: "Subscription pricing per seat", check: false },
      { text: "Onboarding and vendor dependency", check: false },
      { text: "Designed for regulated corporate use", check: false },
    ],
    note: "Best when legal e-signature compliance is a hard requirement.",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      <style>{globalCss}</style>
      <div style={s.root}>

        {/* ── Navbar ── */}
        <nav style={s.nav} aria-label="Main navigation">
          <span style={s.navLogo} aria-label="Sigillum home">SIGILLUM</span>
          <div style={s.navLinks} className="dc-nav-links">
            <a href="#how" style={s.navLink}>How it Works</a>
            <a href="#compare" style={s.navLink}>Compare</a>
            <a href="#pricing" style={s.navLink}>Pricing</a>
            <a href="#github" style={s.navLink}>GitHub</a>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section style={s.hero} aria-label="Hero">
          <div style={s.badge}>Open Source · Self-Hostable · No Subscription</div>
          <h1 style={s.heroH1} className="dc-hero-h1">
            Certify Your Documents.<br />
            <span style={s.heroAccent}>Without Enterprise Pricing.</span>
          </h1>
          <p style={s.heroSub}>
            Sigillum embeds a QR verification code into every page of your PDF and records its
            BLAKE3 cryptographic fingerprint — giving you tamper-evident proof of authenticity
            without a subscription, without vendor lock-in, and without a legal procurement process.
          </p>
          <div style={s.heroCtas}>
            <a href="#github" style={s.btnPrimary} aria-label="View Sigillum source code on GitHub">View on GitHub</a>
            <a href="#how" style={s.btnSecondary}>See How It Works</a>
          </div>
        </section>

        {/* ── Problem ── */}
        <section style={s.section} aria-labelledby="problem-heading">
          <div style={s.sectionInner}>
            <p style={s.eyebrow}>The Problem</p>
            <h2 id="problem-heading" style={s.h2}>Document trust shouldn&apos;t require enterprise contracts.</h2>
            <div style={s.problemGrid} className="dc-grid-3">
              {[
                { icon: "💸", t: "Expensive by default", d: "Leading platforms charge per-seat or per-document fees that add up fast for small teams and freelancers." },
                { icon: "🏗️", t: "Overkill complexity", d: "Most tools bundle e-signing workflows, compliance reports, and audit trails you simply don't need." },
                { icon: "✅", t: "All you actually need", d: "Proof that a file existed at a point in time, a verifiable record, and a QR anyone can scan to confirm integrity." },
              ].map((item) => (
                <div key={item.t} style={s.problemCard}>
                  <span style={s.problemIcon} aria-hidden="true">{item.icon}</span>
                  <h3 style={s.problemTitle}>{item.t}</h3>
                  <p style={s.problemDesc}>{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it Works ── */}
        <section id="how" style={{ ...s.section, background: "#f8f9fb" }} aria-labelledby="how-heading">
          <div style={s.sectionInner}>
            <p style={s.eyebrow}>How it Works</p>
            <h2 id="how-heading" style={s.h2}>A simple PDF QR verification workflow.</h2>
            <div style={s.stepsGrid} className="dc-grid-4">
              {steps.map((step) => (
                <div key={step.n} style={s.stepCard}>
                  <div style={s.stepNum} aria-hidden="true">{step.n}</div>
                  <h3 style={s.stepTitle}>{step.title}</h3>
                  <p style={s.stepDesc}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section style={s.section} aria-labelledby="features-heading">
          <div style={s.sectionInner}>
            <p style={s.eyebrow}>Features</p>
            <h2 id="features-heading" style={s.h2}>Everything you need. Nothing you don&apos;t.</h2>
            <div style={s.featGrid} className="dc-grid-3">
              {features.map((f) => (
                <div key={f.title} style={s.featCard}>
                  <span style={s.featIcon} aria-hidden="true">{f.icon}</span>
                  <h3 style={s.featTitle}>{f.title}</h3>
                  <p style={s.featDesc}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Comparison ── */}
        <section id="compare" style={{ ...s.section, background: "#f8f9fb" }} aria-labelledby="compare-heading">
          <div style={s.sectionInner}>
            <p style={s.eyebrow}>Choose the Right Level of Document Trust</p>
            <h2 id="compare-heading" style={s.h2}>Where does Sigillum fit?</h2>
            <div style={s.compareGrid} className="dc-grid-3">
              {comparison.map((col) => (
                <div
                  key={col.title}
                  style={{
                    ...s.compareCard,
                    ...(col.highlight ? s.compareCardHighlight : {}),
                    ...(col.muted ? s.compareCardMuted : {}),
                  }}
                >
                  {col.badge && <div style={s.compareBadge}>{col.badge}</div>}
                  <h3 style={{ ...s.compareTitle, ...(col.highlight ? { color: "#fff" } : col.muted ? { color: "#aaa" } : {}) }}>
                    {col.title}
                  </h3>
                  <ul style={s.compareList}>
                    {col.items.map((item) => (
                      <li
                        key={item.text}
                        style={{
                          ...s.compareItem,
                          ...(col.highlight ? { color: "rgba(255,255,255,0.9)" } : col.muted ? { color: "#999" } : {}),
                        }}
                      >
                        <span
                          style={{
                            marginRight: 8,
                            color: item.check
                              ? (col.highlight ? "#a7f3d0" : "#10b981")
                              : (col.muted ? "#ccc" : "#f87171"),
                          }}
                          aria-hidden="true"
                        >
                          {item.check ? "✓" : "✗"}
                        </span>
                        {item.text}
                      </li>
                    ))}
                  </ul>
                  <p style={{
                    ...s.compareNote,
                    ...(col.highlight ? { color: "rgba(255,255,255,0.65)" } : col.muted ? { color: "#bbb" } : {}),
                  }}>
                    {col.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" style={{ ...s.section }} aria-labelledby="pricing-heading">
          <div style={s.sectionInner}>
            <p style={s.eyebrow}>Pricing</p>
            <h2 id="pricing-heading" style={s.h2}>Simple pricing.</h2>
            <div style={s.pricingGrid} className="dc-grid-3">
              {pricing.map((plan) => (
                <div
                  key={plan.label}
                  style={{
                    ...s.pricingCard,
                    ...(plan.accent ? s.pricingCardAccent : {}),
                    ...(plan.muted ? s.pricingCardMuted : {}),
                  }}
                >
                  {plan.accent && <div style={s.pricingBadge}>Best Choice</div>}
                  <p style={{ ...s.planLabel, ...(plan.accent ? { color: "#fff" } : {}) }}>{plan.label}</p>
                  <p style={{ ...s.planPrice, ...(plan.accent ? { color: "#fff" } : plan.muted ? { color: "#aaa" } : {}) }}>
                    {plan.price}
                  </p>
                  <p style={{ ...s.planSub, ...(plan.accent ? { color: "rgba(255,255,255,0.7)" } : {}) }}>{plan.sub}</p>
                  <ul style={s.planList}>
                    {plan.items.map((item) => (
                      <li key={item} style={{ ...s.planItem, ...(plan.muted ? { color: "#bbb", textDecoration: "line-through" } : plan.accent ? { color: "rgba(255,255,255,0.9)" } : {}) }}>
                        {!plan.muted && <span style={{ marginRight: 6, color: plan.accent ? "#a7f3d0" : "#10b981" }} aria-hidden="true">✓</span>}
                        {item}
                      </li>
                    ))}
                  </ul>
                  {plan.cta && (
                    <a href={plan.ctaHref ?? "#"} style={plan.accent ? s.planBtnAccent : s.planBtn} aria-label={`${plan.cta} — ${plan.label} plan`}>
                      {plan.cta}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section style={{ ...s.section, background: "#f8f9fb" }} aria-labelledby="testimonials-heading">
          <div style={s.sectionInner}>
            <p style={s.eyebrow}>Who It&apos;s For</p>
            <h2 id="testimonials-heading" style={s.h2}>Built for people who just need proof, not paperwork.</h2>
            <div style={s.testimonialGrid} className="dc-grid-3">
              {testimonials.map((t, i) => (
                <div key={i} style={s.testimonialCard}>
                  <p style={s.testimonialQuote}>&ldquo;{t.quote}&rdquo;</p>
                  <p style={s.testimonialAuthor}>— {t.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── GitHub CTA ── */}
        <section id="github" style={{ ...s.section, background: "#111", textAlign: "center" }} aria-labelledby="github-heading">
          <div style={s.sectionInner}>
            <h2 id="github-heading" style={{ ...s.h2, color: "#fff" }}>Open Source. Transparent. Yours to run.</h2>
            <p style={{ ...s.heroSub, color: "rgba(255,255,255,0.6)", margin: "0 auto 36px", maxWidth: 540 }}>
              Sigillum is designed to be simple, auditable, and deployable on your own infrastructure.
              Read the source, fork it, or contribute.
            </p>
            <a href="https://github.com/ariqsyahalam/Sigillum" target="_blank" rel="noopener noreferrer" style={s.btnGithub} aria-label="View Sigillum source code on GitHub (opens in new tab)">
              View Source on GitHub →
            </a>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={s.footer}>
          <div style={s.footerInner}>
            <div>
              <span style={s.footerLogo}>SIGILLUM</span>
              <p style={s.footerTagline}>Self-hosted document certification with QR verification.</p>
            </div>
            <nav style={s.footerLinks} aria-label="Footer navigation">
              <a href="#how" style={s.footerLink}>How it Works</a>
              <a href="#compare" style={s.footerLink}>Compare</a>
              <a href="#pricing" style={s.footerLink}>Pricing</a>
              <a href="https://github.com/ariqsyahalam/Sigillum" target="_blank" rel="noopener noreferrer" style={s.footerLink}>GitHub</a>
            </nav>
          </div>
          <p style={s.footerCopy}>© 2026 Sigillum. Open source. MIT licensed.</p>
        </footer>
      </div>
    </>
  );
}

// ── Global CSS (responsive breakpoints, font) ─────────────────────────────────
const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', system-ui, sans-serif; }
  @media (max-width: 768px) {
    .dc-nav-links { display: none !important; }
    .dc-hero-h1  { font-size: 36px !important; }
    .dc-grid-3   { grid-template-columns: 1fr !important; }
    .dc-grid-2   { grid-template-columns: 1fr !important; }
    .dc-grid-4   { grid-template-columns: 1fr 1fr !important; }
  }
`;

// ── Styles ────────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  root: { background: "#fff", color: "#111", lineHeight: 1.6 },

  // Nav
  nav: { position: "sticky", top: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 48px", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)", borderBottom: "1px solid #f0f0f0", zIndex: 100 },
  navLogo: { fontWeight: 800, fontSize: "18px", color: "#111", letterSpacing: "-0.03em" },
  navLinks: { display: "flex", gap: "24px", alignItems: "center" },
  navLink: { fontSize: "14px", color: "#555", textDecoration: "none", fontWeight: 500 },
  navCta: { fontSize: "14px", fontWeight: 600, color: "#fff", background: "#111", padding: "8px 18px", borderRadius: "7px", textDecoration: "none" },

  // Hero
  hero: { padding: "96px 48px 80px", textAlign: "center", maxWidth: "800px", margin: "0 auto" },
  badge: { display: "inline-block", fontSize: "12px", fontWeight: 600, color: "#0EA5E9", background: "#E0F2FE", padding: "4px 14px", borderRadius: "100px", letterSpacing: "0.04em", marginBottom: "24px" },
  heroH1: { fontSize: "54px", fontWeight: 800, color: "#111", lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: "20px" },
  heroAccent: { color: "#0EA5E9" },
  heroSub: { fontSize: "18px", color: "#555", lineHeight: 1.7, marginBottom: "16px" },
  heroIdeal: { fontSize: "14px", color: "#888", lineHeight: 1.7, marginBottom: "36px", maxWidth: 560, margin: "0 auto 36px", padding: "12px 20px", background: "#f8f9fb", borderRadius: "8px", border: "1px solid #ebebeb" },
  heroCtas: { display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" },
  btnPrimary: { padding: "14px 28px", background: "#111", color: "#fff", borderRadius: "8px", fontWeight: 600, fontSize: "15px", textDecoration: "none" },
  btnSecondary: { padding: "14px 28px", background: "transparent", color: "#111", borderRadius: "8px", fontWeight: 600, fontSize: "15px", textDecoration: "none", border: "1.5px solid #ddd" },

  // Sections
  section: { padding: "80px 48px" },
  sectionInner: { maxWidth: "960px", margin: "0 auto" },
  eyebrow: { fontSize: "12px", fontWeight: 700, color: "#0EA5E9", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" },
  h2: { fontSize: "36px", fontWeight: 800, color: "#111", letterSpacing: "-0.025em", marginBottom: "40px", lineHeight: 1.25 },

  // Problem
  problemGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" },
  problemCard: { padding: "28px", background: "#fff", border: "1px solid #ebebeb", borderRadius: "12px" },
  problemIcon: { fontSize: "28px", display: "block", marginBottom: "14px" },
  problemTitle: { fontWeight: 700, fontSize: "16px", color: "#111", marginBottom: "8px" },
  problemDesc: { fontSize: "14px", color: "#666", lineHeight: 1.7 },

  // Steps
  stepsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" },
  stepCard: { padding: "28px 20px" },
  stepNum: { fontSize: "13px", fontWeight: 800, color: "#0EA5E9", marginBottom: "14px", letterSpacing: "0.05em" },
  stepTitle: { fontWeight: 700, fontSize: "16px", color: "#111", marginBottom: "8px" },
  stepDesc: { fontSize: "14px", color: "#666", lineHeight: 1.7 },

  // Features
  featGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" },
  featCard: { padding: "28px", background: "#fafafa", border: "1px solid #f0f0f0", borderRadius: "12px" },
  featIcon: { fontSize: "26px", display: "block", marginBottom: "12px" },
  featTitle: { fontWeight: 700, fontSize: "15px", color: "#111", marginBottom: "6px" },
  featDesc: { fontSize: "14px", color: "#666", lineHeight: 1.65 },

  // Comparison
  compareGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", alignItems: "start" },
  compareCard: { background: "#fff", border: "1px solid #ebebeb", borderRadius: "14px", padding: "32px", position: "relative" },
  compareCardHighlight: { background: "#0EA5E9", border: "1px solid #0EA5E9" },
  compareCardMuted: { background: "#fafafa", opacity: 0.85 },
  compareBadge: { position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)", background: "#0369A1", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "4px 14px", borderRadius: "100px", whiteSpace: "nowrap" as const },
  compareTitle: { fontWeight: 800, fontSize: "18px", color: "#111", marginBottom: "20px" },
  compareList: { listStyle: "none", marginBottom: "20px", display: "flex", flexDirection: "column" as const, gap: "10px" },
  compareItem: { fontSize: "14px", color: "#444", display: "flex", alignItems: "flex-start" as const, lineHeight: 1.5 },
  compareNote: { fontSize: "12px", color: "#999", fontStyle: "italic", lineHeight: 1.6, borderTop: "1px solid rgba(0,0,0,0.07)", paddingTop: "16px", marginTop: "4px" },

  // Pricing
  pricingGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", alignItems: "start" },
  pricingCard: { background: "#fff", border: "1px solid #ebebeb", borderRadius: "14px", padding: "32px", position: "relative" },
  pricingCardAccent: { background: "#0EA5E9", border: "1px solid #0EA5E9" },
  pricingCardMuted: { background: "#fafafa" },
  pricingBadge: { position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)", background: "#0369A1", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "4px 14px", borderRadius: "100px", whiteSpace: "nowrap" as const },
  planLabel: { fontWeight: 700, fontSize: "15px", color: "#555", marginBottom: "12px" },
  planPrice: { fontSize: "40px", fontWeight: 800, color: "#111", letterSpacing: "-0.03em", lineHeight: 1 },
  planSub: { fontSize: "13px", color: "#888", marginBottom: "24px", marginTop: "4px" },
  planList: { listStyle: "none", marginBottom: "28px", display: "flex", flexDirection: "column" as const, gap: "8px" },
  planItem: { fontSize: "14px", color: "#444" },
  planBtn: { display: "block", textAlign: "center" as const, padding: "11px", background: "#111", color: "#fff", borderRadius: "8px", textDecoration: "none", fontWeight: 600, fontSize: "14px" },
  planBtnAccent: { display: "block", textAlign: "center" as const, padding: "11px", background: "rgba(255,255,255,0.2)", color: "#fff", borderRadius: "8px", textDecoration: "none", fontWeight: 600, fontSize: "14px", border: "1px solid rgba(255,255,255,0.4)" },

  // Testimonials
  testimonialGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" },
  testimonialCard: { padding: "28px", background: "#fff", border: "1px solid #f0f0f0", borderRadius: "12px" },
  testimonialQuote: { fontSize: "15px", color: "#333", lineHeight: 1.7, marginBottom: "16px", fontStyle: "italic" },
  testimonialAuthor: { fontSize: "13px", color: "#888", fontWeight: 600 },

  // GitHub CTA
  btnGithub: { display: "inline-block", padding: "14px 32px", background: "#fff", color: "#111", borderRadius: "8px", fontWeight: 700, fontSize: "15px", textDecoration: "none" },

  // Footer
  footer: { background: "#f8f9fb", borderTop: "1px solid #ebebeb", padding: "40px 48px 28px" },
  footerInner: { maxWidth: "960px", margin: "0 auto 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" as const, gap: "24px" },
  footerLogo: { fontWeight: 800, fontSize: "16px", color: "#111", display: "block", marginBottom: "6px" },
  footerTagline: { fontSize: "13px", color: "#888" },
  footerLinks: { display: "flex", gap: "20px", flexWrap: "wrap" as const },
  footerLink: { fontSize: "13px", color: "#666", textDecoration: "none", fontWeight: 500 },
  footerCopy: { maxWidth: "960px", margin: "0 auto", fontSize: "12px", color: "#bbb", borderTop: "1px solid #ebebeb", paddingTop: "20px" },
};
