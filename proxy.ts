import { NextResponse, type NextRequest } from "next/server";
import { toAsciiSlug } from "./lib/ascii-slug";

// Bots blocked from compute-expensive routes regardless of robots.txt compliance.
// Includes Bytespider and other crawlers known to ignore robots.txt.
// Carefully omits Googlebot/Bingbot/DuckDuckBot/Claude-User etc.
// that drive referral traffic.
const BLOCKED_UAS =
  /\b(GPTBot|ChatGPT-User|ClaudeBot|Claude-Web|Claude-SearchBot|ExaSearchBot|OAI-SearchBot|PerplexityBot|Perplexity-User|anthropic-ai|CCBot|Bytespider|TikTokSpider|Google-Extended|Applebot-Extended|Meta-External(Agent|Fetcher)|FacebookBot|Amazonbot|Diffbot|Omgilibot|Omgili|Webzio-Extended|ImagesiftBot|Timpibot|PetalBot|SemrushBot|AhrefsBot|DotBot|MJ12bot|DataForSeoBot|BLEXBot|SeekportBot|TurnitinBot|TrendictionBot|GrapeshotCrawler|VelenPublicWebCrawler|FriendlyCrawler|ICC-Crawler|img2dataset|AI2Bot|cohere-(ai|training-data-crawler)|DeepSeekBot|FirecrawlAgent)\b/i;

export function proxy(req: NextRequest) {
  // Slugs are ASCII-only (lib/ascii-slug.ts): Next derives a cache tag from
  // the decoded path and Vercel emits it as a response header, so a slug with
  // ń/ł/Cyrillic 500s before the page even renders. The 31 WikiArt-era slugs
  // that had raw diacritics were re-slugged; fold any old link to the new form
  // here at the edge instead of paying for a render that can't succeed.
  if (req.nextUrl.pathname.startsWith("/artwork/")) {
    const slug = decodeURIComponent(req.nextUrl.pathname.slice("/artwork/".length));
    const folded = toAsciiSlug(slug);
    if (folded && folded !== slug) {
      return NextResponse.redirect(new URL(`/artwork/${folded}`, req.url), 308);
    }
    return NextResponse.next();
  }

  const ua = req.headers.get("user-agent") ?? "";
  if (!ua || BLOCKED_UAS.test(ua)) {
    return new NextResponse("Bot traffic not permitted on dynamic endpoints", {
      status: 429,
      headers: {
        "Retry-After": "86400",
        "Cache-Control": "private, no-store",
      },
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/search/:path*",
    // Only artwork paths containing a percent-encoded non-ASCII byte (%C2–%F4
    // lead bytes), so the ~1M ASCII artwork URLs never invoke the proxy.
    "/artwork/:slug((?:.*%[C-Fc-f][0-9A-Fa-f].*))",
  ],
};
