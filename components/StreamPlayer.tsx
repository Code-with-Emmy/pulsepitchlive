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

        {/* <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] flex items-center justify-between bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.68))] px-3 pb-3 pt-10 text-white/72"></div> */}
      </div>
    </div>
  );
}
