/**
 * Database helper module.
 * Initializes a SQLite database at /data/app.db and creates required tables.
 *
 * Uses better-sqlite3 (synchronous, Node-compatible, no native async overhead).
 */

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Resolve DB path relative to project root (process.cwd() in Next.js = project root)
const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "app.db");

// Ensure the /data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Open (or create) the database file
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");

// Create the documents table if it does not already exist
db.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    doc_code    TEXT    UNIQUE NOT NULL,
    file_path   TEXT    NOT NULL,
    file_hash   TEXT,
    uploaded_at TEXT    NOT NULL
  );
`);

export default db;
