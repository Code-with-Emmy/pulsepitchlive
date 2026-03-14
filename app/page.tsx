"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AdsterraNativeSlot from "@/components/AdsterraNativeSlot";
import AdsterraSlot from "@/components/AdsterraSlot";
import BrowserAlertsButton from "@/components/BrowserAlertsButton";
import MatchCard from "@/components/MatchCard";
import SafeImage from "@/components/SafeImage";
import SportSelector from "@/components/SportSelector";
import Tabs from "@/components/Tabs";
import ThemeToggle from "@/components/ThemeToggle";
import { useBrowserAlerts } from "@/hooks/useBrowserAlerts";
import { useMatchNotifications } from "@/hooks/useMatchNotifications";
import { formatKickoff, todayInputDate } from "@/lib/date";
import { ApiClientError } from "@/lib/api-client";
import {
  readFavoriteIds,
  readFavoritesOnly,
  readPinnedLeagues,
  readPinnedOnly,
  writeFavoriteIds,
  writeFavoritesOnly,
  writePinnedLeagues,
  writePinnedOnly,
} from "@/lib/storage";
import type { MatchStatus } from "@/lib/types";
import { useMatches } from "@/hooks/useMatches";
import { useSports } from "@/hooks/useSports";

const ADSTERRA_HOST =
  process.env.NEXT_PUBLIC_ADSTERRA_HOST || "www.highperformanceformat.com";
const ADSTERRA_DEFAULT_NATIVE_SLOT =
  process.env.NEXT_PUBLIC_ADSTERRA_SLOT_300X250;
const ADSTERRA_NOTIFICATION_SLOT =
  process.env.NEXT_PUBLIC_ADSTERRA_NOTIFICATION_SLOT ||
  ADSTERRA_DEFAULT_NATIVE_SLOT;
const ADSTERRA_NATIVE_CODE = process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_CODE;

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

function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 6.5a1 1 0 0 1 1.53-.85l8 5.5a1 1 0 0 1 0 1.7l-8 5.5A1 1 0 0 1 8 17.5v-11Z" />
    </svg>
  );
}

