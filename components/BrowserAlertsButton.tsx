"use client";

type BrowserAlertsPermission = NotificationPermission | "unsupported";

interface BrowserAlertsButtonProps {
  permission: BrowserAlertsPermission;
  onRequest: () => void;
}

export default function BrowserAlertsButton({
  permission,
  onRequest,
}: BrowserAlertsButtonProps) {
  if (permission === "unsupported") {
    return null;
  }

  if (permission === "granted") {
    return (
      <span className="inline-flex h-9 items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 text-sm font-semibold text-emerald-300">
        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        Alerts On
      </span>
    );
  }

  if (permission === "denied") {
    return (
      <span className="inline-flex h-9 items-center rounded-full border border-amber-500/25 bg-amber-500/10 px-3 text-sm font-semibold text-amber-300">
        Alerts Blocked
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onRequest}
      className="inline-flex h-9 items-center rounded-full border border-(--ls-border) bg-(--ls-panel-alt) px-3 text-sm font-semibold text-(--ls-text) transition hover:border-emerald-400"
    >
      Enable Alerts
    </button>
  );
}
