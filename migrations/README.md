# Migrations — Kurhula Works (Documentation-only)

This directory contains documentation-style migration files that describe the database schema the application expects.

IMPORTANT — READ THIS FIRST

- These SQL files are documentation-first. They are intended to record the schema that the current application code (Pages Functions and Worker) expects.
- Do NOT run these migrations blindly against a production D1 database. Running SQL without a verified backup can cause data loss.
- These migrations attempt to reflect the current schema used by the repository at the time they were created. They may include optional columns or seeds used by the live system.
- Future schema changes must be incremental and always accompanied by a backup, a staging test, and an explicit, approved deployment plan.

How this repository uses migrations

- The repository historically included `worker/migrations/001_init.sql` (R2/Worker-oriented). A new `migrations/` folder was added to document the schema as used by the Pages Functions / D1 approach.
- `migrations/0001_current_schema.sql` is a documentation representation of the current tables the code expects (administrators, sections, images, enquiries, sessions). It is intended to be the source-of-truth for future schema revisions.

Guidelines for modifying the database schema

- Backup first: Always backup/export your production D1 data before applying any structural changes.
- Use incremental migrations: Each structural change should be represented by a single incremental migration file (0002_..., 0003_..., etc.). Avoid multi-purpose migration files.
- Non-destructive first: Prefer additive changes (new tables, new columns) and avoid destructive changes (DROP COLUMN, DROP TABLE) whenever possible. When destructive changes are required, review and approve them explicitly.
- Validate locally/staging: Apply migrations to an isolated staging D1 instance and run the smoke tests and automated tests before applying to production.
- Document intent: Each migration must explain why the change is needed, what columns/tables are affected, and provide rollback guidance.

Contact / Ownership

- The MASTER repository owner or designated maintainer must approve any migration that alters production structure.


