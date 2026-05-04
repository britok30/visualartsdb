import { Pool } from "@neondatabase/serverless";

const scrape = new Pool({
  connectionString: process.env.SCRAPE_DATABASE_URL,
  max: 2,
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 30000,
});
const prod = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 30000,
});

const tables = [
  "artists",
  "museums",
  "genres",
  "styles",
  "movements",
  "periods",
  "tags",
  "artworks",
  "daily_art",
  "artwork_artists",
  "artwork_styles",
  "artwork_tags",
  "artist_styles",
  "artist_movements",
];

async function count(pool: Pool, table: string): Promise<number> {
  const { rows } = await pool.query(
    `SELECT count(*)::int as count FROM "${table}"`
  );
  return rows[0].count;
}

async function main() {
  console.log("Comparing row counts: scrape (deduped) vs production (current)\n");
  console.log(
    "table".padEnd(20) +
      "scrape".padStart(12) +
      "production".padStart(14) +
      "delta".padStart(12)
  );
  console.log("-".repeat(58));

  for (const t of tables) {
    const [s, p] = await Promise.all([count(scrape, t), count(prod, t)]);
    const delta = s - p;
    const sign = delta > 0 ? "+" : delta < 0 ? "" : " ";
    console.log(
      t.padEnd(20) +
        s.toLocaleString().padStart(12) +
        p.toLocaleString().padStart(14) +
        `${sign}${delta.toLocaleString()}`.padStart(12)
    );
  }

  await scrape.end();
  await prod.end();
}

main().catch(async (err) => {
  console.error("count failed:", err);
  await scrape.end();
  await prod.end();
  process.exit(1);
});
