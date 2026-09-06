// Preview: node --env-file=.env.local scripts/cf-rules.mjs
// Apply scoped ASN challenge: append --apply
// After deploying and browser-testing the prefetch changes, append --rate=20.
import { mkdir, writeFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";

const args = process.argv.slice(2);
if (args.some((arg) => !["--apply", "--rate=20"].includes(arg))) {
  throw new Error("Supported options: --apply --rate=20");
}
const token = process.env.CLOUDFLARE_API_TOKEN;
if (!token) throw new Error("CLOUDFLARE_API_TOKEN is required");
const zone = process.env.CLOUDFLARE_ZONE_ID ?? "ceff95dbe7a80c057a1ea8a18ea0bf80";
const base = `https://api.cloudflare.com/client/v4/zones/${zone}`;
async function api(path, method = "GET", body) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20000),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(`Cloudflare ${method} ${path}: ${response.status} ${JSON.stringify(data.errors)}`);
  }
  return data.result;
}

// Read sequentially and only mutate individual rules; never replace a ruleset.
const custom = await api("/rulesets/phases/http_request_firewall_custom/entrypoint");
const rate = await api("/rulesets/phases/http_ratelimit/entrypoint");
const documents = '(http.request.uri.path eq "/search" or starts_with(http.request.uri.path, "/artist/") or starts_with(http.request.uri.path, "/artwork/") or starts_with(http.request.uri.path, "/browse/"))';
const challenge = {
  description: "challenge-scraper-hosting-asns",
  action: "managed_challenge",
  enabled: true,
  expression: `(ip.src.asnum in {215930 208137 16276}) and not cf.client.bot and (http.request.method in {"GET" "HEAD"}) and ${documents}`,
};
const changes = [{ ruleset: custom, desired: challenge }];
if (args.includes("--rate=20")) {
  const existing = rate.rules.filter((r) => r.description === "throttle-aggressive-crawlers");
  if (existing.length !== 1) throw new Error("Expected exactly one existing crawler rate limit");
  changes.push({
    ruleset: rate,
    desired: {
      description: "throttle-aggressive-crawlers",
      action: "block",
      enabled: true,
      expression: '(not starts_with(http.request.uri.path, "/_next/")) and (not starts_with(http.request.uri.path, "/img/")) and (http.request.uri.path ne "/api/revalidate") and (not cf.client.bot)',
      ratelimit: { ...existing[0].ratelimit, requests_per_period: 20 },
    },
  });
}
const plan = changes.map(({ ruleset, desired }) => {
  const matches = ruleset.rules.filter((r) => r.description === desired.description);
  if (matches.length > 1) throw new Error(`Duplicate rules: ${desired.description}`);
  const previous = matches[0];
  const unchanged = previous && Object.entries(desired).every(([key, value]) => isDeepStrictEqual(previous[key], value));
  return { rulesetId: ruleset.id, previous, desired, unchanged: !!unchanged };
});
console.log(JSON.stringify(plan, null, 2));
if (args.includes("--apply")) {
  await mkdir(".cloudflare-backups", { recursive: true });
  const backup = `.cloudflare-backups/${Date.now()}.json`;
  await writeFile(backup, JSON.stringify({ custom, rate, plan }, null, 2), { mode: 0o600, flag: "wx" });
  console.log(`Before-change backup: ${backup}`);
  for (const item of plan) {
    if (item.unchanged) continue;
    const path = `/rulesets/${item.rulesetId}/rules${item.previous ? `/${item.previous.id}` : ""}`;
    await api(path, item.previous ? "PATCH" : "POST", item.desired);
    const updated = await api(`/rulesets/${item.rulesetId}`);
    const rule = updated.rules.find((r) => r.description === item.desired.description);
    if (!rule || !Object.entries(item.desired).every(([key, value]) => isDeepStrictEqual(rule[key], value))) {
      throw new Error(`Read-back verification failed for ${item.desired.description}; inspect ${backup}`);
    }
    console.log(`Verified: ${item.desired.description}`);
  }
} else {
  console.log("Preview only. No rules changed.");
}