export default function HomePage() {
  const [todayDate, setTodayDate] = useState("");
  const [sport, setSport] = useState("");
  const [status, setStatus] = useState<MatchStatus>("inprogress");
  const [date, setDate] = useState<string>("");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);
  const [pinnedLeagues, setPinnedLeagues] = useState<string[]>([]);
  const [pinnedOnly, setPinnedOnly] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const syncId = window.setTimeout(() => {
      const today = todayInputDate();
      setTodayDate(today);
      setDate((prev) => prev || today);
      setFavoriteIds(readFavoriteIds());
      setFavoritesOnly(readFavoritesOnly());
      setPinnedLeagues(readPinnedLeagues());
      setPinnedOnly(readPinnedOnly());
    }, 0);

    return () => {
      window.clearTimeout(syncId);
    };
  }, []);

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

  const { sports, error: sportsError, isLoading: sportsLoading } = useSports();
  const { permission: alertsPermission, requestPermission } = useBrowserAlerts();
  const activeSport = sport || sports[0]?.id || "";

  const {
    matches,
    error: matchesError,
    isLoading: matchesLoading,
    mutate,
  } = useMatches(
    activeSport && date ? { sport: activeSport, status, date } : null,
  );
  const { matches: upcomingMatchesRaw, isLoading: upcomingLoading } =
    useMatches(
      status !== "notstarted" && activeSport && date
        ? { sport: activeSport, status: "notstarted", date }
        : null,
    );
  const { matches: liveMatchesRaw, isLoading: liveMatchesLoading } = useMatches(
    status !== "inprogress" && activeSport && date
      ? { sport: activeSport, status: "inprogress", date }
      : null,
  );
  const fallbackLiveDate = todayDate && todayDate !== date ? todayDate : "";
  const {
    matches: fallbackLiveMatchesRaw,
    isLoading: fallbackLiveLoading,
  } = useMatches(
    activeSport && fallbackLiveDate
      ? { sport: activeSport, status: "inprogress", date: fallbackLiveDate }
      : null,
  );

  const filteredMatches = useMemo(() => {
    let next = matches;

    if (favoritesOnly) {
      next = next.filter((match) => favoriteIds.includes(match.id));
    }

    if (pinnedOnly) {
      next = next.filter((match) =>
        pinnedLeagues.includes(match.league ?? "Unknown League"),
      );
    }

    return next;
  }, [favoriteIds, favoritesOnly, pinnedLeagues, pinnedOnly, matches]);

  const upcomingMatchesSource =
    status === "notstarted" ? matches : upcomingMatchesRaw;
  const liveMatchesSource =
    status === "inprogress" ? matches : liveMatchesRaw;

  const upcomingMatches = useMemo(
    () => upcomingMatchesSource.slice(0, 8),
    [upcomingMatchesSource],
  );

  const apiLeagues = useMemo(() => {
    const allById = new Map<string, (typeof matches)[number]>();
    const liveById = new Map<string, (typeof matches)[number]>();

    [...matches, ...upcomingMatchesSource, ...liveMatchesSource].forEach(
      (match) => {
        allById.set(match.id, match);
      },
    );
    liveMatchesSource.forEach((match) => {
      liveById.set(match.id, match);
    });

    const map = new Map<
      string,
      {
        name: string;
        logo?: string;
        flag?: string;
        totalCount: number;
        liveCount: number;
      }
    >();

    Array.from(allById.values()).forEach((match) => {
      const name = match.league ?? "Unknown League";
      const existing = map.get(name);

      map.set(name, {
        name,
        logo: existing?.logo ?? match.leagueLogo,
        flag: existing?.flag ?? match.leagueFlag,
        totalCount: (existing?.totalCount ?? 0) + 1,
        liveCount: existing?.liveCount ?? 0,
      });
    });

    Array.from(liveById.values()).forEach((match) => {
      const name = match.league ?? "Unknown League";
      const existing = map.get(name);

      map.set(name, {
        name,
        logo: existing?.logo ?? match.leagueLogo,
        flag: existing?.flag ?? match.leagueFlag,
        totalCount: existing?.totalCount ?? 0,
        liveCount: (existing?.liveCount ?? 0) + 1,
      });
    });

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [matches, upcomingMatchesSource, liveMatchesSource]);

  const totalLiveCount = useMemo(
    () => apiLeagues.reduce((sum, league) => sum + league.liveCount, 0),
    [apiLeagues],
  );

  const liveFeed = useMemo(
    () =>
      [...liveMatchesSource, ...fallbackLiveMatchesRaw].filter(
        (match, index, list) =>
          list.findIndex((candidate) => candidate.id === match.id) === index,
      ),
    [liveMatchesSource, fallbackLiveMatchesRaw],
  );
  const filteredLiveFeed = useMemo(() => {
    let next = liveFeed;

    if (favoritesOnly) {
      next = next.filter((match) => favoriteIds.includes(match.id));
    }

    if (pinnedOnly) {
      next = next.filter((match) =>
        pinnedLeagues.includes(match.league ?? "Unknown League"),
      );
    }

    return next;
  }, [liveFeed, favoritesOnly, favoriteIds, pinnedOnly, pinnedLeagues]);
  const displayMatches = useMemo(() => {
    if (status !== "inprogress") {
      return filteredMatches;
    }

    if (filteredMatches.length > 0) {
      return filteredMatches;
    }

    return filteredLiveFeed;
  }, [status, filteredMatches, filteredLiveFeed]);
  const featuredLiveMatch = useMemo(() => liveFeed[0] ?? null, [liveFeed]);
  const featuredLeagueName = featuredLiveMatch?.league ?? "Featured Match";
  const sidebarLeagues = useMemo(() => apiLeagues.slice(0, 14), [apiLeagues]);
  const highlightMatches = useMemo(
    () => displayMatches.slice(0, 3),
    [displayMatches],
  );
  const leagueGroup = useMemo(
    () => sidebarLeagues.slice(0, 8),
    [sidebarLeagues],
  );
  const cupGroup = useMemo(() => sidebarLeagues.slice(8, 14), [sidebarLeagues]);
  const featuredLeagueMedia = useMemo(
    () => apiLeagues.find((league) => league.name === featuredLeagueName),
    [apiLeagues, featuredLeagueName],
  );
  const searchPool = useMemo(() => {
    const byId = new Map<string, (typeof matches)[number]>();
    [...liveFeed, ...upcomingMatchesSource, ...matches].forEach((match) => {
      byId.set(match.id, match);
    });
    return Array.from(byId.values());
  }, [liveFeed, upcomingMatchesSource, matches]);
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

    liveFeed.slice(0, 4).forEach((match) => {
      cards.push({
        id: `live-${match.id}`,
        title: `${match.homeTeam} vs ${match.awayTeam} is live`,
        detail: `${match.homeScore}-${match.awayScore} • ${match.statusDetail ?? "In progress"}`,
        href: `/match/${encodeURIComponent(match.id)}`,
        homeBadge: match.homeBadge,
        awayBadge: match.awayBadge,
      });
    });

    upcomingMatchesSource.slice(0, 3).forEach((match) => {
      cards.push({
        id: `upcoming-${match.id}`,
        title: `${match.homeTeam} vs ${match.awayTeam} kicks off soon`,
        detail: `${formatKickoff(match.startTime)} • ${match.league ?? "League"}`,
        href: `/match/${encodeURIComponent(match.id)}`,
        homeBadge: match.homeBadge,
        awayBadge: match.awayBadge,
      });
    });

    matches
      .filter((match) => match.status === "finished")
      .slice(0, 2)
      .forEach((match) => {
        cards.push({
          id: `finished-${match.id}`,
          title: `${match.homeTeam} ${match.homeScore}-${match.awayScore} ${match.awayTeam}`,
          detail: `Final • ${match.league ?? "League"}`,
          href: `/match/${encodeURIComponent(match.id)}`,
          homeBadge: match.homeBadge,
          awayBadge: match.awayBadge,
        });
      });

    return cards.slice(0, 9);
  }, [liveFeed, upcomingMatchesSource, matches]);
  const trackedAlertMatches = useMemo(() => {
    if (favoriteIds.length === 0 && pinnedLeagues.length === 0) {
      return [];
    }

    const byId = new Map<string, (typeof matches)[number]>();
    [...liveFeed, ...upcomingMatchesSource, ...matches].forEach((match) => {
      const league = match.league ?? "Unknown League";
      if (
        favoriteIds.includes(match.id) ||
        pinnedLeagues.includes(league)
      ) {
        byId.set(match.id, match);
      }
    });

    return Array.from(byId.values()).map((match) => ({
      id: match.id,
      awayScore: match.awayScore,
      awayTeam: match.awayTeam,
      homeScore: match.homeScore,
      homeTeam: match.homeTeam,
      href: `/match/${encodeURIComponent(match.id)}`,
      league: match.league,
      status: match.status,
    }));
  }, [favoriteIds, liveFeed, matches, pinnedLeagues, upcomingMatchesSource]);

  useMatchNotifications({
    permission: alertsPermission,
    matches: trackedAlertMatches,
  });

  function toggleFavorite(matchId: string) {
    setFavoriteIds((prev) => {
      const next = prev.includes(matchId)
        ? prev.filter((id) => id !== matchId)
        : [...prev, matchId];
      writeFavoriteIds(next);
      return next;
    });
  }

  function toggleFavoritesOnly() {
    setFavoritesOnly((prev) => {
      const next = !prev;
      writeFavoritesOnly(next);
      return next;
    });
  }

  function toggleLeaguePin(league: string) {
    const normalized = league.trim() || "Unknown League";
    setPinnedLeagues((prev) => {
      const next = prev.includes(normalized)
        ? prev.filter((item) => item !== normalized)
        : [...prev, normalized];
      writePinnedLeagues(next);
      return next;
    });
  }

  function togglePinnedOnly() {
    setPinnedOnly((prev) => {
      const next = !prev;
      writePinnedOnly(next);
      return next;
    });
  }

  const is503 =
    matchesError instanceof ApiClientError && matchesError.status === 503;
  const heroLoading =
    liveMatchesLoading ||
    (liveMatchesSource.length === 0 && fallbackLiveLoading);
  const liveFallbackLoading =
    status === "inprogress" &&
    filteredMatches.length === 0 &&
    (liveMatchesLoading || fallbackLiveLoading);
  const matchesSectionLoading = matchesLoading || liveFallbackLoading;

  return (
    <main className="min-h-screen bg-(--ls-bg) text-(--ls-text)">
      <header className="sticky top-0 z-40 border-b border-(--ls-border) bg-(--ls-header) backdrop-blur">
        <div className="mx-auto flex h-[74px] w-full max-w-[1500px] items-center justify-between px-3 md:px-6">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="PulsePitch Live"
              className="h-20 w-auto object-contain md:h-14"
            />
          </div>

          <div
            className="relative flex items-center gap-2"
            data-header-popover="true"
          >
            <BrowserAlertsButton
              permission={alertsPermission}
              onRequest={() => {
                void requestPermission();
              }}
            />
            <button
              type="button"
              onClick={() => {
                setSearchOpen((prev) => !prev);
                setNotificationsOpen(false);
              }}
              className="ls-control ls-control-muted inline-flex h-9 w-9 items-center justify-center text-base text-(--ls-muted)"
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
            <ThemeToggle />

            {searchOpen && (
              <div className="ls-floating-panel absolute right-0 top-12 z-50 w-[min(92vw,420px)] overflow-hidden rounded-2xl">
                <div className="border-b border-var(--ls-border) p-3">
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
                            className="h-5 w-5 rounded-full border border-(--ls-surface) object-contain bg-(--ls-surface)"
                            fallbackClassName="inline-block h-5 w-5 rounded-full border border-(--ls-surface) bg-(--ls-panel-alt)"
                          />
                          <SafeImage
                            src={match.awayBadge}
                            alt=""
                            className="h-5 w-5 rounded-full border border-(--ls-surface) object-contain bg-(--ls-surface)"
                            fallbackClassName="inline-block h-5 w-5 rounded-full border border-(--ls-surface) bg-(--ls-panel-alt)"
                          />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-(--ls-text)">
                            {match.homeTeam} vs {match.awayTeam}
                          </span>
                          <span className="block truncate text-xs text-(--ls-muted)">
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
              <div className="ls-floating-panel absolute right-0 top-12 z-50 w-[min(92vw,420px)] overflow-hidden rounded-2xl">
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
                    Enable browser alerts to get live updates for favorite or pinned matches while this page is open.
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

      <div className="mx-auto w-full max-w-[1500px] px-2 py-3 md:px-4">
        <div className="grid gap-2.5 md:grid-cols-[248px_minmax(0,1fr)]">
          <aside className="ls-card hidden p-3 md:block">
            <div className="flex items-center justify-between border-b border-(--ls-border) pb-3">
              <p className="text-lg font-semibold text-(--ls-text)">Leagues</p>
              <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-300">
                {totalLiveCount} Live
              </span>
            </div>

            <div className="mt-3 space-y-1">
              {leagueGroup.map((league) => {
                const pinned = pinnedLeagues.includes(league.name);
                return (
                  <button
                    key={`league-nav-${league.name}`}
                    type="button"
                    onClick={() => toggleLeaguePin(league.name)}
                    className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition ${
                      pinned
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "text-(--ls-muted) hover:bg-(--ls-panel-alt)"
                    }`}
                  >
                    {league.logo ? (
                      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                        <SafeImage
                          src={league.logo}
                          alt=""
                          className="h-5 w-5 rounded object-contain"
                          hideOnError
                        />
                        {league.flag && (
                          <SafeImage
                            src={league.flag}
                            alt=""
                            className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full border border-(--ls-surface) object-cover"
                            hideOnError
                          />
                        )}
                      </span>
                    ) : league.flag ? (
                      <SafeImage
                        src={league.flag}
                        alt=""
                        className="h-5 w-5 rounded-full object-cover"
                        hideOnError
                      />
                    ) : (
                      <span className="inline-block h-5 w-5 rounded-full bg-(--ls-panel-alt)" />
                    )}
                    <span className="min-w-0 flex-1 truncate">
                      {league.name}
                    </span>
                    <span className="text-[11px] opacity-70">
                      {league.liveCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {cupGroup.length > 0 && (
              <div className="mt-4 border-t border-(--ls-border) pt-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--ls-muted)">
                  Cup
                </p>
                <div className="mt-2 space-y-1">
                  {cupGroup.map((league) => (
                    <button
                      key={`cup-nav-${league.name}`}
                      type="button"
                      onClick={() => toggleLeaguePin(league.name)}
                      className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm text-(--ls-muted) transition hover:bg-(--ls-panel-alt)"
                    >
                      {league.logo ? (
                        <SafeImage
                          src={league.logo}
                          alt=""
                          className="h-5 w-5 rounded object-contain"
                          hideOnError
                        />
                      ) : league.flag ? (
                        <SafeImage
                          src={league.flag}
                          alt=""
                          className="h-5 w-5 rounded-full object-cover"
                          hideOnError
                        />
                      ) : (
                        <span className="inline-block h-5 w-5 rounded-full bg-(--ls-panel-alt)" />
                      )}
                      <span className="min-w-0 flex-1 truncate">
                        {league.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {pinnedLeagues.length > 0 && (
              <div className="mt-4 border-t border-(--ls-border) pt-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--ls-muted)">
                  Pinned
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {pinnedLeagues.map((league) => (
                    <button
                      key={`pinned-${league}`}
                      type="button"
                      onClick={() => toggleLeaguePin(league)}
                      className="inline-flex h-7 items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 text-xs font-semibold text-emerald-300"
                    >
                      <span className="truncate max-w-28">{league}</span>
                      <span>✕</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <section className="space-y-2.5">
            <section className="ls-card p-3">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                <div className="flex flex-wrap items-end gap-2.5">
                  <SportSelector
                    sports={sports}
                    value={activeSport}
                    onChange={setSport}
                    loading={sportsLoading}
                  />

                  <label className="flex min-w-[170px] flex-col gap-2">
                    <span className="mono-label text-xs uppercase tracking-[0.14em] text-(--ls-muted)">
                      Date
                    </span>
                    <input
                      type="date"
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                      className="ls-select h-12 px-4 text-base font-semibold text-(--ls-text) outline-none ring-emerald-400 transition focus:ring-2"
                    />
                  </label>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={toggleFavoritesOnly}
                    className={`ls-control inline-flex h-10 items-center px-4 text-sm font-semibold ${
                      favoritesOnly
                        ? "ls-control-solid"
                        : "ls-control-muted"
                    }`}
                  >
                    {favoritesOnly ? "Favorites On" : "Favorites"}
                  </button>
                  <button
                    type="button"
                    onClick={togglePinnedOnly}
                    className={`ls-control inline-flex h-10 items-center px-4 text-sm font-semibold ${
                      pinnedOnly
                        ? "ls-control-solid"
                        : "ls-control-muted"
                    }`}
                  >
                    {pinnedOnly ? "Pinned On" : "Pinned"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void mutate();
                    }}
                    className="ls-control ls-control-muted inline-flex h-10 items-center px-4 text-sm font-semibold"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              <div className="mt-3 border-t border-(--ls-border) pt-3">
                <Tabs value={status} onChange={setStatus} />
              </div>
            </section>

            {sportsError && (
              <p className="rounded-xl border border-rose-800 bg-rose-950/35 px-4 py-3 text-sm text-rose-200">
                Could not load sports list. Check API key/server connectivity.
              </p>
            )}

            {is503 && (
              <p className="rounded-xl border border-amber-700 bg-amber-950/25 px-4 py-3 text-sm text-amber-200">
                Data updating, retrying...
              </p>
            )}

            {matchesError && !is503 && (
              <p className="rounded-xl border border-rose-800 bg-rose-950/35 px-4 py-3 text-sm text-rose-200">
                Failed to load matches. Please try again.
              </p>
            )}

            {heroLoading ? (
              <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0a0f1d] p-4">
                <div className="h-64 animate-pulse rounded-xl bg-slate-800" />
              </section>
            ) : featuredLiveMatch ? (
              <section className="ls-hero-shell relative overflow-hidden rounded-xl border border-emerald-500/50 bg-[#060a14] p-1 text-white shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(42,255,123,0.25)_0px,transparent_6px)] opacity-35" />
                <div className="ls-hero-frame relative min-h-[255px] overflow-hidden rounded-lg border border-emerald-500/40 p-4 md:min-h-[338px] md:p-6">
                  <div className="ls-hero-backdrop pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_50%,rgba(46,107,255,0.38),transparent_47%),radial-gradient(circle_at_84%_48%,rgba(240,124,35,0.30),transparent_46%),linear-gradient(102deg,rgba(17,30,74,0.9),rgba(12,18,30,0.97))]" />
                  <div className="pointer-events-none absolute -left-8 bottom-[-34px] h-28 w-28 rotate-45 border-l-4 border-b-4 border-emerald-500/85" />
                  <div className="relative">
                    <div className="flex items-center justify-between gap-2">
                      <p className="flex items-center gap-2 text-sm font-semibold tracking-wide text-emerald-300">
                        {featuredLeagueMedia?.logo && (
                          <SafeImage
                            src={featuredLeagueMedia.logo}
                            alt=""
                            className="h-5 w-5 rounded object-contain"
                            hideOnError
                          />
                        )}
                        {featuredLeagueMedia?.flag && (
                          <SafeImage
                            src={featuredLeagueMedia.flag}
                            alt=""
                            className="h-4 w-4 rounded-full object-cover"
                            hideOnError
                          />
                        )}
                        <span>{featuredLeagueName}</span>
                      </p>
                      <span className="rounded-full bg-rose-500 px-3 py-1 text-xs font-bold">
                        LIVE
                      </span>
                    </div>

                    <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-2 md:gap-6">
                      <div className="flex min-w-0 flex-col items-center text-center">
                        <SafeImage
                          src={featuredLiveMatch.homeBadge}
                          alt=""
                          className="h-24 w-24 object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.35)] md:h-28 md:w-28"
                          fallbackClassName="inline-block h-24 w-24 rounded-full bg-white/15 md:h-28 md:w-28"
                        />
                        <p className="mt-2 max-w-[170px] truncate text-sm font-semibold md:text-lg">
                          {featuredLiveMatch.homeTeam}
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-[42px] font-black leading-none md:text-[74px]">
                          {featuredLiveMatch.homeScore}
                          <span className="px-1 text-white/70">:</span>
                          {featuredLiveMatch.awayScore}
                        </p>
                        <p className="mt-2 text-xs text-white/75 md:text-sm">
                          {featuredLiveMatch.statusDetail ?? "Live now"} •{" "}
                          {formatKickoff(featuredLiveMatch.startTime)}
                        </p>
                      </div>

                      <div className="flex min-w-0 flex-col items-center text-center">
                        <SafeImage
                          src={featuredLiveMatch.awayBadge}
                          alt=""
                          className="h-24 w-24 object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.35)] md:h-28 md:w-28"
                          fallbackClassName="inline-block h-24 w-24 rounded-full bg-white/15 md:h-28 md:w-28"
                        />
                        <p className="mt-2 max-w-[170px] truncate text-sm font-semibold md:text-lg">
                          {featuredLiveMatch.awayTeam}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-center">
                      <Link
                        href={`/match/${encodeURIComponent(featuredLiveMatch.id)}`}
                        className="inline-flex h-12 items-center gap-2 rounded-md bg-emerald-500 px-7 text-xl font-bold text-black transition hover:bg-emerald-400"
                      >
                        <PlayIcon />
                        <span>Watch Now</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            ) : (
              <section className="rounded-xl border border-slate-800 bg-[#090d18] p-6 text-center text-sm text-slate-300">
                No live match available for this date. Try today for active
                games.
              </section>
            )}

            {status !== "finished" && (
              <>
                <section className="ls-featured-wrap overflow-hidden rounded-xl border border-slate-800 bg-[#090d18]">
                  <div className="ls-featured-head flex items-center justify-between border-b border-slate-800 px-4 py-3">
                    <h2 className="text-2xl font-bold text-white">
                      Latest Featured Match
                    </h2>
                    <span className="text-sm font-semibold text-slate-400">
                      {highlightMatches.length} items
                    </span>
                  </div>

                  {matchesSectionLoading ? (
                    <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={`highlight-skel-${index}`}
                          className="h-80 animate-pulse rounded-xl bg-slate-800"
                        />
                      ))}
                    </div>
                  ) : highlightMatches.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-slate-300">
                      No matches found for this filter.
                    </div>
                  ) : (
                    <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
                      {highlightMatches.map((match) => (
                        <article
                          key={`highlight-${match.id}`}
                          className="ls-featured-card overflow-hidden rounded-xl border border-slate-700 bg-slate-900"
                        >
                          <div className="ls-featured-card-top bg-[linear-gradient(130deg,#0f4de2_0%,#1041be_21%,#cf2b2b_21%,#cf2b2b_100%)] p-4">
                            <div className="mb-3 flex items-center justify-between text-xs font-semibold text-white/90">
                              <span className="flex min-w-0 items-center gap-1.5">
                                {match.leagueLogo && (
                                  <SafeImage
                                    src={match.leagueLogo}
                                    alt=""
                                    className="h-5 w-5 rounded object-contain"
                                    hideOnError
                                  />
                                )}
                                {match.leagueFlag && (
                                  <SafeImage
                                    src={match.leagueFlag}
                                    alt=""
                                    className="h-3.5 w-3.5 rounded-full object-cover"
                                    hideOnError
                                  />
                                )}
                                <span className="truncate">
                                  {match.league ?? "League"}
                                </span>
                              </span>
                              <span>
                                {match.status === "inprogress"
                                  ? "LIVE"
                                  : match.status === "notstarted"
                                    ? "UPCOMING"
                                    : "FINISHED"}
                              </span>
                            </div>
                            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                              <div className="flex flex-col items-center gap-2.5">
                                <SafeImage
                                  src={match.homeBadge}
                                  alt=""
                                  className="h-14 w-14 object-contain"
                                  fallbackClassName="inline-block h-14 w-14 rounded-full bg-white/25"
                                />
                                <p className="line-clamp-2 text-center text-xs font-semibold text-white">
                                  {match.homeTeam}
                                </p>
                              </div>

                              <p className="rounded-lg bg-black/35 px-3 py-1 text-2xl font-black text-white">
                                {match.status === "notstarted"
                                  ? "VS"
                                  : `${match.homeScore}:${match.awayScore}`}
                              </p>

                              <div className="flex flex-col items-center gap-2.5">
                                <SafeImage
                                  src={match.awayBadge}
                                  alt=""
                                  className="h-14 w-14 object-contain"
                                  fallbackClassName="inline-block h-14 w-14 rounded-full bg-white/25"
                                />
                                <p className="line-clamp-2 text-center text-xs font-semibold text-white">
                                  {match.awayTeam}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="ls-featured-card-body space-y-3 border-t border-emerald-400/80 p-4">
                            <p className="line-clamp-2 text-base font-semibold text-slate-200">
                              {match.homeTeam} vs {match.awayTeam}
                            </p>
                            <div className="space-y-1 text-xs text-slate-300">
                              <p>
                                <span className="text-slate-400">League:</span>{" "}
                                {match.league ?? "League"}
                              </p>
                              <p>
                                <span className="text-slate-400">Kickoff:</span>{" "}
                                {formatKickoff(match.startTime)}
                              </p>
                              <p>
                                <span className="text-slate-400">Status:</span>{" "}
                                {match.statusDetail ?? match.status}
                              </p>
                            </div>
                            <Link
                              href={`/match/${encodeURIComponent(match.id)}`}
                              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md bg-emerald-500 text-base font-bold text-black transition hover:bg-emerald-400"
                            >
                              <PlayIcon />
                              <span>Watch Now</span>
                            </Link>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
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

                <section className="ls-card overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
                    <p className="text-base font-bold text-slate-100">
                      All Matches
                    </p>
                    <p className="mono-label text-xs uppercase tracking-[0.14em] text-slate-400">
                      {displayMatches.length} games
                    </p>
                  </div>

                  {matchesSectionLoading && (
                    <div className="space-y-2 px-4 py-3">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div
                          key={`all-matches-skeleton-${index}`}
                          className="h-12 animate-pulse rounded bg-slate-800"
                        />
                      ))}
                    </div>
                  )}

                  {!matchesSectionLoading && displayMatches.length === 0 && (
                    <div className="px-4 py-8 text-center text-base text-slate-300">
                      No matches found for the selected sport, date, and status.
                    </div>
                  )}

                  {!matchesSectionLoading && displayMatches.length > 0 && (
                    <div>
                      {displayMatches.map((match, index) => (
                        <MatchCard
                          key={match.id}
                          match={match}
                          isFavorite={favoriteIds.includes(match.id)}
                          onToggleFavorite={toggleFavorite}
                          isLeaguePinned={pinnedLeagues.includes(
                            match.league ?? "Unknown League",
                          )}
                          onToggleLeaguePin={toggleLeaguePin}
                          smartLinkEnabled={index < 4}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {ADSTERRA_NATIVE_CODE && (
                  <section className="ls-card p-3">
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
              </>
            )}

            {status !== "notstarted" && (
              <section className="ls-card overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
                  <p className="text-base font-bold text-slate-100">
                    Upcoming Matches
                  </p>
                  <p className="mono-label text-xs uppercase tracking-[0.14em] text-slate-400">
                    {upcomingMatches.length} games
                  </p>
                </div>

                {upcomingLoading && (
                  <div className="space-y-2 px-4 py-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={`upcoming-skeleton-${index}`}
                        className="h-11 animate-pulse rounded bg-slate-800"
                      />
                    ))}
                  </div>
                )}

                {!upcomingLoading && upcomingMatches.length === 0 && (
                  <div className="px-4 py-6 text-center text-base text-slate-300">
                    No upcoming matches found for this date.
                  </div>
                )}

                {!upcomingLoading && upcomingMatches.length > 0 && (
                  <div>
                    {upcomingMatches.map((match, index) => (
                      <MatchCard
                        key={`upcoming-inline-${match.id}`}
                        match={match}
                        isFavorite={favoriteIds.includes(match.id)}
                        onToggleFavorite={toggleFavorite}
                        isLeaguePinned={pinnedLeagues.includes(
                          match.league ?? "Unknown League",
                        )}
                        onToggleLeaguePin={toggleLeaguePin}
                        smartLinkEnabled={index < 2}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}
          </section>

        </div>
      </div>
    </main>
  );
}
