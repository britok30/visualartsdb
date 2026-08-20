import { NextRequest } from "next/server";
import {
  AIC_ALLOWED_SIZES,
  AIC_COURTESY_HEADER,
  aicUpstreamUrl,
} from "@/lib/artwork-image-url";

// Pass-through proxy for AIC IIIF images. Their Cloudflare blocks cross-site
// <img> embeds, but requests carrying the documented AIC-User-Agent courtesy
// header pass — a header browsers can't send on image loads, so we add it
// here. Strict validation keeps this from becoming an open proxy, and the
// immutable cache headers mean our CDN (and the Cloudflare zone in front)
// serve repeats without invoking this function.

const IMAGE_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const CACHE_OK = {
  "Cache-Control": "public, max-age=31536000, immutable",
  "CDN-Cache-Control": "public, s-maxage=31536000, immutable",
} as const;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ imageId: string; file: string }> },
) {
  const { imageId, file } = await params;
  const size = file.endsWith(".jpg") ? file.slice(0, -4) : "";
  if (!IMAGE_ID_RE.test(imageId) || !AIC_ALLOWED_SIZES.has(size)) {
    return new Response("Not found", {
      status: 404,
      headers: { "Cache-Control": "no-store", "CDN-Cache-Control": "no-store" },
    });
  }

  let upstream: Response;
  try {
    upstream = await fetch(aicUpstreamUrl(imageId, size), {
      headers: { "AIC-User-Agent": AIC_COURTESY_HEADER },
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    return new Response("Upstream unavailable", {
      status: 502,
      headers: { "Cache-Control": "no-store", "CDN-Cache-Control": "no-store" },
    });
  }

  if (!upstream.ok || !upstream.body) {
    return new Response("Upstream error", {
      // 404 for gone images (AIC unpublishes them), 502 otherwise
      status: upstream.status === 403 || upstream.status === 404 ? 404 : 502,
      headers: { "Cache-Control": "no-store", "CDN-Cache-Control": "no-store" },
    });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
      ...CACHE_OK,
    },
  });
}
