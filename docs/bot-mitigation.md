# Bot mitigation

Catalog pages use on-demand static rendering with a 30-day revalidation interval.
Do not add request APIs such as `searchParams` to those pages. Artist browsing
uses `/browse/artists/letter/A/page/2`; query-based links redirect there.
Revalidating `/browse/artists` invalidates its layout subtree, including alphabet
and pagination pages. Syncs continue to use the authenticated publishing API.

Pagination validates syntax and checks the result count before sorted row queries.
Pagination links disable prefetching. Valid deep catalog pages still use OFFSET;
these changes do not replace that query strategy with keyset pagination. Search
accepts 3–120 characters and at most 100 pages. BotID remains log-only because of
recorded false positives.

## Cloudflare

The scoped challenge covers GET/HEAD requests to catalog and search pages from
ASNs 215930, 208137, and 16276, excluding Cloudflare-verified bots. These ASNs came
from the prior traffic investigation; reassess them using Security Analytics.
API endpoints (including publishing and search autocomplete) are outside this
challenge. The existing country block and other bot rules are unchanged.

Preview the current-to-desired rule change:

```sh
node --env-file=.env.local scripts/cf-rules.mjs
```

Append `--apply` to apply it. The script reads current rules, refuses duplicates,
saves the original rulesets in `.cloudflare-backups/`, updates individual rules,
and verifies the result. It stops on API errors; a partially applied run is
safe to rerun. Backups contain the prior rules and IDs for manual rollback in
Cloudflare. Tokens are not included.

The rate limit remains 60 requests per 10 seconds. After deploying the code,
test artist browsing, pagination, and autocomplete in a browser. To preview a
20-request limit with image/static and publishing exclusions:

```sh
node --env-file=.env.local scripts/cf-rules.mjs --rate=20
```

Append `--apply` only after reviewing that preview. Matching requests can include
RSC requests and shared-IP traffic; the threshold is not a count of page clicks.

Measure Vercel function compute, cache misses, expensive paths, and successful
human visits alongside Cloudflare challenge outcomes. Raw block counts alone do
not establish cost savings. Check that alternate Vercel domains cannot bypass
the intended controls. Do not enable broad Cloudflare HTML caching without
accounting for Next.js HTML/RSC variants and targeted revalidation.

## Local validation

```sh
node --import tsx --test tests/bot-mitigation.test.ts
npx tsc --noEmit
```

The regression tests mock the query boundary; they do not connect to Neon.
A compile-only build checks compilation without static database generation:

```sh
node node_modules/next/dist/bin/next build --webpack --experimental-build-mode compile
```

A full production build and post-deployment cache-header/browser checks are still
needed for release. Do not commit or deploy a selective/debug build artifact.
