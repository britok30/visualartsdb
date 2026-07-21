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

// useSyncExternalStore compares snapshots with Object.is, so getFavorites must
// return a STABLE reference between writes — re-parsing localStorage on every
// call returns a fresh array each time and throws React into an infinite
// render loop. Cache the parsed array and invalidate only on writes (and on
// cross-tab `storage` events via subscribeFavorites).
const EMPTY: FavoriteItem[] = [];
let cache: FavoriteItem[] | null = null;

function readStorage(): FavoriteItem[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function getFavorites(): FavoriteItem[] {
  if (cache === null) cache = readStorage();
  return cache;
}

function write(favorites: FavoriteItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  cache = favorites;
  window.dispatchEvent(new Event("favorites-changed"));
}

export function subscribeFavorites(callback: () => void): () => void {
  const invalidate = () => {
    cache = null;
    callback();
  };
  window.addEventListener("favorites-changed", callback);
  // `storage` fires for writes from OTHER tabs — the cache is stale then.
  window.addEventListener("storage", invalidate);
  return () => {
    window.removeEventListener("favorites-changed", callback);
    window.removeEventListener("storage", invalidate);
  };
}

export function addFavorite(item: Omit<FavoriteItem, "addedAt">) {
  const favorites = getFavorites();
  if (favorites.some((f) => f.id === item.id)) return;
  write([{ ...item, addedAt: Date.now() }, ...favorites]);
}

export function removeFavorite(id: string) {
  write(getFavorites().filter((f) => f.id !== id));
}

export function isFavorite(id: string): boolean {
  return getFavorites().some((f) => f.id === id);
}
