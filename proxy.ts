import { NextResponse, type NextRequest } from "next/server";

// Bots blocked from compute-expensive routes regardless of robots.txt compliance.
// Includes Bytespider and other crawlers known to ignore robots.txt.
// Carefully omits Googlebot/Bingbot/DuckDuckBot/Claude-User/PerplexityBot etc.
// that drive referral traffic.
const BLOCKED_UAS =
  /\b(GPTBot|ChatGPT-User|ClaudeBot|Claude-Web|anthropic-ai|CCBot|Bytespider|TikTokSpider|Google-Extended|Applebot-Extended|Meta-External(Agent|Fetcher)|FacebookBot|Amazonbot|Diffbot|Omgilibot|Omgili|Webzio-Extended|ImagesiftBot|Timpibot|PetalBot|SemrushBot|AhrefsBot|DotBot|MJ12bot|DataForSeoBot|BLEXBot|SeekportBot|TurnitinBot|TrendictionBot|GrapeshotCrawler|VelenPublicWebCrawler|FriendlyCrawler|ICC-Crawler|img2dataset|AI2Bot|cohere-(ai|training-data-crawler)|DeepSeekBot|FirecrawlAgent)\b/i;

export function proxy(req: NextRequest) {
  const ua = req.headers.get("user-agent") ?? "";
  if (!ua || BLOCKED_UAS.test(ua)) {
    return new NextResponse("Bot traffic not permitted on dynamic endpoints", {
      status: 429,
      headers: {
        "Retry-After": "86400",
        "Cache-Control": "public, s-maxage=86400",
      },
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/search/:path*"],
};
