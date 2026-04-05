---
name: Database setup
description: Two Neon PostgreSQL databases — production and scrape — connected via env vars, using Drizzle ORM
type: project
---

Two Neon serverless PostgreSQL databases:
- `DATABASE_URL` — production DB serving the app
- `SCRAPE_DATABASE_URL` — source DB populated by scrapers

**Why:** Separation keeps scraper writes isolated from production reads. Scraper does dedup/cleanup independently.

**How to apply:** Sync scripts need both env vars from .env.local. Note: the connection strings contain `&` characters, so they must be single-quoted when exported in shell.
