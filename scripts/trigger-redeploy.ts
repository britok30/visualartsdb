// Shared post-sync hook. A full redeploy clears Vercel's rendered page cache,
// which can make crawlers re-warm a million-page catalog against Neon. Keep it
// opt-in for this free project; fresh rows still appear on uncached URLs.
export async function triggerRedeploy(): Promise<void> {
  if (process.env.REDEPLOY_AFTER_SYNC !== "1") {
    console.log(
      "\n⏭ Skipping Vercel redeploy. Set REDEPLOY_AFTER_SYNC=1 only when you\n" +
        "   intentionally want to invalidate the rendered page cache."
    );
    return;
  }

  const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hook) {
    console.log(
      "\n⚠ VERCEL_DEPLOY_HOOK_URL not set — skipping redeploy.\n" +
        "   Add a Deploy Hook URL to .env.local, or redeploy manually."
    );
    return;
  }
  try {
    const res = await fetch(hook, { method: "POST" });
    console.log(
      res.ok
        ? "\n🚀 Triggered Vercel redeploy — live site refreshes once the build finishes."
        : `\n⚠ Deploy hook returned ${res.status} — redeploy not triggered. Redeploy manually.`
    );
  } catch (err) {
    console.log(
      `\n⚠ Deploy hook request failed (${(err as Error).message}) — redeploy manually.`
    );
  }
}
