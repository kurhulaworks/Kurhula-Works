-- init.sql: D1 schema for Kurhula Works

CREATE  TABLE IF NOT EXISTS administrators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_id INTEGER NOT NULL,
  r2_key TEXT NOT NULL UNIQUE,
  filename TEXT NOT NULL,
  content_type TEXT,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(section_id) REFERENCES sections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS enquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_read INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  admin_id INTEGER NOT NULL,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY(admin_id) REFERENCES administrators(id) ON DELETE CASCADE
);

-- Insert initial website sections
INSERT OR IGNORE INTO sections (name, slug) VALUES
('Homepage', 'homepage'),
('Construction', 'construction'),
('Renovations', 'renovations'),
('Projects', 'projects'),
('Before & After', 'before-after'),
('Gallery', 'gallery');

-- Create a default administrator for first-time login.
-- USERNAME: admin
-- PASSWORD: admin123
-- IMPORTANT: Change this password immediately after first login.
INSERT OR IGNORE INTO administrators (username, password) VALUES ('admin', 'admin123');
