# Sigillum

Sigillum is a lightweight document certification system that embeds QR verification into PDFs and stores cryptographic proof of file integrity.

When a PDF is uploaded, Sigillum stamps a unique verification QR code onto every page, computes the BLAKE3 hash of the final file, and records both in a database. Anyone who receives the document can scan the QR or visit the verification URL to confirm the file is authentic and unmodified.

## Features

- QR code embedded into every page of the uploaded PDF
- BLAKE3 integrity hash stored at upload time
- Public verification URL per document (`/v/[doc_code]`)
- File integrity check — upload a copy to confirm it matches the registered version
- Admin-only upload protected by a bearer token
- Document revocation support
- Local mode (SQLite + filesystem) with no external dependencies
- Cloud mode (Supabase + Cloudflare R2) ready for Vercel deployment

## Live Demo

> Demo: https://sigillum.risya.id

---

## Quick Start (Local)

```bash
git clone https://github.com/ariqsyahalam/Sigillum
cd sigillum
npm install
```

Copy the example env file and fill in the minimum required values:

```bash
cp .env.local.example .env.local
```

Set at minimum:

```
APP_BASE_URL=http://localhost:3000
DOCUCERT_ADMIN_TOKEN=your-secret-token
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `APP_BASE_URL` | ✅ | Full public URL of the deployment, no trailing slash. Used to generate QR verification links embedded in PDFs. |
| `DOCUCERT_ADMIN_TOKEN` | ✅ | Bearer token required to upload documents and access the admin panel. Generate with `openssl rand -hex 32`. |
| `DB_MODE` | — | `sqlite` (default) or `supabase`. Controls which database backend is used. |
| `STORAGE_MODE` | — | `local` (default) or `r2`. Controls where uploaded PDFs are stored. |
| `SUPABASE_URL` | Cloud only | Your Supabase project URL, e.g. `https://xxxx.supabase.co`. |
| `SUPABASE_SERVICE_ROLE_KEY` | Cloud only | Supabase service role key. Never expose this to the client. |
| `R2_ENDPOINT` | Cloud only | Cloudflare R2 S3-compatible endpoint, e.g. `https://<account-id>.r2.cloudflarestorage.com`. |
| `R2_ACCESS_KEY` | Cloud only | R2 access key ID. |
| `R2_SECRET_KEY` | Cloud only | R2 secret access key. |
| `R2_BUCKET` | Cloud only | R2 bucket name where certified PDFs are stored. |

---

## Deployment

### Option A — Local only (SQLite + local storage)

No external services needed. Set DB_MODE and STORAGE_MODE to their defaults (or omit them):

```env
APP_BASE_URL=https://yourdomain.com
DOCUCERT_ADMIN_TOKEN=<openssl rand -hex 32>
DB_MODE=sqlite
STORAGE_MODE=local
```

Run:

```bash
npm run build
npm start
```

The SQLite database is stored at `/data/app.db`. Uploaded PDFs are stored at `/storage/documents/`. Back up both directories to preserve data.

---

### Option B — Cloud mode (Vercel + Supabase + Cloudflare R2)

#### 1. Supabase — create the database table

In your Supabase project, run the following in the SQL editor:

```sql
CREATE TABLE documents (
  id          BIGSERIAL PRIMARY KEY,
  doc_code    TEXT UNIQUE NOT NULL,
  file_path   TEXT NOT NULL,
  file_hash   TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL,
  revoked     INT NOT NULL DEFAULT 0
);
```

#### 2. Cloudflare R2 — create a bucket

1. Go to Cloudflare Dashboard → R2 → **Create bucket**
2. Name it (e.g. `sigillum-documents`)
3. Create an API token with **Object Read & Write** permissions
4. Note the account ID, access key, secret key, and bucket name

The bucket should be **private** — files are served via short-lived signed URLs.

#### 3. Deploy to Vercel

Install the Vercel CLI if needed:

```bash
npm install -g vercel
```

Link and deploy:

```bash
vercel link
vercel --prod
```

Set all environment variables in the Vercel dashboard (Project → Settings → Environment Variables) or import them:

```bash
grep -v '^#' .env | grep -v '^$' | while IFS='=' read -r key rest; do
  printf '%s' "$rest" | vercel env add "$key" production --force
done
```

> **Important:** use `printf` not `echo` when piping to `vercel env add` — `echo` appends a trailing newline to the value which will cause authentication failures.

---

## API Reference

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/documents/upload` | Bearer token | Upload and register a PDF |
| `GET` | `/api/documents/resolve/[doc_code]` | None | Stream or redirect to the registered PDF |
| `POST` | `/api/documents/verify-file` | None | Compare an uploaded file's hash against the stored record |
| `GET` | `/api/admin/documents` | Bearer token | List all registered documents |
| `POST` | `/api/admin/revoke` | Bearer token | Revoke a registered document |
| `GET` | `/api/health` | None | Liveness check (returns DB and storage status) |

---

## Verifying an Installation

1. Go to `/upload`, enter your admin token, and upload a PDF.
2. On success, you will receive a `verify_url` and `doc_code`.
3. Open the verify URL — the page should show **Registered and Active** with document details.
4. Click **Open Registered PDF →** to confirm the QR-stamped file is accessible.
5. On the verify page, upload the same PDF under **File Integrity Check** — it should show a **Match**.
6. Check `/api/health` — it should return `{ "status": "ok" }`.

---

## Security Notes

- **Admin token:** Set a long random value (`openssl rand -hex 32`). It is never stored in the database, never returned to the client, and never logged.
- **Never commit `.env` or `.env.local`:** Both are gitignored. Use `.env.local.example` as the template.
- **Storage bucket:** Keep the R2 bucket private. PDFs are served via 60-second signed URLs, not public links.
- **Revocation:** Revoking a document marks it in the database. The file is not deleted — the verification page displays a revocation banner and the PDF link is muted.

---

## License

MIT
