// One-off repair after a partial sync-new crash: copies artworks missing from
// target by ID-diff (watermark-independent), then join tables (same full-diff
// as sync-new), then revalidates pages affected since the scrape started.
import { Pool } from "@neondatabase/serverless";
import { revalidatePaths } from "./revalidate-paths";

const source = new Pool({ connectionString: process.env.SCRAPE_DATABASE_URL, max: 2 });
const target = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
// Idle-connection socket drops emit async 'error' events that crash Node
// outside any try/catch — swallow them; the per-query retry handles recovery.
source.on("error", (e: Error) => console.log(`  source pool: ${e.message.slice(0, 80)}`));
target.on("error", (e: Error) => console.log(`  target pool: ${e.message.slice(0, 80)}`));
const BATCH = 2000;
const AFFECTED_SINCE = "2026-07-21";

async function q(pool: Pool, text: string, params: unknown[] = []) {
  for (let a = 1; ; a++) {
    try { return await pool.query(text, params); }
    catch (e) {
      if (a >= 5) throw e;
      console.log(`  retry ${a}: ${(e as Error).message.slice(0, 80)}`);
      await new Promise((r) => setTimeout(r, 3000 * a));
    }
  }
}

async function copyMissing(table: string, idCols: string[], viaArtworkSlug = false) {
  const { rows: cols } = await q(source,
    `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position`, [table]);
  const colList = cols.map((c: { column_name: string }) => `"${c.column_name}"`).join(", ");
  const key = (r: Record<string, string>) => idCols.map((c) => r[c]).join("|");

  // Page the target-ID load — one big SELECT OOMs the 0.25 CU compute.
  const have = new Set<string>();
  let tc = idCols.map(() => "00000000-0000-0000-0000-000000000000");
  for (;;) {
    const { rows: tRows } = await q(target,
      `SELECT ${idCols.map((c) => `"${c}"`).join(",")} FROM "${table}"
       WHERE (${idCols.map((c) => `"${c}"`).join(",")}) > (${idCols.map((_, i) => `$${i + 1}`).join(",")})
       ORDER BY ${idCols.map((c) => `"${c}"`).join(",")} LIMIT 50000`, tc);
    if (tRows.length === 0) break;
    for (const r of tRows) have.add(key(r));
    const last = tRows[tRows.length - 1];
    tc = idCols.map((c) => last[c]);
  }
  console.log(`${table}: target has ${have.size}`);

  let cursor = idCols.map(() => "00000000-0000-0000-0000-000000000000");
  let inserted = 0;
  for (;;) {
    const where = viaArtworkSlug
      ? `WHERE ("${idCols[0]}") > ($1) ORDER BY "${idCols[0]}"`
      : `WHERE (${idCols.map((c) => `"${c}"`).join(",")}) > (${idCols.map((_, i) => `$${i + 1}`).join(",")}) ORDER BY ${idCols.map((c) => `"${c}"`).join(",")}`;
    const { rows } = await q(source, `SELECT ${colList} FROM "${table}" ${where} LIMIT ${BATCH}`, viaArtworkSlug ? [cursor[0]] : cursor);
    if (rows.length === 0) break;
    const missing = rows.filter((r: Record<string, string>) => !have.has(key(r)));
    if (missing.length) {
      const ph = missing.map((_: unknown, ri: number) => `(${cols.map((_: unknown, ci: number) => `$${ri * cols.length + ci + 1}`).join(",")})`).join(",");
      const vals = missing.flatMap((r: Record<string, unknown>) => cols.map((c: { column_name: string }) => r[c.column_name]));
      await q(target, `INSERT INTO "${table}" (${colList}) VALUES ${ph} ON CONFLICT DO NOTHING`, vals);
      inserted += missing.length;
    }
    const last = rows[rows.length - 1];
    cursor = idCols.map((c) => last[c]);
    if (inserted % 20000 < BATCH && inserted > 0) console.log(`  ${table}: ${inserted} inserted…`);
  }
  console.log(`${table}: DONE, ${inserted} inserted`);
}

async function main() {
  await copyMissing("artworks", ["id"], true);
  for (const t of ["artwork_artists", "artwork_styles", "artwork_tags", "artist_styles"]) {
    const { rows: cols } = await q(source,
      `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position LIMIT 2`, [t]);
    await copyMissing(t, cols.map((c: { column_name: string }) => c.column_name));
  }

  console.log("Collecting stale paths…");
  const { rows } = await q(target, `
    SELECT ar.slug, count(aa.artwork_id)::int AS total FROM artists ar
    JOIN artwork_artists aa ON aa.artist_id = ar.id
    WHERE ar.id IN (
      SELECT DISTINCT aa2.artist_id FROM artwork_artists aa2
      JOIN artworks a ON a.id = aa2.artwork_id WHERE a.created_at > $1)
    GROUP BY ar.slug`, [AFFECTED_SINCE]);
  const paths = ["/", "/browse/styles", "/browse/genres", "/browse/museums", "/browse/artists"];
  for (const { slug, total } of rows as Array<{ slug: string; total: number }>) {
    paths.push(`/artist/${slug}`);
    for (let p = 2; p <= Math.ceil(total / 24); p++) paths.push(`/artist/${slug}/page/${p}`);
  }
  await revalidatePaths(paths);
  await source.end(); await target.end();
  console.log("REPAIR DONE");
}

main().catch((e) => { console.error("REPAIR FAILED:", e.message); process.exit(1); });
