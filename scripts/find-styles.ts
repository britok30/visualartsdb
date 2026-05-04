import { Pool } from "@neondatabase/serverless";

const p = new Pool({
  connectionString: process.env.SCRAPE_DATABASE_URL,
  max: 2,
});

const queries = [
  "mexic", "aztec", "maya", "muralis", "chicano", "olmec", "tolt",
  "zapot", "post-revolution", "latin", "south-american", "andean",
  "inca", "frida", "diego-rivera", "orozco", "siqueiros",
];

async function main() {
  console.log("=== STYLES ===");
  console.log("term".padEnd(20) + "matches (slug · count)");
  for (const term of queries) {
    const r = await p.query(
      `SELECT s.slug, s.name, count(ast.*)::int as cnt
       FROM styles s
       LEFT JOIN artwork_styles ast ON ast.style_id = s.id
       WHERE LOWER(s.name) LIKE $1 OR LOWER(s.slug) LIKE $1
       GROUP BY s.id, s.slug, s.name
       HAVING count(ast.*) > 0
       ORDER BY cnt DESC LIMIT 5`,
      ["%" + term + "%"]
    );
    if (r.rows.length === 0) {
      console.log(term.padEnd(20) + "(none)");
    } else {
      for (const row of r.rows) {
        console.log(
          term.padEnd(20) + row.slug + " · " + row.cnt + ' ("' + row.name + '")'
        );
      }
    }
  }

  console.log("\n=== GENRES (any Mexican-coded?) ===");
  const g = await p.query(
    `SELECT slug, name FROM genres
     WHERE LOWER(name) LIKE '%mexic%' OR LOWER(name) LIKE '%aztec%' OR LOWER(name) LIKE '%maya%' OR LOWER(name) LIKE '%latin%'
     ORDER BY name LIMIT 20`
  );
  if (g.rows.length === 0) console.log("(none)");
  for (const row of g.rows) console.log(`  ${row.slug} ("${row.name}")`);

  console.log("\n=== TOP MEXICAN ARTISTS BY ARTWORK COUNT ===");
  const a = await p.query(
    `SELECT a.name, a.slug, count(aa.*)::int as cnt
     FROM artists a
     JOIN artwork_artists aa ON aa.artist_id = a.id
     WHERE a.name ILIKE ANY (ARRAY['%kahlo%','%rivera%','%orozco%','%siqueiros%','%tamayo%','%posada%','%toledo%','%izquierdo%','%modotti%','%varo%','%carrington%'])
     GROUP BY a.id, a.name, a.slug
     ORDER BY cnt DESC LIMIT 20`
  );
  if (a.rows.length === 0) console.log("(none)");
  for (const row of a.rows) {
    console.log(`  ${String(row.cnt).padStart(5)} — ${row.name} (${row.slug})`);
  }

  await p.end();
}

main().catch(async (e) => {
  console.error(e);
  await p.end();
  process.exit(1);
});
