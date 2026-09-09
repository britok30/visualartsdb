// Slugs must be pure ASCII. Next.js derives an implicit cache tag from the
// decoded request path and Vercel emits it as the `x-next-cache-tags`
// response header; any character above U+00FF (ń, ł, ś, Cyrillic, …) makes
// Node reject the header (ERR_INVALID_CHAR) and the page 500s. A few dozen
// WikiArt-era slugs carried raw diacritics — this folds them the way the
// scraper's slugify should have.

const CYRILLIC: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh",
  щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya", і: "i", ї: "yi",
  є: "ye", ґ: "g",
};

// Letters NFD does not decompose into base + combining mark.
const SPECIAL: Record<string, string> = {
  ł: "l", ø: "o", đ: "d", ß: "ss", æ: "ae", œ: "oe", þ: "th", ð: "d", ı: "i",
};

export function toAsciiSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x00-\x7f]/g, (ch) => CYRILLIC[ch] ?? SPECIAL[ch] ?? "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isAsciiSlug(slug: string): boolean {
  return /^[\x20-\x7e]*$/.test(slug);
}
