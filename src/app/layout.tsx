import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = process.env.APP_BASE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Sigillum — Self-Hosted Document Certification with QR Verification",
    template: "%s — Sigillum",
  },
  description:
    "Sigillum is a lightweight document certification system that embeds QR verification into PDFs and stores cryptographic proof of file integrity. A practical alternative between unmanaged files and expensive enterprise signing platforms.",
  keywords: [
    "document certification",
    "document integrity verification",
    "self-hosted document certification",
    "PDF QR verification system",
    "alternative to digital signing platforms",
    "SHA-256 document proof",
    "open source document registry",
  ],
  authors: [{ name: "Sigillum" }],
  creator: "Sigillum",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Sigillum",
    title: "Sigillum — Self-Hosted Document Certification with QR Verification",
    description:
      "Sigillum embeds QR verification into PDFs and stores cryptographic proof of file integrity. Lightweight, self-hostable, and free — a practical middle ground between plain files and expensive enterprise signing services.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sigillum — Document Certification with QR Verification",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sigillum — Self-Hosted Document Certification with QR Verification",
    description:
      "Embed QR verification into PDFs and store cryptographic proof of file integrity. Free, self-hostable, no subscriptions.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: BASE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Sigillum",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "A lightweight, self-hosted document certification system that embeds QR verification into PDFs and stores cryptographic proof of file integrity.",
  url: BASE_URL,
  license: "https://opensource.org/licenses/MIT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
