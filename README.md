# Kurhula Works - Cloudflare deployment

This repository contains a complete test system for Kurhula Works using Cloudflare Pages (frontend) and Workers (API), D1 (database), and R2 (images).

What I added
- Worker API: worker/index.js
- D1 migration: worker/migrations/001_init.sql
- Root website (customer) index.html that loads sections and images dynamically and posts enquiries to the API
- Admin Pages site: admin/index.html to login, upload images, view enquiries
- wrangler.toml with placeholders for account-specific bindings

First-time Cloudflare setup (cannot be done purely from this repo)
1. Create a Cloudflare account and note your account_id.
2. Create a D1 database named KURHULA_D1 (or update wrangler.toml accordingly). Run the migration SQL (worker/migrations/001_init.sql) using the D1 UI or Wrangler.
3. Create an R2 bucket named KURHULA_IMAGES (or update wrangler.toml accordingly).
4. Deploy the Worker (wrangler publish) and bind the D1 and R2 resources as shown in wrangler.toml.
5. Deploy the Pages site and configure the Pages project to route /api/* requests to the Worker or to the Pages Functions implementation depending on your deployment choice.

Defaults
- A default administrator is created by the migration: username `admin`, password `admin123`. Change this password after first login.

Security notes
- No secret keys are stored in the frontend. Sessions are short-lived tokens stored in D1.
- File uploads are validated by MIME type (jpg/png/gif/webp).

Testing checklist
- Customer website loads at the Pages URL.
- Admin login works via /admin.
- Admin can upload an image and assign it to a section — the image will be available in that frontend section.
- Admin can delete an image.
- Customer can submit an enquiry and admin can view it.

## MASTER System (intended architecture)

This repository is intended to become the MASTER SERVICE-BUSINESS WEBSITE SYSTEM. The MASTER is a reusable backend + frontend template that can be copied to create client-specific sites.

MASTER vs CLIENT COPY
- MASTER: the reusable source repository containing the backend API, database schema documentation, admin & customer frontends, and the master design system.
- CLIENT COPY: when onboarding a new client, the MASTER is copied into a new repository for that client. Client-specific branding, images, content, and optional frontend layout changes are applied in the client copy only.

Standardized MASTER architecture (free-first)
- Deployment: Cloudflare Pages (static) + Pages Functions (serverless API) + D1 (SQL database)
- No required paid third-party services for core functionality
- Backend: same-origin /api/* Pages Functions endpoints handle all API logic (authentication, validation, database operations, enquiries, image access)
- Database: D1 is the authoritative persistent store for the MASTER system
- Frontend: static HTML/CSS/JS pages for customer site and admin site; both communicate with backend via /api/*
- Images (free-first): The MASTER currently targets D1-based image storage for free-first operation (base64 blobs in D1). A future optional upgrade to object storage (R2) will be supported behind a storage abstraction, but R2 is not required for the MASTER free-first operation.

Separation of responsibilities
- Backend (Pages Functions): authentication, authorization, validation, D1 access, image operations, JSON APIs
- Customer frontend: presentation and navigation; reads content from /api/*
- Admin frontend: content management (login, image upload, enquiries, content editing) via /api/admin/*

Important repository note (historical/parallel implementations)
- This repository currently contains two coexisting approaches:
  1. Pages Functions + D1 (base64 image storage) — preferred for the MASTER free-first architecture
  2. Worker + R2 (object storage) — historical/alternate implementation present in `worker/index.js`
- Phase 1 documents and preserves both approaches. The MASTER will standardize on Pages Functions + D1. The Worker/R2 code remains in the repository for now and will be reconciled in a later approved phase.

Client customization workflow
- To create a client site, copy the MASTER repository to a new repository and apply client-specific changes:
  - theme variables (colors, fonts)
  - images and content
  - optional frontend layout tweaks
- Do NOT modify the MASTER repository directly to support a single client’s appearance or content.

Safety & change control
- Any schema changes, authentication changes, or image-storage changes must be planned, tested on staging, and explicitly approved before applying to production.
- Back up D1 data before any migration or destructive operation.
