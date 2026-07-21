import { convert } from "html-to-text";

// Plain text for meta descriptions from synced HTML. ignoreHref stops
// html-to-text from appending raw URLs ("text [https://…]") into descriptions.
export function htmlToPlain(html: string): string {
  return convert(html, {
    wordwrap: false,
    selectors: [{ selector: "a", options: { ignoreHref: true } }],
  });
}

// Meta descriptions get cut at ~160 chars — do it at a word boundary with an
// ellipsis instead of mid-word.
export function truncateAtWord(text: string, max = 160): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 60 ? lastSpace : max).trimEnd()}…`;
}
