// Hotlink repairs for museum image servers (2026-08). Stored URLs stay
// canonical in the DB; the fixes happen at render time so syncs and both
// databases are untouched.
//
// - AIC (www.artic.edu) fronts its IIIF endpoint with a Cloudflare challenge
//   that blocks cross-site <img> embeds and non-browser clients, but requests
//   carrying the documented courtesy `AIC-User-Agent` header pass. Browsers
//   can't attach custom headers to image loads, so AIC images route through
//   our /img/aic proxy which adds it.
// - Getty (media.getty.edu) is IIIF v3, which rejects plain `843,` whenever
//   the source is narrower than 843px (no implicit upscaling). `^!n,n`
//   (fit-in-box, upscale allowed) succeeds for every size; `^` must be
//   percent-encoded in URLs.

const AIC_IIIF_RE =
  /^https:\/\/www\.artic\.edu\/iiif\/2\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/full\/(\d{2,4}),\/0\/default\.jpg$/;

const GETTY_IIIF_RE =
  /^(https:\/\/media\.getty\.edu\/iiif\/image\/[0-9a-f-]+\/full\/)(\d{2,4}),(\/0\/default\.jpg)$/;

/** Sizes AIC documents as cache-friendly; the proxy rejects anything else. */
export const AIC_ALLOWED_SIZES = new Set(["200", "400", "600", "843", "1686"]);

/** Browser-facing URL: AIC goes through our proxy, Getty gets v3-safe sizing. */
export function resolveArtworkImageUrl(url: string): string {
  const aic = url.match(AIC_IIIF_RE);
  if (aic && AIC_ALLOWED_SIZES.has(aic[2])) {
    return `/img/aic/${aic[1]}/${aic[2]}.jpg`;
  }
  return rewriteGettySize(url);
}

/** Getty-only rewrite, shared by the browser path and server-side fetches. */
export function rewriteGettySize(url: string): string {
  const getty = url.match(GETTY_IIIF_RE);
  if (getty) return `${getty[1]}%5E!${getty[2]},${getty[2]}${getty[3]}`;
  return url;
}

export function aicUpstreamUrl(imageId: string, size: string): string {
  return `https://www.artic.edu/iiif/2/${imageId}/full/${size},/0/default.jpg`;
}

export const AIC_COURTESY_HEADER = "VisualArtsDB (visualartsdb.com)";

export function isAicUrl(url: string): boolean {
  return AIC_IIIF_RE.test(url);
}
