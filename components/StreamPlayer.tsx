"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

interface StreamPlayerProps {
  src: string;
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

export default function StreamPlayer({ src, onLoad, onError }: StreamPlayerProps) {
  const autoplaySrc = withAutoplay(src);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check if the URL is a direct stream (m3u8) or an iframe embed
  const isM3U8 = autoplaySrc.includes(".m3u8");

  useEffect(() => {
    if (!isM3U8 || !videoRef.current) return;

    let hls: Hls | null = null;
    const video = videoRef.current;

    if (Hls.isSupported()) {
      hls = new Hls({
        maxMaxBufferLength: 30,
      });
      hls.loadSource(autoplaySrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {
          // Ignore autoplay errors
        });
        if (onLoad) onLoad();
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          if (onError) onError();
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // For Safari where HLS is natively supported
      video.src = autoplaySrc;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch(() => {});
        if (onLoad) onLoad();
      });
      video.addEventListener("error", () => {
        if (onError) onError();
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [autoplaySrc, isM3U8, onLoad, onError]);

  return (
    <div className="ls-player-shell relative overflow-hidden rounded-none bg-black shadow-2xl">
      <div className="relative aspect-video min-h-[220px] w-full sm:min-h-0">
        {isM3U8 ? (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full"
            controls
            playsInline
            autoPlay
            muted
          />
        ) : (
          <iframe
            key={autoplaySrc}
            src={autoplaySrc}
            title="Live stream player"
            className="absolute inset-0 h-full w-full"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write"
            // sandbox="allow-scripts allow-same-origin allow-presentation"
            onLoad={onLoad}
            onError={onError}
          />
        )}
      </div>
    </div>
  );
}
