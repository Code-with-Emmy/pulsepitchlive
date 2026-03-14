"use client";

import { useState } from "react";

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
    window.dispatchEvent(
      new CustomEvent(POPUNDER_TRIGGER_EVENT, {
        detail: { source: "stream-player-overlay" },
      }),
    );
    setPlayerOverlayArmed(false);
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-700 bg-[#050a14]">
      <div className="relative aspect-video min-h-[220px] w-full bg-black sm:min-h-0">
        <iframe
          key={autoplaySrc}
          src={autoplaySrc}
          title="Live stream player"
          className="absolute inset-0 h-full w-full"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write"
          allowFullScreen
          onLoad={onLoad}
          onError={onError}
        />
        {playerOverlayArmed && (
          <button
            type="button"
            onClick={handlePlayerOverlayClick}
            className="absolute inset-0 z-[5] flex items-center justify-center bg-[linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.24))] sm:items-end"
            aria-label="Open stream"
            style={{ touchAction: "manipulation" }}
          >
            <span className="rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/85 backdrop-blur sm:mb-4 sm:px-3 sm:py-1.5 sm:text-xs">
              Tap to continue
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
