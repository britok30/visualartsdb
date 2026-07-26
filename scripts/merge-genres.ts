// Merge duplicate singular/plural genres created by the V&A import, which
// derived genres from its `objectType` field ("Painting") alongside the
// existing plural ones ("Paintings"). The split hid the new collection from
// the homepage rows, which query genres by exact name.
//
// Run against BOTH databases (target + scrape source) — sync-new only inserts
// new rows, so it will not propagate an update made on one side.
//
//   CLEANUP_DB_URL=$DATABASE_URL npx tsx scripts/merge-genres.ts [--apply]
//
// Without --apply it previews and changes nothing.

import { neon } from "@neondatabase/serverless";

const url = process.env.CLEANUP_DB_URL;
const APPLY = process.argv.includes("--apply");
// Small batches: each statement is a separate stateless HTTP request, and a
// 0.25 CU compute rewrites a few thousand rows comfortably but not more.
const BATCH = 2000;

if (!url) {
  console.error("CLEANUP_DB_URL not set");
  process.exit(1);
}

// HTTP driver, not the WebSocket Pool: pooled connections kept dropping
// mid-UPDATE ("Connection terminated unexpectedly") against the small compute.
// Every statement here stands alone, so one-shot HTTP requests fit better.
const sql = neon(url);

async function q(text: string, params: unknown[] = []) {
  for (let a = 1; ; a++) {
    try {
      return (await sql.query(text, params)) as Array<Record<string, unknown>>;
    } catch (e) {
      if (a >= 6) throw e;
      console.log(`  retry ${a}: ${(e as Error).message.slice(0, 60)}`);
      await new Promise((r) => setTimeout(r, 3000 * a));
    }
  }
}

/** Canonical form: lowercase, singularized — groups "Painting"/"Paintings". */
const normalize = (name: string) => name.toLowerCase().trim().replace(/s$/, "");

/**
 * The survivor is the plural, capitalized spelling — that is what the existing
 * catalog and the homepage's GENRE_SECTIONS already use.
 */
function pickKeeper(rows: Array<{ id: string; name: string }>) {
  return [...rows].sort((a, b) => {
    const plural = Number(b.name.endsWith("s")) - Number(a.name.endsWith("s"));
    if (plural !== 0) return plural;
    const caps =
      Number(/^[A-Z]/.test(b.name)) - Number(/^[A-Z]/.test(a.name));
    if (caps !== 0) return caps;
    return a.name.localeCompare(b.name);
  })[0];
}

async function main() {
  const genres = await q("SELECT id, name FROM genres");
  const groups = new Map<string, Array<{ id: string; name: string }>>();
  for (const g of genres as Array<{ id: string; name: string }>) {
    const k = normalize(g.name);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(g);
  }

  const merges = [...groups.values()]
    .filter((v) => v.length > 1)
    .map((v) => {
      const keeper = pickKeeper(v);
      return { keeper, losers: v.filter((g) => g.id !== keeper.id) };
    });

  console.log(`${merges.length} duplicate groups${APPLY ? "" : " (preview only)"}`);
  for (const m of merges) {
    console.log(`  ${m.losers.map((l) => `"${l.name}"`).join(", ")} -> "${m.keeper.name}"`);
  }
  if (!APPLY) {
    console.log("\nRe-run with --apply to perform the merge.");
    return;
  }

  let movedTotal = 0;
  for (const m of merges) {
    for (const loser of m.losers) {
      let moved = 0;
      for (;;) {
        // Batched so a single statement never rewrites 200k+ rows at once —
        // the 0.25 CU compute OOMs on large write sets.
        const r = await q(
          `UPDATE artworks SET genre_id = $1
           WHERE id IN (SELECT id FROM artworks WHERE genre_id = $2 LIMIT ${BATCH})
           RETURNING id`,
          [m.keeper.id, loser.id],
        );
        const n = r.length;
        if (n === 0) break;
        moved += n;
        process.stdout.write(`\r  "${loser.name}" -> "${m.keeper.name}": ${moved}`);
      }
      await q("DELETE FROM genres WHERE id = $1", [loser.id]);
      movedTotal += moved;
      console.log(`\r  "${loser.name}" -> "${m.keeper.name}": ${moved} artworks moved, genre removed`);
    }
  }
  console.log(`\nDone: ${movedTotal} artworks re-pointed across ${merges.length} groups.`);
}

main().catch((e) => {
  console.error("FAILED:", (e as Error).message);
  process.exit(1);
});
