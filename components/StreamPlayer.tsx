"use client";

import { useEffect, useRef, useState } from "react";




interface StreamPlayerProps {
  src: string;
  autoFullscreen?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

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

export default function StreamPlayer({ src, autoFullscreen, onLoad, onError }: StreamPlayerProps) {
  const autoplaySrc = withAutoplay(src);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasAutoAttempted, setHasAutoAttempted] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    // Only attempt auto-fullscreen on larger screens (desktop)
    // Mobile browsers are extremely strict about requestFullscreen and usually block it.
    const isMobile = window.innerWidth < 640;
    
    if (isReady && autoFullscreen && !isMobile && !hasAutoAttempted && !document.fullscreenElement) {
      setHasAutoAttempted(true);
      if (containerRef.current) {
        // requestFullscreen requires a user gesture. 
        // This will often fail on page load, which is why we catch it and show the fallback overlay.
        containerRef.current.requestFullscreen().catch(() => {
          // No need to spam the console, we already handle this by showing the overlay
        });
      }
    }
  }, [isReady, autoFullscreen, hasAutoAttempted]);

  const handleLoad = () => {
    setIsReady(true);
    if (onLoad) onLoad();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="ls-player-shell group relative" ref={containerRef}>
      <div className="relative aspect-video min-h-[220px] w-full rounded-[22px] bg-black sm:min-h-0">
        <iframe
          key={autoplaySrc}
          src={autoplaySrc}
          title="Live stream player"
          className="absolute inset-0 h-full w-full rounded-[22px]"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write"
          onLoad={handleLoad}
          onError={onError}
        />

        {!isFullscreen && isReady && (
          <div className="pointer-events-none absolute inset-0 z-15 hidden items-center justify-center transition-opacity duration-500 sm:flex sm:opacity-0 group-hover:opacity-100">
            <button
              onClick={toggleFullscreen}
              className="pointer-events-auto flex items-center gap-3 rounded-full bg-(--ls-accent) px-6 py-3 text-sm font-black uppercase tracking-widest text-black shadow-[0_0_30px_rgba(244,255,67,0.4)] transition-all hover:scale-110 active:scale-95 sm:px-8 sm:py-4 sm:text-base"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
              Watch in Fullscreen
            </button>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center justify-between bg-linear-to-t from-black/90 via-black/40 to-transparent px-5 pb-5 pt-14 opacity-100 transition-opacity duration-300 sm:opacity-0 group-hover:opacity-100">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="ls-blink h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.7)]" />
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white">
                Live Broadcast
              </span>
            </div>

            <button
              onClick={toggleFullscreen}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-xl transition-all hover:bg-white/25 active:scale-90"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
