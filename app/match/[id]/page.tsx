"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import AdsterraNativeSlot from "@/components/AdsterraNativeSlot";
import AdsterraSlot from "@/components/AdsterraSlot";
import BrowserAlertsButton from "@/components/BrowserAlertsButton";

import SafeImage from "@/components/SafeImage";
import StreamPlayer from "@/components/StreamPlayer";
import StreamSourceSelect from "@/components/StreamSourceSelect";
import ThemeToggle from "@/components/ThemeToggle";
import { ApiClientError } from "@/lib/api-client";
import { formatKickoff, toDateInputValue, todayInputDate } from "@/lib/date";
import { useBrowserAlerts } from "@/hooks/useBrowserAlerts";
import { useMatches } from "@/hooks/useMatches";
import { useMatchNotifications } from "@/hooks/useMatchNotifications";
import { useMatchDetail } from "@/hooks/useMatchDetail";
import type { StreamSource } from "@/lib/types";

const ADSTERRA_HOST =
  process.env.NEXT_PUBLIC_ADSTERRA_HOST || "www.highperformanceformat.com";
const ADSTERRA_DEFAULT_NATIVE_SLOT =
  process.env.NEXT_PUBLIC_ADSTERRA_SLOT_300X250;
const ADSTERRA_NOTIFICATION_SLOT =
  process.env.NEXT_PUBLIC_ADSTERRA_NOTIFICATION_SLOT ||
  ADSTERRA_DEFAULT_NATIVE_SLOT;
const ADSTERRA_TOP_SLOT =
  process.env.NEXT_PUBLIC_ADSTERRA_TOP_SLOT || ADSTERRA_DEFAULT_NATIVE_SLOT;
const ADSTERRA_NATIVE_CODE = process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_CODE;
const MATCH_DETAIL_RELATED_LIMIT = 20;

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
      <path d="M10 17a2 2 0 0 0 4 0" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M15 18 9 12l6-6" />
    </svg>
  );
}

function streamScore(stream: StreamSource): number {
  let score = 0;
  const url = stream.url.toLowerCase();
  const source = (stream.source ?? "").toLowerCase();
  const language = (stream.language ?? "").toLowerCase();
  const label = stream.label.toLowerCase();

  if (stream.hd) score += 20;
  if (language.includes("english")) score += 12;
  if (url.includes("embed.streamapi.cc")) score += 8;
  if (source === "admin") score -= 6;
  if (source === "rapid") score -= 5;
  if (url.includes("football77.org")) score -= 8;
  if (url.includes("ad") || label.includes("ad")) score -= 4;

  return score;
}

