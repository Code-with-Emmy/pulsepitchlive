"use client";

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

  return (
    <div className="ls-player-shell relative overflow-hidden rounded-[22px] bg-black shadow-2xl">
      <div className="relative aspect-video min-h-[220px] w-full sm:min-h-0">
        <iframe
          key={autoplaySrc}
          src={autoplaySrc}
          title="Live stream player"
          className="absolute inset-0 h-full w-full"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write"
          onLoad={onLoad}
          onError={onError}
        />
      </div>
    </div>
  );
}
