// One-off: rewrite artwork/artist slugs containing non-ASCII characters to
// ASCII in BOTH databases (source + target), then revalidate the old/new paths.
// See lib/ascii-slug.ts for why (x-next-cache-tags header 500s on Vercel).
//
//   npx tsx scripts/fix-non-ascii-slugs.ts            # dry run
//   npx tsx scripts/fix-non-ascii-slugs.ts --apply

import { neon } from "@neondatabase/serverless";
import { toAsciiSlug } from "../lib/ascii-slug";
import { revalidatePaths } from "./revalidate-paths";

const APPLY = process.argv.includes("--apply");
const NON_ASCII = "[^ -~]";

type Row = { id: string; slug: string };

async function fixTable(
  label: string,
  url: string,
  table: "artworks" | "artists",
) {
  const sql = neon(url);
  const rows = (await sql.query(
    `select id, slug from ${table} where slug ~ $1 order by slug`,
    [NON_ASCII],
  )) as Row[];
  const changes: { id: string; from: string; to: string }[] = [];
  for (const r of rows) {
    let base = toAsciiSlug(r.slug) || r.id;
    let candidate = base;
    for (let n = 1; ; n++) {
      const taken = (await sql.query(
        `select 1 from ${table} where slug = $1 and id <> $2 limit 1`,
        [candidate, r.id],
      )) as unknown[];
      if (taken.length === 0) break;
      candidate = `${base}-${n}`;
    }
    changes.push({ id: r.id, from: r.slug, to: candidate });
    console.log(`[${label}/${table}] ${r.slug} -> ${candidate}`);
    if (APPLY) {
      await sql.query(`update ${table} set slug = $1 where id = $2`, [
        candidate,
        r.id,
      ]);
    }
  }
  return changes;
}

async function main() {
  const target = process.env.DATABASE_URL;
  const source = process.env.SCRAPE_DATABASE_URL;
  if (!target) throw new Error("DATABASE_URL missing");
  if (!source) throw new Error("SCRAPE_DATABASE_URL missing");

  const paths = new Set<string>();
  for (const [label, url] of [
    ["target", target],
    ["source", source],
  ] as const) {
    for (const table of ["artworks", "artists"] as const) {
      const prefix = table === "artworks" ? "/artwork" : "/artist";
      for (const c of await fixTable(label, url, table)) {
        paths.add(`${prefix}/${c.to}`);
      }
    }
  }
  console.log(`\n${APPLY ? "Applied" : "Dry run:"} ${paths.size} path(s).`);
  if (APPLY) await revalidatePaths([...paths]);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