export default function MatchDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? null;
  const { detail, isLoading, error, mutate } = useMatchDetail(id);
  const { permission: alertsPermission, requestPermission } = useBrowserAlerts();
  const [selectedStreamUrl, setSelectedStreamUrl] = useState("");
  const [lastLoadedUrl, setLastLoadedUrl] = useState("");
  const [failedStreamUrls, setFailedStreamUrls] = useState<string[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const streams = useMemo(() => detail?.streams ?? [], [detail]);
  const rankedStreams = useMemo(
    () => [...streams].sort((a, b) => streamScore(b) - streamScore(a)),
    [streams],
  );

  const activeStreamUrl = useMemo(() => {
    if (!selectedStreamUrl) {
      return rankedStreams[0]?.url ?? "";
    }

    return rankedStreams.some((stream) => stream.url === selectedStreamUrl)
      ? selectedStreamUrl
      : (rankedStreams[0]?.url ?? "");
  }, [selectedStreamUrl, rankedStreams]);

  const activeStreamIndex = useMemo(
    () => rankedStreams.findIndex((stream) => stream.url === activeStreamUrl),
    [rankedStreams, activeStreamUrl],
  );
  const moveToNextSource = useCallback(
    (markCurrentFailed: boolean) => {
      if (rankedStreams.length < 2) {
        return;
      }

      const failedSet = new Set(failedStreamUrls);
      if (markCurrentFailed && activeStreamUrl) {
        failedSet.add(activeStreamUrl);
      }

      const startIndex = activeStreamIndex >= 0 ? activeStreamIndex : 0;
      let next: StreamSource | undefined;

      for (let i = 1; i <= rankedStreams.length; i += 1) {
        const candidate =
          rankedStreams[(startIndex + i) % rankedStreams.length];
        if (!failedSet.has(candidate.url)) {
          next = candidate;
          break;
        }
      }

      if (!next) {
        failedSet.clear();
        next = rankedStreams[(startIndex + 1) % rankedStreams.length];
      }

      setFailedStreamUrls(Array.from(failedSet));
      if (next) {
        setSelectedStreamUrl(next.url);
      }
    },
    [rankedStreams, failedStreamUrls, activeStreamUrl, activeStreamIndex],
  );

  useEffect(() => {
    if (rankedStreams.length < 2 || !activeStreamUrl) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (lastLoadedUrl !== activeStreamUrl) {
        moveToNextSource(true);
      }
    }, 10000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [rankedStreams.length, activeStreamUrl, lastLoadedUrl, moveToNextSource]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-header-popover='true']")) {
        return;
      }
      setSearchOpen(false);
      setNotificationsOpen(false);
    }

    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const errorStatus = error instanceof ApiClientError ? error.status : null;
  const is404 = errorStatus === 404;
  const is503 = errorStatus === 503;

  const relatedDate = (() => {
    if (!detail?.startTime) {
      return todayInputDate();
    }

    const asDate = new Date(detail.startTime);
    if (!Number.isNaN(asDate.getTime())) {
      return toDateInputValue(asDate);
    }

    return detail.startTime.slice(0, 10) || todayInputDate();
  })();

  const relatedSport = detail?.sport || "football";
  const relatedBase = detail
    ? { sport: relatedSport, date: relatedDate }
    : null;
  const { matches: liveMatches, isLoading: liveLoading } = useMatches(
    relatedBase ? { ...relatedBase, status: "inprogress" } : null,
  );
  const { matches: upcomingMatches, isLoading: upcomingLoading } = useMatches(
    relatedBase ? { ...relatedBase, status: "notstarted" } : null,
  );

  const otherLiveMatches = useMemo(
    () =>
      liveMatches
        .filter((match) => match.id !== detail?.id)
        .slice(0, MATCH_DETAIL_RELATED_LIMIT),
    [liveMatches, detail?.id],
  );
  const incomingMatches = useMemo(
    () =>
      upcomingMatches
        .filter((match) => match.id !== detail?.id)
        .slice(0, MATCH_DETAIL_RELATED_LIMIT),
    [upcomingMatches, detail?.id],
  );

  const currentMatchAlert = useMemo(() => {
    if (!detail) {
      return [];
    }

    return [
      {
        id: detail.id,
        awayScore: detail.awayScore,
        awayTeam: detail.awayTeam,
        homeScore: detail.homeScore,
        homeTeam: detail.homeTeam,
        href: `/match/${encodeURIComponent(detail.id)}`,
        league: detail.league,
        status: detail.status,
      },
    ];
  }, [detail]);

  useMatchNotifications({
    permission: alertsPermission,
    matches: currentMatchAlert,
  });
  const searchPool = useMemo(() => {
    const byId = new Map<string, (typeof liveMatches)[number]>();
    if (detail) {
      byId.set(detail.id, detail);
    }
    [...liveMatches, ...upcomingMatches].forEach((match) => {
      byId.set(match.id, match);
    });
    return Array.from(byId.values());
  }, [detail, liveMatches, upcomingMatches]);
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return searchPool.slice(0, 7);
    }

    return searchPool
      .filter((match) => {
        const league = (match.league ?? "").toLowerCase();
        return (
          match.homeTeam.toLowerCase().includes(query) ||
          match.awayTeam.toLowerCase().includes(query) ||
          league.includes(query)
        );
      })
      .slice(0, 10);
  }, [searchPool, searchQuery]);
  const notifications = useMemo(() => {
    const cards: Array<{
      id: string;
      title: string;
      detail: string;
      href: string;
      homeBadge?: string;
      awayBadge?: string;
    }> = [];

    liveMatches.slice(0, 4).forEach((match) => {
      cards.push({
        id: `live-${match.id}`,
        title: `${match.homeTeam} vs ${match.awayTeam} is live`,
        detail: `${match.homeScore}-${match.awayScore} • ${match.statusDetail ?? "In progress"}`,
        href: `/match/${encodeURIComponent(match.id)}`,
        homeBadge: match.homeBadge,
        awayBadge: match.awayBadge,
      });
    });

    upcomingMatches.slice(0, 3).forEach((match) => {
      cards.push({
        id: `upcoming-${match.id}`,
        title: `${match.homeTeam} vs ${match.awayTeam} kicks off soon`,
        detail: `${formatKickoff(match.startTime)} • ${match.league ?? "League"}`,
        href: `/match/${encodeURIComponent(match.id)}`,
        homeBadge: match.homeBadge,
        awayBadge: match.awayBadge,
      });
    });

    return cards.slice(0, 9);
  }, [liveMatches, upcomingMatches]);
  const detailMetaCards = useMemo(() => {
    if (!detail) {
      return [];
    }

    return [
      {
        label: "Kickoff",
        value: formatKickoff(detail.startTime),
      },
      {
        label: "Venue",
        value: detail.meta.stadium ?? "Venue pending",
      },
      {
        label: "Referee",
        value: detail.meta.referee ?? "TBA",
      },
      {
        label: "Streams",
        value: `${streams.length} sources`,
      },
    ];
  }, [detail, streams.length]);

  return (
    <main className="ls-shell min-h-screen bg-(--ls-bg) text-(--ls-text)">
      <header className="sticky top-0 z-9999 border-b border-slate-800 bg-(--ls-header) backdrop-blur-md">
        <div className="mx-auto flex h-[74px] w-full max-w-[1500px] items-center justify-between px-3 md:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-(--ls-border) bg-(--ls-panel-alt) text-(--ls-muted)">
                <BackIcon />
              </span>
              <img
                src="/logo.png"
                alt="PulsePitch Live"
                className="h-12 w-auto object-contain md:h-14"
              />
              <div className="hidden md:block">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-(--ls-text)">
                  PulsePitch Live
                </p>
                <p className="text-xs font-semibold text-(--ls-muted)">
                  Matchday view with stream, stats, and live context
                </p>
              </div>
              <span className="sr-only">Back to matches</span>
            </Link>
          </div>

          <div
            className="relative flex items-center gap-2"
            data-header-popover="true"
          >
            <button
              type="button"
              onClick={() => {
                setSearchOpen((prev) => !prev);
                setNotificationsOpen(false);
              }}
              className="ls-control ls-control-muted inline-flex h-9 w-9 items-center justify-center text-base text-var(--ls-muted)"
              aria-label="Search matches"
            >
              <SearchIcon />
            </button>
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen((prev) => !prev);
                setSearchOpen(false);
              }}
              className="ls-control ls-control-muted relative inline-flex h-9 w-9 items-center justify-center text-base text-(--ls-muted)"
              aria-label="Open notifications"
            >
              <BellIcon />
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            </button>
            <BrowserAlertsButton
              permission={alertsPermission}
              onRequest={() => {
                void requestPermission();
              }}
            />
            <ThemeToggle />
            <button
              type="button"
              onClick={() => {
                void mutate();
              }}
              className="ls-control ls-control-muted h-9 px-4 text-sm font-semibold"
            >
              Refresh
            </button>

            {searchOpen && (
              <div className="ls-floating-panel absolute right-0 top-12 z-100000 w-[min(92vw,420px)] overflow-hidden rounded-2xl">
                <div className="border-b border-(--ls-border) p-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search team or league..."
                    className="h-10 w-full rounded-lg border border-(--ls-border) bg-(--ls-panel-alt) px-3 text-sm text-(--ls-text) outline-none ring-emerald-400 transition focus:ring-2"
                  />
                </div>
                <div className="max-h-[340px] overflow-y-auto p-2">
                  {searchResults.length === 0 && (
                    <p className="px-2 py-6 text-center text-sm text-(--ls-muted)">
                      No results found.
                    </p>
                  )}
                  {searchResults.map((match) => (
                    <Link
                      key={`search-${match.id}`}
                      href={`/match/${encodeURIComponent(match.id)}`}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center justify-between rounded-lg px-2 py-2 text-sm transition hover:bg-(--ls-panel-alt)"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="flex shrink-0 items-center -space-x-1">
                          <SafeImage
                            src={match.homeBadge}
                            alt=""
                            className="h-5 w-5 rounded-full border border-var(--ls-surface) object-contain bg-var(--ls-surface)"
                            fallbackClassName="inline-block h-5 w-5 rounded-full border border-(--ls-surface) bg-(--ls-panel-alt)"
                          />
                          <SafeImage
                            src={match.awayBadge}
                            alt=""
                            className="h-5 w-5 rounded-full border border-var(--ls-surface) object-contain bg-var(--ls-surface)"
                            fallbackClassName="inline-block h-5 w-5 rounded-full border border-(--ls-surface) bg-(--ls-panel-alt)"
                          />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-var(--ls-text)">
                            {match.homeTeam} vs {match.awayTeam}
                          </span>
                          <span className="block truncate text-xs text-var(--ls-muted)">
                            {match.league ?? "League"} •{" "}
                            {formatKickoff(match.startTime)}
                          </span>
                        </span>
                      </span>
                      <span className="ml-2 shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-300">
                        {match.status === "inprogress"
                          ? "Live"
                          : match.status === "notstarted"
                            ? "Upcoming"
                            : "Finished"}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {notificationsOpen && (
              <div className="ls-floating-panel absolute right-0 top-12 z-100000 w-[min(92vw,420px)] overflow-hidden rounded-2xl shadow-[0_28px_80px_rgba(0,0,0,0.52)]">
                <div className="flex items-center justify-between border-b border-(--ls-border) px-3 py-2.5">
                  <p className="text-sm font-semibold text-(--ls-text)">
                    Match Alerts
                  </p>
                  <span className="mono-label text-xs text-(--ls-muted)">
                    {notifications.length} updates
                  </span>
                </div>
                {alertsPermission !== "granted" && (
                  <div className="border-b border-(--ls-border) px-3 py-2 text-xs text-(--ls-muted)">
                    Enable browser alerts to get live updates for this match while this page is open.
                  </div>
                )}
                <div className="max-h-[340px] overflow-y-auto p-2">
                  {notifications.length === 0 && (
                    <p className="px-2 py-6 text-center text-sm text-(--ls-muted)">
                      No new notifications.
                    </p>
                  )}
                  {notifications.map((notification) => (
                    <Link
                      key={notification.id}
                      href={notification.href}
                      onClick={() => setNotificationsOpen(false)}
                      className="flex items-start gap-2 rounded-lg px-2 py-2 transition hover:bg-(--ls-panel-alt)"
                    >
                      <span className="mt-0.5 flex shrink-0 items-center -space-x-1">
                        <SafeImage
                          src={notification.homeBadge}
                          alt=""
                          className="h-5 w-5 rounded-full border border-(--ls-surface) object-contain bg-(--ls-surface)"
                          fallbackClassName="inline-block h-5 w-5 rounded-full border border-(--ls-surface) bg-(--ls-panel-alt)"
                        />
                        <SafeImage
                          src={notification.awayBadge}
                          alt=""
                          className="h-5 w-5 rounded-full border border-(--ls-surface) object-contain bg-(--ls-surface)"
                          fallbackClassName="inline-block h-5 w-5 rounded-full border border-(--ls-surface) bg-(--ls-panel-alt)"
                        />
                      </span>
                      <span className="min-w-0">
                        <p className="truncate text-sm font-semibold text-(--ls-text)">
                          {notification.title}
                        </p>
                        <p className="truncate text-xs text-(--ls-muted)">
                          {notification.detail}
                        </p>
                      </span>
                    </Link>
                  ))}
                  {ADSTERRA_NOTIFICATION_SLOT && (
                    <div className="mt-2 rounded-lg border border-slate-700 bg-[#0f182a] p-2">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                          Sponsored
                        </p>
                        <span className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
                          Ad
                        </span>
                      </div>
                      <div className="flex justify-center">
                        <AdsterraSlot
                          zoneKey={ADSTERRA_NOTIFICATION_SLOT}
                          host={ADSTERRA_HOST}
                          width={300}
                          height={250}
                          format="banner"
                          className="overflow-hidden rounded-md"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="relative z-0 mx-auto flex w-full max-w-[1500px] flex-col gap-3 px-2 py-3 md:px-4">
        {isLoading && (
          <div className="ls-card overflow-hidden p-4">
            <div className="h-14 animate-pulse rounded bg-slate-800" />
            <div className="mt-3 h-72 animate-pulse rounded bg-slate-800" />
          </div>
        )}

        {is404 && (
          <div className="rounded-xl border border-amber-700 bg-amber-950/25 p-6 text-amber-200">
            <h1 className="text-xl font-semibold">
              Match not available (may be finished/removed)
            </h1>
            <p className="mt-2 text-sm">
              The requested match can no longer be accessed.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex text-sm font-semibold underline underline-offset-4"
            >
              Back to live matches
            </Link>
          </div>
        )}

        {is503 && (
          <div className="rounded-xl border border-amber-700 bg-amber-950/25 px-4 py-3 text-sm text-amber-200">
            Data updating, retrying...
          </div>
        )}

        {error && !is404 && !is503 && (
          <div className="rounded-xl border border-rose-800 bg-rose-950/35 px-4 py-3 text-sm text-rose-200">
            Unable to load this match right now. Please refresh or try another
            match in a moment.
          </div>
        )}

        {detail && !is404 && (
          <section className="space-y-3">
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
              <article className="ls-hero-shell relative overflow-hidden rounded-xl border border-emerald-500/50 bg-[#060a14] p-1 text-white shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(42,255,123,0.25)_0px,transparent_6px)] opacity-35" />
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  {detail.homeBadge && (
                    <div className="absolute -left-14 top-1/2 -translate-y-1/2 opacity-[0.12] blur-[0.6px]">
                      <SafeImage
                        src={detail.homeBadge}
                        alt=""
                        className="h-52 w-52 object-contain md:h-68 md:w-68 xl:h-80 xl:w-80"
                        hideOnError
                      />
                    </div>
                  )}
                  {detail.awayBadge && (
                    <div className="absolute -right-14 top-1/2 -translate-y-1/2 opacity-[0.12] blur-[0.6px]">
                      <SafeImage
                        src={detail.awayBadge}
                        alt=""
                        className="h-52 w-52 object-contain md:h-68 md:w-68 xl:h-80 xl:w-80"
                        hideOnError
                      />
                    </div>
                  )}
                </div>
                <div className="ls-hero-frame relative overflow-hidden rounded-lg border border-emerald-500/40 p-4 md:p-6">
                  <div className="ls-hero-backdrop pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_50%,rgba(46,107,255,0.38),transparent_47%),radial-gradient(circle_at_84%_48%,rgba(240,124,35,0.30),transparent_46%),linear-gradient(102deg,rgba(17,30,74,0.9),rgba(12,18,30,0.97))]" />
                  <div className="relative">
                    <div className="flex items-center justify-between gap-2">
                      <p className="flex min-w-0 items-center gap-2 truncate text-sm font-semibold tracking-wide text-emerald-300">
                        {detail.leagueLogo && (
                          <SafeImage
                            src={detail.leagueLogo}
                            alt=""
                            className="h-5 w-5 rounded object-contain"
                            hideOnError
                          />
                        )}
                        {detail.leagueFlag && (
                          <SafeImage
                            src={detail.leagueFlag}
                            alt=""
                            className="h-4 w-4 rounded-full object-cover"
                            hideOnError
                          />
                        )}
                        <span className="truncate">
                          {detail.league ?? "League"}
                        </span>
                      </p>
                      <span className="rounded-full bg-rose-500 px-3 py-1 text-xs font-bold uppercase">
                        {detail.status === "inprogress" ? "Live" : detail.status}
                      </span>
                    </div>

                    <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-2 md:gap-6">
                      <div className="flex min-w-0 flex-col items-center text-center">
                        <SafeImage
                          src={detail.homeBadge}
                          alt=""
                          className="h-24 w-24 object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.35)] md:h-28 md:w-28"
                          fallbackClassName="inline-block h-24 w-24 rounded-full bg-white/15 md:h-28 md:w-28"
                        />
                        <p className="mt-2 max-w-[170px] truncate text-sm font-semibold md:text-lg">
                          {detail.homeTeam}
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-[42px] font-black leading-none md:text-[74px]">
                          {detail.homeScore}
                          <span className="px-1 text-white/70">:</span>
                          {detail.awayScore}
                        </p>
                        <p className="mt-2 text-xs text-white/75 md:text-sm">
                          {detail.statusDetail ?? "Match"} •{" "}
                          {formatKickoff(detail.startTime)}
                        </p>
                      </div>

                      <div className="flex min-w-0 flex-col items-center text-center">
                        <SafeImage
                          src={detail.awayBadge}
                          alt=""
                          className="h-24 w-24 object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.35)] md:h-28 md:w-28"
                          fallbackClassName="inline-block h-24 w-24 rounded-full bg-white/15 md:h-28 md:w-28"
                        />
                        <p className="mt-2 max-w-[170px] truncate text-sm font-semibold md:text-lg">
                          {detail.awayTeam}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              {ADSTERRA_TOP_SLOT && (
                <aside className="ls-card hidden overflow-hidden p-3 xl:block">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Sponsored
                    </p>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
                      Top Banner
                    </span>
                  </div>
                  <div className="flex justify-center rounded-lg border border-slate-800 bg-black/20 p-2">
                    <AdsterraSlot
                      zoneKey={ADSTERRA_TOP_SLOT}
                      host={ADSTERRA_HOST}
                      width={300}
                      height={250}
                      format="banner"
                      className="overflow-hidden rounded-md"
                    />
                  </div>
                </aside>
              )}
            </div>

            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {detailMetaCards.map((card) => (
                <article key={card.label} className="ls-meta-strip p-4">
                  <p className="mono-label text-[11px] uppercase tracking-[0.16em] text-(--ls-muted)">
                    {card.label}
                  </p>
                  <p className="mt-3 text-base font-bold text-(--ls-text)">
                    {card.value}
                  </p>
                </article>
              ))}
            </section>

            <section className="ls-match-panel ls-card overflow-hidden p-4 md:p-5">
              <h2 className="ls-match-panel-title inline-flex items-center gap-2 text-lg font-bold text-white">
                <span className="ls-blink inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span>Live Stream</span>
              </h2>

              {streams.length > 0 ? (
                <>
                  {activeStreamUrl && (
                    <div className="mt-3">
                      <StreamPlayer
                        src={activeStreamUrl}
                        onLoad={() => {
                          setLastLoadedUrl(activeStreamUrl);
                          setFailedStreamUrls((prev) =>
                            prev.filter((url) => url !== activeStreamUrl),
                          );
                        }}
                        onError={() => {
                          moveToNextSource(true);
                        }}
                      />
                    </div>
                  )}

                  <div className="mt-4 flex flex-col gap-3">
                    <StreamSourceSelect
                      sources={rankedStreams}
                      selectedUrl={activeStreamUrl}
                      onChange={(url) => {
                        setSelectedStreamUrl(url);
                        setFailedStreamUrls((prev) =>
                          prev.filter((item) => item !== url),
                        );
                      }}
                    />

                    <div className="flex flex-wrap">
                      {failedStreamUrls.length > 0 && (
                        <span className="text-xs text-amber-500 dark:text-amber-300">
                          Skipped {failedStreamUrls.length} bad source
                          {failedStreamUrls.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-3 text-base text-slate-300">
                  No stream available
                </div>
              )}
            </section>


            <section className="grid gap-3 lg:grid-cols-2">
              <article className="ls-match-list ls-card overflow-hidden">
                <div className="ls-match-list-head border-b border-slate-800 px-4 py-2.5">
                  <h2 className="ls-match-list-title text-base font-bold text-slate-100">
                    Other Live Matches
                  </h2>
                </div>
                {liveLoading ? (
                  <div className="space-y-2 p-4">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div
                        key={`live-skel-${idx}`}
                        className="h-12 animate-pulse rounded bg-slate-800"
                      />
                    ))}
                  </div>
                ) : otherLiveMatches.length === 0 ? (
                  <p className="p-4 text-sm text-slate-300">
                    No other live matches right now.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-800">
                    {otherLiveMatches.map((match) => (
                      <li
                        key={`live-${match.id}`}
                        className="ls-match-row px-4 py-3 transition hover:bg-[#111a2b]"
                      >
                        <Link
                          href={`/match/${encodeURIComponent(match.id)}`}
                          className="block"
                        >
                          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                              <SafeImage
                                src={match.homeBadge}
                                alt=""
                                className="h-6 w-6 shrink-0 object-contain"
                                fallbackClassName="inline-block h-6 w-6 shrink-0 rounded-full bg-slate-700"
                              />
                              <p className="truncate text-xs font-semibold text-slate-100">
                                {match.homeTeam}
                              </p>
                            </div>
                            <p className="ls-match-score rounded bg-[#151f33] px-2 py-1 text-sm font-extrabold text-slate-100">
                              {match.homeScore}:{match.awayScore}
                            </p>
                            <div className="flex min-w-0 items-center justify-end gap-2">
                              <p className="truncate text-right text-xs font-semibold text-slate-100">
                                {match.awayTeam}
                              </p>
                              <SafeImage
                                src={match.awayBadge}
                                alt=""
                                className="h-6 w-6 shrink-0 object-contain"
                                fallbackClassName="inline-block h-6 w-6 shrink-0 rounded-full bg-slate-700"
                              />
                            </div>
                          </div>
                          <p className="mt-1 text-xs text-slate-300">
                            {match.statusDetail ?? "Live"}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </article>

              <article className="ls-match-list ls-card overflow-hidden">
                <div className="ls-match-list-head border-b border-slate-800 px-4 py-2.5">
                  <h2 className="ls-match-list-title text-base font-bold text-slate-100">
                    Incoming Matches
                  </h2>
                </div>
                {upcomingLoading ? (
                  <div className="space-y-2 p-4">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div
                        key={`upcoming-skel-${idx}`}
                        className="h-12 animate-pulse rounded bg-slate-800"
                      />
                    ))}
                  </div>
                ) : incomingMatches.length === 0 ? (
                  <p className="p-4 text-sm text-slate-300">
                    No incoming matches for this date.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-800">
                    {incomingMatches.map((match) => (
                      <li
                        key={`incoming-${match.id}`}
                        className="ls-match-row px-4 py-3 transition hover:bg-[#111a2b]"
                      >
                        <Link
                          href={`/match/${encodeURIComponent(match.id)}`}
                          className="block"
                        >
                          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                              <SafeImage
                                src={match.homeBadge}
                                alt=""
                                className="h-6 w-6 shrink-0 object-contain"
                                fallbackClassName="inline-block h-6 w-6 shrink-0 rounded-full bg-slate-700"
                              />
                              <p className="truncate text-xs font-semibold text-slate-100">
                                {match.homeTeam}
                              </p>
                            </div>
                            <p className="ls-match-score rounded bg-[#151f33] px-2 py-1 text-xs font-bold text-slate-200">
                              VS
                            </p>
                            <div className="flex min-w-0 items-center justify-end gap-2">
                              <p className="truncate text-right text-xs font-semibold text-slate-100">
                                {match.awayTeam}
                              </p>
                              <SafeImage
                                src={match.awayBadge}
                                alt=""
                                className="h-6 w-6 shrink-0 object-contain"
                                fallbackClassName="inline-block h-6 w-6 shrink-0 rounded-full bg-slate-700"
                              />
                            </div>
                          </div>
                          <p className="mt-1 text-xs text-slate-300">
                            {formatKickoff(match.startTime)} •{" "}
                            {match.statusDetail ?? "Upcoming"}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </section>

            {ADSTERRA_NATIVE_CODE && (
              <section className="rounded-xl border border-slate-800 bg-[#090d18] p-3">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Sponsored
                  </p>
                  <span className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
                    Native Banner
                  </span>
                </div>
                <div className="flex justify-center rounded-lg border border-slate-700 bg-[#0f182a] p-2">
                  <AdsterraNativeSlot
                    code={ADSTERRA_NATIVE_CODE}
                    height={320}
                    className="overflow-hidden rounded-md"
                  />
                </div>
              </section>
            )}

          </section>
        )}
      </div>
    </main>
  );
}
