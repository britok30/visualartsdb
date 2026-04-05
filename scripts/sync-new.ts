import { Pool } from "@neondatabase/serverless";

const source = new Pool({
  connectionString: process.env.SCRAPE_DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 30000,
});
const target = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 30000,
});

// Sync order: parents first, then artworks, then join tables
const entityTables = [
  "artists",
  "museums",
  "genres",
  "styles",
  "movements",
  "periods",
  "tags",
  "artworks",
  "daily_art",
];

const joinTables = [
  "artwork_artists",
  "artwork_styles",
  "artwork_tags",
  "artist_styles",
  "artist_movements",
];

const BATCH_SIZE = 2000;

async function getColumns(table: string): Promise<string[]> {
  const { rows } = await source.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1
     ORDER BY ordinal_position`,
    [table]
  );
  return rows.map((r: { column_name: string }) => r.column_name);
}

async function batchInsert(
  table: string,
  columns: string[],
  rows: Record<string, unknown>[]
) {
  const colList = columns.map((c) => `"${c}"`).join(", ");
  const placeholders = rows
    .map((_: unknown, rowIdx: number) => {
      const p = columns.map(
        (_: unknown, colIdx: number) =>
          `$${rowIdx * columns.length + colIdx + 1}`
      );
      return `(${p.join(", ")})`;
    })
    .join(", ");

  const values = rows.flatMap((row) => columns.map((col) => row[col]));

  await target.query(
    `INSERT INTO "${table}" (${colList}) VALUES ${placeholders} ON CONFLICT DO NOTHING`,
    values
  );
}

async function getLatestCreatedAt(table: string): Promise<string | null> {
  const { rows } = await target.query(
    `SELECT max(created_at) as latest FROM "${table}"`
  );
  return rows[0]?.latest ?? null;
}

async function syncNewEntityRows(table: string): Promise<number> {
  const columns = await getColumns(table);
  const colList = columns.map((c) => `"${c}"`).join(", ");

  const latest = await getLatestCreatedAt(table);

  // Count new rows in source
  const countQuery = latest
    ? `SELECT count(*)::int as count FROM "${table}" WHERE created_at > $1`
    : `SELECT count(*)::int as count FROM "${table}"`;
  const countParams = latest ? [latest] : [];
  const {
    rows: [{ count }],
  } = await source.query(countQuery, countParams);

  if (count === 0) {
    console.log(`   ⏭ ${table}: no new rows`);
    return 0;
  }

  console.log(`\n📦 ${table}: ${count} new rows`);

  // Cursor-based fetch of only new rows
  let cursor = "00000000-0000-0000-0000-000000000000";
  let synced = 0;

  while (true) {
    const query = latest
      ? `SELECT ${colList} FROM "${table}" WHERE created_at > $1 AND id > $2 ORDER BY id LIMIT $3`
      : `SELECT ${colList} FROM "${table}" WHERE id > $1 ORDER BY id LIMIT $2`;
    const params = latest
      ? [latest, cursor, BATCH_SIZE]
      : [cursor, BATCH_SIZE];

    const { rows } = await source.query(query, params);
    if (rows.length === 0) break;

    await batchInsert(table, columns, rows);

    cursor = rows[rows.length - 1].id;
    synced += rows.length;
    const pct = Math.min(100, Math.round((synced / count) * 100));
    process.stdout.write(`\r   ✓ ${synced}/${count} (${pct}%)`);
  }

  if (synced > 0) console.log();
  return synced;
}

async function syncNewJoinRows(table: string): Promise<number> {
  const columns = await getColumns(table);
  const colList = columns.map((c) => `"${c}"`).join(", ");
  const col1 = columns[0];
  const col2 = columns[1];

  // Get all IDs currently in target
  const { rows: targetRows } = await target.query(
    `SELECT "${col1}", "${col2}" FROM "${table}"`
  );
  const targetSet = new Set(
    targetRows.map(
      (r: Record<string, string>) => `${r[col1]}|${r[col2]}`
    )
  );

  // Fetch all from source in batches, insert only missing
  let cursor1 = "00000000-0000-0000-0000-000000000000";
  let cursor2 = "00000000-0000-0000-0000-000000000000";
  let inserted = 0;

  while (true) {
    const { rows } = await source.query(
      `SELECT ${colList} FROM "${table}"
       WHERE ("${col1}", "${col2}") > ($1, $2)
       ORDER BY "${col1}", "${col2}"
       LIMIT $3`,
      [cursor1, cursor2, BATCH_SIZE]
    );

    if (rows.length === 0) break;

    const newRows = rows.filter(
      (r: Record<string, string>) =>
        !targetSet.has(`${r[col1]}|${r[col2]}`)
    );

    if (newRows.length > 0) {
      await batchInsert(table, columns, newRows);
      inserted += newRows.length;
    }

    const lastRow = rows[rows.length - 1];
    cursor1 = lastRow[col1];
    cursor2 = lastRow[col2];
  }

  if (inserted > 0) {
    console.log(`\n📦 ${table}: ${inserted} new rows inserted`);
  } else {
    console.log(`   ⏭ ${table}: no new rows`);
  }

  return inserted;
}

async function main() {
  console.log("🔄 Incremental sync — new rows only\n");
  console.log(
    `Source: ${process.env.SCRAPE_DATABASE_URL?.split("@")[1]?.split("/")[0]}`
  );
  console.log(
    `Target: ${process.env.DATABASE_URL?.split("@")[1]?.split("/")[0]}`
  );
  console.log();

  let totalNew = 0;

  for (const table of entityTables) {
    totalNew += await syncNewEntityRows(table);
  }

  for (const table of joinTables) {
    totalNew += await syncNewJoinRows(table);
  }

  // Summary
  console.log(`\n📊 Total new rows synced: ${totalNew}`);

  if (totalNew > 0) {
    console.log("\n📊 Current counts:");
    const allTables = [...entityTables, ...joinTables];
    for (const table of allTables) {
      const src = await source.query(
        `SELECT count(*)::int as count FROM "${table}"`
      );
      const tgt = await target.query(
        `SELECT count(*)::int as count FROM "${table}"`
      );
      const srcCount = src.rows[0].count;
      const tgtCount = tgt.rows[0].count;
      const match = srcCount === tgtCount ? "✓" : "✗";
      console.log(`   ${match} ${table}: ${tgtCount}/${srcCount}`);
    }
  }

  await source.end();
  await target.end();

  console.log("\n✅ Incremental sync complete!");
}

main().catch(async (err) => {
  console.error("❌ Sync failed:", err);
  await source.end();
  await target.end();
  process.exit(1);
});
