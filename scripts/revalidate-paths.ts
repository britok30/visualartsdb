// Post-sync targeted cache invalidation. Sends changed paths to the site's
// /api/revalidate endpoint so only those pages re-render on their next visit,
// instead of redeploying (which busts every cached page and triggers a
// crawler-driven re-warm of the whole catalog against Neon).

const SITE_URL = process.env.SITE_URL ?? "https://www.visualartsdb.com";
const CHUNK = 500;

export async function revalidatePaths(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  await purgeCloudflarePaths(paths);

  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    console.log(
      "\n⚠ REVALIDATE_SECRET not set — skipping cache revalidation.\n" +
        "   Set it in .env.local and in Vercel env vars (same value)."
    );
    return;
  }

  console.log(`\n♻ Revalidating ${paths.length} paths on ${SITE_URL}…`);

  for (let i = 0; i < paths.length; i += CHUNK) {
    const chunk = paths.slice(i, i + CHUNK);
    try {
      const res = await fetch(`${SITE_URL}/api/revalidate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({ paths: chunk }),
      });
      if (!res.ok) {
        console.log(
          `   ⚠ Revalidate request returned ${res.status} for paths ${i}–${
            i + chunk.length
          }: ${await res.text()}`
        );
      } else {
        console.log(`   ✓ ${Math.min(i + CHUNK, paths.length)}/${paths.length}`);
      }
    } catch (err) {
      console.log(
        `   ⚠ Revalidate request failed (${(err as Error).message}) for paths ${i}–${i + chunk.length}`
      );
    }
  }
}

// Cloudflare caches catalog HTML at the edge (cache rule in
// scripts/cloudflare-rules.mjs), so a Next revalidation alone leaves stale
// copies at Cloudflare for up to 24h. Purge the same URLs there. Free plan:
// 30 URLs per purge call.
const CF_ZONE = "ceff95dbe7a80c057a1ea8a18ea0bf80";
const CF_CHUNK = 30;

export async function purgeCloudflarePaths(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) {
    console.log("\n⚠ CLOUDFLARE_API_TOKEN not set — skipping Cloudflare purge.");
    return;
  }
  console.log(`\n♻ Purging ${paths.length} URLs from Cloudflare…`);
  for (let i = 0; i < paths.length; i += CF_CHUNK) {
    const files = paths.slice(i, i + CF_CHUNK).map((p) => `${SITE_URL}${p}`);
    try {
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${CF_ZONE}/purge_cache`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ files }),
        },
      );
      const json = (await res.json()) as { success: boolean; errors?: unknown };
      if (!json.success) {
        console.log(`   ⚠ Purge failed for ${i}–${i + files.length}: ${JSON.stringify(json.errors)}`);
      } else {
        console.log(`   ✓ ${Math.min(i + CF_CHUNK, paths.length)}/${paths.length}`);
      }
    } catch (err) {
      console.log(`   ⚠ Purge request failed (${(err as Error).message})`);
    }
  }
}
