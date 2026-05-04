import { Pool } from "@neondatabase/serverless";

const scrape = new Pool({
  connectionString: process.env.SCRAPE_DATABASE_URL,
  max: 2,
});

const CURRENT_STYLES = new Set([
  "impressionism", "romanticism", "pop-art", "expressionism",
  "art-nouveau-modern", "realism", "cubism", "surrealism",
  "modernism", "post-impressionism", "abstract-expressionism",
  "naive-art-primitivism", "japanese-art", "chinese-art",
  "indian-and-southeast-asian-art", "abstract-art", "symbolism",
  "academicism", "minimalism", "rococo", "art-deco",
]);

const CURRENT_GENRES = new Set([
  "painting", "photograph", "sculpture", "drawing",
  "woodblock-print", "ceramics",
]);

async function main() {
  console.log("\n=== TOP 60 STYLES BY ARTWORK COUNT ===");
  const styles = await scrape.query(`
    SELECT s.name, s.slug, count(*)::int as cnt
    FROM artwork_styles ast
    JOIN styles s ON s.id = ast.style_id
    GROUP BY s.id, s.name, s.slug
    ORDER BY cnt DESC
    LIMIT 60
  `);
  for (const r of styles.rows) {
    const tag = CURRENT_STYLES.has(r.slug) ? "  (already featured)" : "";
    console.log(`  ${String(r.cnt).padStart(7)} — ${r.name}${tag}`);
    console.log(`          slug: ${r.slug}`);
  }

  console.log("\n=== TOP 30 GENRES BY ARTWORK COUNT ===");
  const genres = await scrape.query(`
    SELECT g.name, g.slug, count(*)::int as cnt
    FROM artworks a
    JOIN genres g ON g.id = a.genre_id
    WHERE a.genre_id IS NOT NULL
    GROUP BY g.id, g.name, g.slug
    ORDER BY cnt DESC
    LIMIT 30
  `);
  for (const r of genres.rows) {
    const tag = CURRENT_GENRES.has(r.slug) ? "  (already featured)" : "";
    console.log(`  ${String(r.cnt).padStart(7)} — ${r.name}${tag}`);
    console.log(`          slug: ${r.slug}`);
  }

  await scrape.end();
}

main().catch(async (err) => {
  console.error(err);
  await scrape.end();
  process.exit(1);
});
