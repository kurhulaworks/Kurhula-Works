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
5. Create two Cloudflare Pages sites (or one with routes):
   - Customer site pointing to this repository's root (index.html)
   - Admin site pointing to the /admin directory
6. Configure both Pages sites to use the Worker for API requests if needed (the Worker will be published under a route or a service worker).

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

If you want, I can now run the necessary small updates (or create a branch) or help with the Cloudflare deployment steps interactively.