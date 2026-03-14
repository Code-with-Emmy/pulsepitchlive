"use client";

const SMART_LINK_URL = process.env.NEXT_PUBLIC_ADSTERRA_SMART_LINK_URL?.trim();
const SMART_LINK_COOLDOWN_MS = Number.parseInt(
  process.env.NEXT_PUBLIC_ADSTERRA_SMART_LINK_COOLDOWN_MS ?? "300000",
  10,
);

function canOpenWithCooldown(storageKey: string, cooldownMs: number): boolean {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return true;
    }

    const lastOpenedAt = Number.parseInt(raw, 10);
    if (!Number.isFinite(lastOpenedAt)) {
      return true;
    }

    return Date.now() - lastOpenedAt >= cooldownMs;
  } catch {
    return true;
  }
}

function markOpened(storageKey: string): void {
  try {
    window.localStorage.setItem(storageKey, String(Date.now()));
  } catch {}
}

export function triggerAdsterraSmartLink(
  storageKey = "adsterra_smart_link_last_opened_at",
): boolean {
  if (typeof window === "undefined" || !SMART_LINK_URL) {
    return false;
  }

  const cooldownMs = Number.isFinite(SMART_LINK_COOLDOWN_MS)
    ? SMART_LINK_COOLDOWN_MS
    : 300000;

  if (!canOpenWithCooldown(storageKey, cooldownMs)) {
    return false;
  }

  const openedWindow = window.open(
    SMART_LINK_URL,
    "_blank",
    "noopener,noreferrer",
  );

  if (!openedWindow) {
    return false;
  }

  try {
    openedWindow.opener = null;
  } catch {}

  markOpened(storageKey);
  return true;
}
