---
name: Data pipeline and sync strategy
description: How data flows from scrape DB to production — incremental sync, scrape DB is clean source, production is superset
type: project
---

Production DB accumulates data over time and is treated as a superset of the scrape DB. The scrape DB is the clean source for new data — deduplication and cleanup happen on the scraper side before syncing.

**Why:** Scrape DB may have rows removed/merged during cleanup, but those rows may still be valid in production (e.g., genres like "Painting" with 30k artworks). Deleting from production based on scrape DB state would cause data loss.

**How to apply:** Always use additive/incremental sync (scripts/sync-new.ts) for routine syncs. Only use full sync (scripts/sync-data.ts) for initial setup or intentional full refreshes. Never auto-delete production rows that are missing from scrape DB.
