// Bound user-controlled query work and cache-key size.
export const MAX_SEARCH_PAGE = 100;
export function normalizeSearchQuery(value: unknown): string {
  if (typeof value !== "string") return "";
  const query = value.trim().replace(/\s+/g, " ");
  return query.length >= 3 && query.length <= 120 ? query : "";
}
