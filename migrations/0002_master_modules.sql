-- 0002_master_modules.sql
-- Add core MASTER modules: business, services, projects, project_images
-- Documentation-first migration: creates new tables required for Business, Services, Projects modules
-- SAFE: uses IF NOT EXISTS and does not modify or drop existing tables

CREATE TABLE IF NOT EXISTS business (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  logo_image_id INTEGER,
  phone TEXT,
  email TEXT,
  whatsapp TEXT,
  address TEXT,
  socials TEXT,        -- JSON string of social links
  metadata TEXT,       -- JSON string for extra settings
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER DEFAULT 1, -- for single-business per client copy (can be used later)
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_id INTEGER,
  display_order INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  FOREIGN KEY(business_id) REFERENCES business(id)
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER DEFAULT 1,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  location TEXT,
  service_id INTEGER,
  featured INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  FOREIGN KEY(service_id) REFERENCES services(id),
  FOREIGN KEY(business_id) REFERENCES business(id)
);

CREATE TABLE IF NOT EXISTS project_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  image_id INTEGER NOT NULL,
  stage TEXT CHECK(stage IN ('before','during','after')) DEFAULT NULL,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY(image_id) REFERENCES images(id) ON DELETE CASCADE
);

-- Note: We intentionally do NOT modify the existing images table here. We use a normalized project_images table to associate images with projects and stages.
