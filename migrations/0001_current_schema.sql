-- 0001_current_schema.sql
-- D1 schema representing the tables currently used by the Pages Functions code in this repository.
-- This migration is documentation-first: do NOT run it blindly against a production database.

-- administrators: stores admin users used by functions/api/admin/login.js
CREATE TABLE IF NOT EXISTS administrators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- sections: website sections used to group images and drive frontend sections
CREATE TABLE IF NOT EXISTS sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
);

-- images: stores image metadata and binary data (base64) for the D1-backed image approach
-- NOTE: the repository currently contains two approaches: a Worker-based R2 approach (uses r2_key)
-- and a Pages Functions D1-based approach (stores base64 in `data`). The schema below documents the
-- D1/base64 approach used by functions/images/[key].js and functions/api/images.js.
CREATE TABLE IF NOT EXISTS images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  content_type TEXT,
  data TEXT,                    -- base64-encoded image data (for the D1 storage approach)
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  display_order INTEGER DEFAULT 0,
  project_id INTEGER,           -- optional FK to projects (future)
  project_stage TEXT,           -- 'before' | 'during' | 'after' (optional, future use)
  FOREIGN KEY(section_id) REFERENCES sections(id) ON DELETE CASCADE
);

-- enquiries: public contact/enquiry submissions
CREATE TABLE IF NOT EXISTS enquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_read INTEGER DEFAULT 0
);

-- sessions: simple session token store used by admin login/logout/authenticate
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  admin_id INTEGER NOT NULL,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY(admin_id) REFERENCES administrators(id) ON DELETE CASCADE
);

-- Optional: seed a few common sections (matches existing code expectations)
INSERT OR IGNORE INTO sections (name, slug) VALUES
  ('Homepage', 'homepage'),
  ('Construction', 'construction'),
  ('Renovations', 'renovations'),
  ('Projects', 'projects'),
  ('Before & After', 'before-after'),
  ('Gallery', 'gallery');
