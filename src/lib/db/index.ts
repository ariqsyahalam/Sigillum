/**
 * Database helper module.
 * Initializes SQLite at /data/app.db lazily on first use.
 * Creates and migrates tables on startup.
 */

import Database, { Database as DatabaseType } from "better-sqlite3";
import path from "path";
import fs from "fs";

let dbInstance: DatabaseType | null = null;

export function getDb(): DatabaseType {
  if (dbInstance) return dbInstance;

  const DB_DIR = path.join(process.cwd(), "data");
  const DB_PATH = path.join(DB_DIR, "app.db");

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  // Create table (new installs)
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      doc_code    TEXT    UNIQUE NOT NULL,
      file_path   TEXT    NOT NULL,
      file_hash   TEXT,
      uploaded_at TEXT    NOT NULL,
      revoked     INTEGER DEFAULT 0
    );
  `);

  // ── Migration: add revoked column to existing databases ──────────────────────
  // ALTER TABLE ADD COLUMN fails if the column already exists, so we catch that.
  try {
    db.exec("ALTER TABLE documents ADD COLUMN revoked INTEGER DEFAULT 0;");
  } catch {
    // Column already exists — this is expected on all runs after the first migration.
  }

  dbInstance = db;
  return dbInstance;
}

// Temporary default export mapping for backward compatibility if needed in some files
export default {
  prepare: (sql: string) => getDb().prepare(sql),
  exec: (sql: string) => getDb().exec(sql),
};
