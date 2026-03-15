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
      <span className="ls-control inline-flex h-9 items-center gap-2 border-white/12 bg-white/5 px-3 text-sm font-black uppercase tracking-[0.14em] text-white">
        <span className="ls-blink inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        Alerts
      </span>
    );
  }

  if (permission === "denied") {
    return (
      <span className="ls-control inline-flex h-9 items-center border-amber-500/25 bg-amber-500/10 px-3 text-sm font-black uppercase tracking-[0.14em] text-amber-300">
        Alerts Off
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onRequest}
      className="ls-control ls-control-muted inline-flex h-9 items-center px-3 text-sm font-black uppercase tracking-[0.14em]"
    >
      Enable Alerts
    </button>
  );
}
