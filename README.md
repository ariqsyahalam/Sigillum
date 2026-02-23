# Sigillum

Sigillum is a lightweight document certification system that embeds QR verification into PDFs and stores cryptographic proof of integrity.

---

## Getting Started

First, copy the example env file and fill in your values:

```bash
cp .env.local.example .env.local
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## How It Works

1. **Upload** — A PDF is submitted to the token-protected upload endpoint.
2. **QR Embedded** — A verification QR code is stamped onto every page before storage.
3. **Hash Recorded** — The SHA-256 fingerprint of the final file is stored alongside the document record.
4. **Verify** — Anyone with the document code can confirm the file is unchanged via the public verification page.

---

## Environment Variables

| Variable | Description |
|---|---|
| `DOCUCERT_ADMIN_TOKEN` | Bearer token required to upload documents and access the admin panel |
| `DOCUCERT_STORAGE_PATH` | Absolute path where certified PDFs are stored (defaults to `./uploads`) |

---

## Routes

| Route | Description |
|---|---|
| `/` | Marketing landing page |
| `/upload` | Upload a PDF and register it |
| `/admin` | View all documents and revoke any active ones |
| `/v/[doc_code]` | Public verification page for a registered document |

---

## Tech Stack

- [Next.js](https://nextjs.org) (App Router)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — embedded SQLite
- [pdf-lib](https://pdf-lib.js.org) — PDF QR stamping
- [qrcode](https://github.com/soldair/node-qrcode) — QR code generation

---

## License

Open source. MIT licensed.
