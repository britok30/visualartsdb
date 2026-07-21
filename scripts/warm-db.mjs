// Pre-build warm-up: the build is usually the first traffic after an idle
// gap, so with scale-to-zero it can land mid-wake and hit the Neon proxy's
// cached "server_login_retry" errors. Poll until the compute answers (or 90s)
// so `next build` starts against a live database.
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("warm-db: DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(url);
const deadline = Date.now() + 90_000;
let attempt = 0;

for (;;) {
  attempt++;
  try {
    await sql.query("select 1");
    console.log(`warm-db: database ready (attempt ${attempt})`);
    process.exit(0);
  } catch (err) {
    if (Date.now() > deadline) {
      console.error(`warm-db: gave up after ${attempt} attempts: ${err.message}`);
      process.exit(1);
    }
    console.log(`warm-db: not ready (attempt ${attempt}): ${err.message.slice(0, 100)}`);
    await new Promise((r) => setTimeout(r, 3000));
  }
}
