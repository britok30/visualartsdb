export type FavoriteType = "artwork" | "artist";

export interface FavoriteItem {
  id: string;
  type: FavoriteType;
  slug: string;
  title: string;
  imageUrl: string | null;
  subtitle?: string | null;
  addedAt: number;
}

const STORAGE_KEY = "vadb-favorites";

export function getFavorites(): FavoriteItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addFavorite(item: Omit<FavoriteItem, "addedAt">) {
  const favorites = getFavorites();
  if (favorites.some((f) => f.id === item.id)) return;
  favorites.unshift({ ...item, addedAt: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  window.dispatchEvent(new Event("favorites-changed"));
}

export function removeFavorite(id: string) {
  const favorites = getFavorites().filter((f) => f.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  window.dispatchEvent(new Event("favorites-changed"));
}

export function isFavorite(id: string): boolean {
  return getFavorites().some((f) => f.id === id);
}
