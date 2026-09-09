// Idempotent setup of the Cloudflare rules that keep bot traffic off Vercel.
// Run:  node --env-file=.env.local scripts/cloudflare-rules.mjs [--dry-run]
//
// 1. Managed Challenge on catalog routes for anything that is not a Cloudflare
//    verified bot (Googlebot/Bingbot/Applebot pass; residential-proxy botnets
//    that spread ~10 req/IP across thousands of IPs do not).
// 2. Cache rule so Cloudflare caches catalog HTML per the CDN-Cache-Control
//    header the pages already send (24h). Without a rule CF ignores it for HTML.
//
// scripts/revalidate-paths.ts purges changed URLs from the CF cache after a sync.

const ZONE = "ceff95dbe7a80c057a1ea8a18ea0bf80";
const CUSTOM_RULESET = "9e3049e6cbe34e98979970683f0b6f92";
const DRY = process.argv.includes("--dry-run");
const token = process.env.CLOUDFLARE_API_TOKEN;
if (!token) throw new Error("CLOUDFLARE_API_TOKEN missing");

const CATALOG =
  '(starts_with(http.request.uri.path, "/artist/") or ' +
  'starts_with(http.request.uri.path, "/artwork/") or ' +
  'starts_with(http.request.uri.path, "/browse/") or ' +
  'http.request.uri.path eq "/search")';

const CHALLENGE_RULE = {
  description: "challenge-catalog-non-verified-bots",
  action: "managed_challenge",
  enabled: true,
  expression: `${CATALOG} and not cf.client.bot`,
};

const CACHE_RULE = {
  description: "cache-catalog-html-respect-origin",
  action: "set_cache_settings",
  enabled: true,
  expression: `${CATALOG} or starts_with(http.request.uri.path, "/sitemap")`,
  action_parameters: {
    cache: true,
    edge_ttl: { mode: "respect_origin" },
    browser_ttl: { mode: "respect_origin" },
  },
};

async function cf(method, path, body) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(`${method} ${path}: ${JSON.stringify(json.errors)}`);
  }
  return json.result;
}

async function upsertCustomRule(rule) {
  const rs = await cf("GET", `/zones/${ZONE}/rulesets/${CUSTOM_RULESET}`);
  const existing = (rs.rules ?? []).find(
    (r) => r.description === rule.description,
  );
  if (existing) {
    console.log(`~ custom rule "${rule.description}" exists — updating`);
    if (DRY) return;
    await cf(
      "PATCH",
      `/zones/${ZONE}/rulesets/${CUSTOM_RULESET}/rules/${existing.id}`,
      rule,
    );
  } else {
    console.log(`+ custom rule "${rule.description}"`);
    if (DRY) return;
    await cf("POST", `/zones/${ZONE}/rulesets/${CUSTOM_RULESET}/rules`, rule);
  }
}

async function upsertCacheRule(rule) {
  let rules = [];
  try {
    const rs = await cf(
      "GET",
      `/zones/${ZONE}/rulesets/phases/http_request_cache_settings/entrypoint`,
    );
    rules = rs.rules ?? [];
  } catch {
    // no cache ruleset yet
  }
  const others = rules
    .filter((r) => r.description !== rule.description)
    .map(({ id, ...r }) => r);
  console.log(
    `${rules.some((r) => r.description === rule.description) ? "~" : "+"} cache rule "${rule.description}"`,
  );
  if (DRY) return;
  await cf(
    "PUT",
    `/zones/${ZONE}/rulesets/phases/http_request_cache_settings/entrypoint`,
    { rules: [...others, rule] },
  );
}

await upsertCustomRule(CHALLENGE_RULE);
await upsertCacheRule(CACHE_RULE);
console.log(DRY ? "\nDry run — nothing changed." : "\nDone.");
