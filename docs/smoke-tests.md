# Smoke Test Checklist — Kurhula Works (Phase 1)

Run these checks after any non-trivial change (or manually to verify the live site).

Public website
- [ ] Homepage loads: GET https://kurhula-works.pages.dev
- [ ] GET /api/sections returns JSON (200) with expected sections
- [ ] GET /api/images?section=<slug> returns JSON list; each item contains id, filename, url; `url` should be fetchable
- [ ] Visit an `img` src returned by the images API (e.g., GET /images/:id or /images/<r2_key>) and confirm Content-Type and image bytes are returned (200)
- [ ] Submit contact form: POST /api/enquiries with JSON { name, email, phone, message } — expect 200/ok

Admin
- [ ] Admin page loads: GET https://kurhula-works.pages.dev/admin/
- [ ] POST /api/admin/login with correct credentials returns token (200)
- [ ] With token in Authorization header, GET /api/enquiries returns existing enquiries (200)
- [ ] Upload image via admin UI (admin posts to /api/images/upload) — expect success (200) and image visible via GET /api/images?section=<slug> on public site
- [ ] Delete image via admin UI (DELETE /api/images/:id) — expect success (200) and image removed from public listing
- [ ] POST /api/admin/logout invalidates the token (following a logout, protected endpoints return 401)

D1 / bindings
- [ ] Confirm the Pages/Worker environment binds env.DB to the expected D1 instance (do not change binding name)
- [ ] Confirm backups are available before any schema changes

Notes
- The repository currently contains two approaches to image storage: (A) Pages Functions reading base64 from D1 (functions/images/[key].js) and (B) Worker + R2 approach (worker/index.js). Verify which approach the live deployment uses for uploads/reads.
- If behavior differs between staging and production, check routing and whether /api/* is handled by the Worker or by Pages Functions in your Pages project settings.
