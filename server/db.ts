import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('news.db');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS reporters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    base_language TEXT NOT NULL,
    title_en TEXT,
    title_hi TEXT,
    title_mr TEXT,
    content_en TEXT,
    content_hi TEXT,
    content_mr TEXT,
    coverage TEXT CHECK(coverage IN ('local', 'national', 'international')),
    category TEXT,
    image_url TEXT,
    published INTEGER DEFAULT 0,
    reporter_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES reporters(id)
  );
`);

export default db;
