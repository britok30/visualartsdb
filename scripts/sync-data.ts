import { Pool } from "@neondatabase/serverless";

const source = new Pool({ connectionString: process.env.SCRAPE_DATABASE_URL });
const target = new Pool({ connectionString: process.env.DATABASE_URL });

// Order: parents first, join tables last
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

const BATCH_SIZE = 500;

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

// Cursor-based pagination using the "id" column (for entity tables)
async function syncEntityTable(table: string) {
  const columns = await getColumns(table);
  const colList = columns.map((c) => `"${c}"`).join(", ");

  const {
    rows: [{ count }],
  } = await source.query(`SELECT count(*)::int as count FROM "${table}"`);
  console.log(`\n📦 ${table}: ${count} rows`);

  if (count === 0) {
    console.log(`   ⏭ skipping (empty)`);
    return;
  }

  await target.query(`TRUNCATE "${table}" CASCADE`);

  let cursor = "00000000-0000-0000-0000-000000000000";
  let synced = 0;

  while (true) {
    const { rows } = await source.query(
      `SELECT ${colList} FROM "${table}" WHERE "id" > $1 ORDER BY "id" LIMIT $2`,
      [cursor, BATCH_SIZE]
    );

    if (rows.length === 0) break;

    await batchInsert(table, columns, rows);

    cursor = rows[rows.length - 1].id;
    synced += rows.length;
    const pct = Math.min(100, Math.round((synced / count) * 100));
    process.stdout.write(`\r   ✓ ${synced}/${count} (${pct}%)`);
  }

  console.log();
}

// For join tables (composite PK, no "id" column) — use two-column cursor
async function syncJoinTable(table: string) {
  const columns = await getColumns(table);
  const colList = columns.map((c) => `"${c}"`).join(", ");
  const col1 = `"${columns[0]}"`;
  const col2 = `"${columns[1]}"`;

  const {
    rows: [{ count }],
  } = await source.query(`SELECT count(*)::int as count FROM "${table}"`);
  console.log(`\n📦 ${table}: ${count} rows`);

  if (count === 0) {
    console.log(`   ⏭ skipping (empty)`);
    return;
  }

  await target.query(`TRUNCATE "${table}" CASCADE`);

  let cursor1 = "00000000-0000-0000-0000-000000000000";
  let cursor2 = "00000000-0000-0000-0000-000000000000";
  let synced = 0;

  while (true) {
    const { rows } = await source.query(
      `SELECT ${colList} FROM "${table}"
       WHERE (${col1}, ${col2}) > ($1, $2)
       ORDER BY ${col1}, ${col2}
       LIMIT $3`,
      [cursor1, cursor2, BATCH_SIZE]
    );

    if (rows.length === 0) break;

    await batchInsert(table, columns, rows);

    const lastRow = rows[rows.length - 1];
    cursor1 = lastRow[columns[0]];
    cursor2 = lastRow[columns[1]];
    synced += rows.length;
    const pct = Math.min(100, Math.round((synced / count) * 100));
    process.stdout.write(`\r   ✓ ${synced}/${count} (${pct}%)`);
  }

  console.log();
}

async function dropForeignKeys(): Promise<
  { table: string; name: string; def: string }[]
> {
  const { rows } = await target.query(`
    SELECT
      tc.table_name,
      tc.constraint_name,
      pg_get_constraintdef(pgc.oid) as constraint_def
    FROM information_schema.table_constraints tc
    JOIN pg_constraint pgc ON pgc.conname = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
    ORDER BY tc.table_name
  `);

  const fks = rows.map(
    (r: { table_name: string; constraint_name: string; constraint_def: string }) => ({
      table: r.table_name,
      name: r.constraint_name,
      def: r.constraint_def,
    })
  );

  for (const fk of fks) {
    await target.query(
      `ALTER TABLE "${fk.table}" DROP CONSTRAINT "${fk.name}"`
    );
  }
  console.log(`🔓 Dropped ${fks.length} foreign key constraints`);
  return fks;
}

async function restoreForeignKeys(
  fks: { table: string; name: string; def: string }[]
) {
  let restored = 0;
  for (const fk of fks) {
    try {
      await target.query(
        `ALTER TABLE "${fk.table}" ADD CONSTRAINT "${fk.name}" ${fk.def}`
      );
      restored++;
    } catch {
      console.log(`   ⚠ Could not restore ${fk.name} on ${fk.table}`);
    }
  }
  console.log(`🔒 Restored ${restored}/${fks.length} foreign key constraints`);
}

async function main() {
  console.log("🔄 Starting data sync...\n");
  console.log(
    `Source: ${process.env.SCRAPE_DATABASE_URL?.split("@")[1]?.split("/")[0]}`
  );
  console.log(
    `Target: ${process.env.DATABASE_URL?.split("@")[1]?.split("/")[0]}`
  );

  // Drop FK constraints to avoid violations during sync
  const fks = await dropForeignKeys();

  for (const table of entityTables) {
    await syncEntityTable(table);
  }

  for (const table of joinTables) {
    await syncJoinTable(table);
  }

  // Clean orphaned rows before restoring FK constraints
  console.log("\n🧹 Cleaning orphaned rows...");
  const cleanups = [
    `DELETE FROM artwork_artists WHERE artwork_id NOT IN (SELECT id FROM artworks)`,
    `DELETE FROM artwork_artists WHERE artist_id NOT IN (SELECT id FROM artists)`,
    `DELETE FROM artwork_styles WHERE artwork_id NOT IN (SELECT id FROM artworks)`,
    `DELETE FROM artwork_styles WHERE style_id NOT IN (SELECT id FROM styles)`,
    `DELETE FROM artwork_tags WHERE artwork_id NOT IN (SELECT id FROM artworks)`,
    `DELETE FROM artwork_tags WHERE tag_id NOT IN (SELECT id FROM tags)`,
    `DELETE FROM artist_styles WHERE artist_id NOT IN (SELECT id FROM artists)`,
    `DELETE FROM artist_styles WHERE style_id NOT IN (SELECT id FROM styles)`,
    `UPDATE artworks SET genre_id = NULL WHERE genre_id IS NOT NULL AND genre_id NOT IN (SELECT id FROM genres)`,
    `UPDATE artworks SET museum_id = NULL WHERE museum_id IS NOT NULL AND museum_id NOT IN (SELECT id FROM museums)`,
  ];
  for (const q of cleanups) {
    const r = await target.query(q);
    if (r.rowCount && r.rowCount > 0) {
      console.log(`   ${q.slice(0, 50)}... (${r.rowCount} rows)`);
    }
  }

  // Restore FK constraints
  console.log();
  await restoreForeignKeys(fks);

  // Verify final counts
  console.log("\n📊 Verifying counts...");
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

  await source.end();
  await target.end();

  console.log("\n✅ Sync complete!");
}

main().catch(async (err) => {
  console.error("❌ Sync failed:", err);
  await source.end();
  await target.end();
  process.exit(1);
});
