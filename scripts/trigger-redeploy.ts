// Shared post-sync hook. The live site's content routes are revalidate=false
// (fully static), so new data only goes live after the cache is busted. A Vercel
// redeploy gets a fresh ISR cache, so pages re-render on-demand with the latest
// DB rows on their next visit. Set VERCEL_DEPLOY_HOOK_URL to a Deploy Hook from
// Vercel → Settings → Git → Deploy Hooks. If it's unset, this just prints a
// reminder — the sync still succeeds.
export async function triggerRedeploy(): Promise<void> {
  const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hook) {
    console.log(
      "\n⚠ VERCEL_DEPLOY_HOOK_URL not set — skipping redeploy.\n" +
        "   Content pages are revalidate=false, so the live site will NOT reflect\n" +
        "   this sync until you redeploy. Add a Deploy Hook URL to .env.local, or\n" +
        "   redeploy manually (git push / `vercel --prod`)."
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
