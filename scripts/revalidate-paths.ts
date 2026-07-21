// Post-sync targeted cache invalidation. Sends changed paths to the site's
// /api/revalidate endpoint so only those pages re-render on their next visit,
// instead of redeploying (which busts every cached page and triggers a
// crawler-driven re-warm of the whole catalog against Neon).

const SITE_URL = process.env.SITE_URL ?? "https://www.visualartsdb.com";
const CHUNK = 500;

export async function revalidatePaths(paths: string[]): Promise<void> {
  if (paths.length === 0) return;

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
