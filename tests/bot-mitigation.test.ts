import assert from "node:assert/strict";
import test from "node:test";
import { IncomingMessage } from "node:http";
import { Socket } from "node:net";
import { parsePage, isValidPage } from "../lib/pagination";
import { normalizeSearchQuery } from "../lib/search-input";
import { matchHas, prepareDestination } from "next/dist/shared/lib/router/utils/prepare-destination";
import nextConfig from "../next.config";
import { NextRequest } from "next/server";
import { proxy } from "../proxy";

test("rejects malformed and oversized pagination inputs", () => {
  for (const input of ["0", "-1", "1.5", "Infinity", "1e6", "01", "", "9999999999"]) {
    assert.equal(parsePage(input), null, input);
  }
  assert.equal(parsePage("2"), 2);
  assert.equal(isValidPage(Infinity, 24), false);
  assert.equal(isValidPage(2, 24), true);
});

test("search input bounds and normalization", () => {
  assert.equal(normalizeSearchQuery("  van   Gogh  "), "van Gogh");
  for (const input of [undefined, ["monet"], "ab", "x".repeat(121)]) {
    assert.equal(normalizeSearchQuery(input), "");
  }
});

test("legacy artist links redirect to static paths without a redirect loop", async () => {
  for (const [query, path] of [
    ["?letter=A&page=2", "/browse/artists/letter/A/page/2"],
    ["?letter=b", "/browse/artists/letter/b"],
    ["?page=3", "/browse/artists/page/3"],
  ]) {
    // Next 16.2's experimental config-test helper drops named `has` captures.
    // Exercise the same matching/destination functions used by the router.
    const url = new URL(`https://www.visualartsdb.com/browse/artists${query}`);
    const values = Object.fromEntries(url.searchParams);
    const rules = await nextConfig.redirects!();
    const request = new IncomingMessage(new Socket());
    const rule = rules.find((rule) => rule.source === url.pathname &&
      matchHas(request, values, rule.has, rule.missing));
    assert.ok(rule);
    const params = matchHas(request, values, rule.has, rule.missing);
    assert.ok(params);
    const target = prepareDestination({ destination: rule.destination, params, query: values, appendParamsToQuery: false });
    assert.equal(target.newUrl, path);
    assert.equal(rule.permanent, true);
    assert.equal(rules.some((rule) => rule.source === path), false);
  }
});

test("bot rejection cannot be shared-cached for real visitors", () => {
  for (const ua of ["ExaSearchBot", "Claude-SearchBot", "GPTBot"]) {
    const response = proxy(new NextRequest("https://www.visualartsdb.com/api/search?q=monet", {
      headers: { "user-agent": ua },
    }));
    assert.equal(response.status, 429);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
  }
  assert.equal(proxy(new NextRequest("https://www.visualartsdb.com/api/search?q=monet", {
    headers: { "user-agent": "Mozilla/5.0" },
  })).status, 200);
});

test("out-of-range catalog pages never execute a sorted row query", async () => {
  process.env.DATABASE_URL = "postgresql://test:test@localhost/test";
  const { db } = await import("../lib/db");
  const { getArtistArtworks, getArtworksByStyle, getArtworksByGenre, getArtworksByMuseum } = await import("../lib/db/queries");
  const original = db.select;
  let sorts = 0;
  // Mock the query boundary: entity lookups and counts succeed; row sorts fail.
  db.select = ((fields?: Record<string, unknown>) => {
    const result = fields && "value" in fields ? [{ value: 24 }] : [{ id: "test" }];
    const builder = {
      from: () => builder, where: () => builder, limit: () => builder,
      innerJoin: () => builder,
      orderBy: () => { sorts++; throw new Error("Unexpected sorted row query"); },
      then: (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve),
    };
    return builder;
  }) as unknown as typeof db.select;
  try {
    for (const query of [getArtistArtworks, getArtworksByStyle, getArtworksByGenre, getArtworksByMuseum]) {
      await assert.rejects(() => query("test", 999999, 24), /NEXT_HTTP_ERROR_FALLBACK;404/);
    }
    assert.equal(sorts, 0);
  } finally {
    db.select = original;
  }
});
