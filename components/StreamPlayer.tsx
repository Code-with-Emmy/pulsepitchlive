"use client";

import { useState } from "react";
import { triggerAdsterraSmartLink } from "@/lib/adsterra-smart-link";

interface StreamPlayerProps {
  src: string;
  onLoad?: () => void;
  onError?: () => void;
}

const POPUNDER_TRIGGER_EVENT = "adsterra:popunder-trigger";

function withAutoplay(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.toLowerCase();
    const safeHosts = ["youtube.com", "www.youtube.com", "youtu.be", "player.vimeo.com"];
    const hasProtectedParams =
      url.searchParams.has("token") ||
      url.searchParams.has("signature") ||
      url.searchParams.has("sig") ||
      url.searchParams.has("expires") ||
      url.searchParams.has("api_key");

    const isSafeHost = safeHosts.some((value) => host === value || host.endsWith(`.${value}`));
    if (!isSafeHost || hasProtectedParams) {
      return rawUrl;
    }

    if (!url.searchParams.has("autoplay")) {
      url.searchParams.set("autoplay", "1");
    }
    if (!url.searchParams.has("muted")) {
      url.searchParams.set("muted", "1");
    }
    if (!url.searchParams.has("mute")) {
      url.searchParams.set("mute", "1");
    }
    if (!url.searchParams.has("autostart")) {
      url.searchParams.set("autostart", "true");
    }
    if (!url.searchParams.has("playsinline")) {
      url.searchParams.set("playsinline", "1");
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
}

export default function StreamPlayer({ src, onLoad, onError }: StreamPlayerProps) {
  const autoplaySrc = withAutoplay(src);
  const [playerOverlayArmed, setPlayerOverlayArmed] = useState(true);

  function handlePlayerOverlayClick() {
    triggerAdsterraSmartLink("adsterra_smart_link_player_last_opened_at");
    window.dispatchEvent(
      new CustomEvent(POPUNDER_TRIGGER_EVENT, {
        detail: { source: "stream-player-overlay" },
      }),
    );
    setPlayerOverlayArmed(false);
  }

  return (
    <div className="ls-player-shell">
      <div className="relative aspect-video min-h-[220px] w-full rounded-[22px] bg-black sm:min-h-0">
        <iframe
          key={autoplaySrc}
          src={autoplaySrc}
          title="Live stream player"
          className="absolute inset-0 h-full w-full rounded-[22px]"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write"
          allowFullScreen
          onLoad={onLoad}
          onError={onError}
        />
        {playerOverlayArmed && (
          <button
            type="button"
            onClick={handlePlayerOverlayClick}
            className="absolute inset-0 z-[5] flex items-center justify-center bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.34))] sm:items-end"
            aria-label="Open stream"
            style={{ touchAction: "manipulation" }}
          >
            <span className="rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/88 shadow-[0_12px_24px_rgba(0,0,0,0.25)] backdrop-blur sm:mb-5 sm:px-4 sm:py-2 sm:text-xs">
              Tap to continue
            </span>
          </button>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] flex items-center justify-between bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.68))] px-3 pb-3 pt-10 text-white/72">
          <span className="mono-label text-[10px] uppercase tracking-[0.18em] sm:text-[11px]">
            Live Stream
          </span>
          <span className="rounded-full border border-white/12 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/85">
            Mobile Ready
          </span>
        </div>
      </div>
    </div>
  );
}
