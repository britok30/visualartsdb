export function parsePage(raw: string): number | null {
  if (!/^[1-9]\d{0,8}$/.test(raw)) return null;
  const page = Number(raw);
  return Number.isSafeInteger(page) ? page : null;
}

export function isValidPage(page: number, limit: number): boolean {
  return Number.isSafeInteger(page) && page >= 1 && page <= 999999999 &&
    Number.isSafeInteger(limit) && limit >= 1 && limit <= 100;
}
