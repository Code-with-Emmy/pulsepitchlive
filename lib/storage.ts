const FAVORITES_KEY = "livefooty:favorites";
const FAVORITES_ONLY_KEY = "livefooty:favorites-only";
const PINNED_LEAGUES_KEY = "livefooty:pinned-leagues";
const PINNED_ONLY_KEY = "livefooty:pinned-only";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readFavoriteIds(): string[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export function writeFavoriteIds(ids: string[]): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

export function readFavoritesOnly(): boolean {
  if (!canUseStorage()) {
    return false;
  }

  return window.localStorage.getItem(FAVORITES_ONLY_KEY) === "1";
}

export function writeFavoritesOnly(value: boolean): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(FAVORITES_ONLY_KEY, value ? "1" : "0");
}

export function readPinnedLeagues(): string[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(PINNED_LEAGUES_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  } catch {
    return [];
  }
}

export function writePinnedLeagues(leagues: string[]): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(PINNED_LEAGUES_KEY, JSON.stringify(leagues));
}

export function readPinnedOnly(): boolean {
  if (!canUseStorage()) {
    return false;
  }

  return window.localStorage.getItem(PINNED_ONLY_KEY) === "1";
}

export function writePinnedOnly(value: boolean): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(PINNED_ONLY_KEY, value ? "1" : "0");
}
