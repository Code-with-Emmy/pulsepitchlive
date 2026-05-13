"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AdsterraNativeSlot from "@/components/AdsterraNativeSlot";
import AdsterraSlot from "@/components/AdsterraSlot";
import EzoicAd from "@/components/EzoicAd";
import GoogleAd from "@/components/GoogleAd";
import BrowserAlertsButton from "@/components/BrowserAlertsButton";
import MatchCard from "@/components/MatchCard";
import MatchRailCard from "@/components/MatchRailCard";
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
const ADSTERRA_TOP_SLOT =
  process.env.NEXT_PUBLIC_ADSTERRA_TOP_SLOT || ADSTERRA_DEFAULT_NATIVE_SLOT;
const ADSTERRA_NATIVE_CODE = process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_CODE;
const HOMEPAGE_UPCOMING_LIMIT = 48;
const HOMEPAGE_SIDEBAR_LEAGUES_LIMIT = 40;
const HOMEPAGE_HIGHLIGHT_LIMIT = 10;
const HOMEPAGE_PRIMARY_LEAGUE_GROUP_LIMIT = 20;

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

function leaguePriority(name?: string): number {
  const normalized = (name ?? "").trim().toLowerCase();
  if (normalized === "premier league") {
    return 0;
  }

  return 1;
}

function compareLeagueNames(left?: string, right?: string): number {
  const priorityGap = leaguePriority(left) - leaguePriority(right);
  if (priorityGap !== 0) {
    return priorityGap;
  }

  return (left ?? "").localeCompare(right ?? "");
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

    return [...next].sort((a, b) =>
      compareLeagueNames(a.league, b.league),
    );
  }, [favoriteIds, favoritesOnly, pinnedLeagues, pinnedOnly, matches]);

  const upcomingMatchesSource =
    status === "notstarted" ? matches : upcomingMatchesRaw;
  const liveMatchesSource =
    status === "inprogress" ? matches : liveMatchesRaw;

  const upcomingMatches = useMemo(
    () =>
      [...upcomingMatchesSource]
        .sort((a, b) => compareLeagueNames(a.league, b.league))
        .slice(0, HOMEPAGE_UPCOMING_LIMIT),
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
      compareLeagueNames(a.name, b.name),
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

    return [...next].sort((a, b) =>
      compareLeagueNames(a.league, b.league),
    );
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
  const sidebarLeagues = useMemo(
    () => apiLeagues.slice(0, HOMEPAGE_SIDEBAR_LEAGUES_LIMIT),
    [apiLeagues],
  );
  const highlightMatches = useMemo(
    () => displayMatches.slice(0, HOMEPAGE_HIGHLIGHT_LIMIT),
    [displayMatches],
  );
  const promoMatches = useMemo(
    () => highlightMatches.slice(0, 2),
    [highlightMatches],
  );
  const liveRailMatches = useMemo(
    () => (status === "inprogress" ? displayMatches : filteredLiveFeed).slice(0, 12),
    [displayMatches, filteredLiveFeed, status],
  );
  const upcomingRailMatches = useMemo(
    () => upcomingMatches.slice(0, 12),
    [upcomingMatches],
  );
  const leagueGroup = useMemo(
    () => sidebarLeagues.slice(0, HOMEPAGE_PRIMARY_LEAGUE_GROUP_LIMIT),
    [sidebarLeagues],
  );
  const cupGroup = useMemo(
    () => sidebarLeagues.slice(HOMEPAGE_PRIMARY_LEAGUE_GROUP_LIMIT),
    [sidebarLeagues],
  );
  const featuredLeagueShelf = useMemo(
    () => [...leagueGroup, ...cupGroup].slice(0, 14),
    [leagueGroup, cupGroup],
  );
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
  const isInitialLoading = !date || !activeSport;
  const heroLoading =
    isInitialLoading ||
    liveMatchesLoading ||
    (liveMatchesSource.length === 0 && fallbackLiveLoading);
  const liveFallbackLoading =
    status === "inprogress" &&
    filteredMatches.length === 0 &&
    (liveMatchesLoading || fallbackLiveLoading);
  const matchesSectionLoading =
    isInitialLoading || matchesLoading || liveFallbackLoading;

  return (
    <main className="ls-shell min-h-screen bg-(--ls-bg) text-(--ls-text)">
      <header className="sticky top-0 z-9999 border-b border-(--ls-border) bg-(--ls-header) backdrop-blur">
        <div className="mx-auto flex h-[74px] w-full max-w-[1500px] items-center justify-between px-3 md:px-6">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="PulsePitch Live"
              className="h-20 w-auto object-contain md:h-14"
            />
            <div className="hidden md:block">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-(--ls-text)">
                PulsePitch Live
              </p>
              <p className="text-xs font-semibold text-(--ls-muted)">
                Live football streams, scores, and fixtures
              </p>
            </div>
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
              <div className="ls-floating-panel fixed right-3 top-[84px] z-99999 w-[min(94vw,420px)] overflow-hidden rounded-2xl md:right-6">
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
              <div className="ls-floating-panel fixed right-3 top-[84px] z-99999 w-[min(94vw,420px)] overflow-hidden rounded-2xl shadow-[0_28px_80px_rgba(0,0,0,0.52)] md:right-6">
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
                    Enable browser alerts to get live updates for favorite or
                    pinned matches while this page is open.
                  </div>
                )}
                <div className="max-h-[calc(100vh-112px)] overflow-y-auto p-2">
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

      <div className="relative z-0 mx-auto w-full max-w-[1500px] px-2 py-3 md:px-4">
        <section className="ls-rail-shell p-4 md:p-5 mb-3">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="mono-label text-[11px] uppercase tracking-[0.18em] text-(--ls-muted)">
                Top League
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-(--ls-text)">
                Save the leagues you follow
              </h2>
            </div>
            {pinnedLeagues.length > 0 && (
              <div className="hidden flex-wrap justify-end gap-2 md:flex">
                {pinnedLeagues.slice(0, 5).map((league) => (
                  <button
                    key={`pinned-quick-${league}`}
                    type="button"
                    onClick={() => toggleLeaguePin(league)}
                    className="rounded-full border border-(--ls-accent)/35 bg-(--ls-accent)/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-(--ls-accent)"
                  >
                    {league}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="ls-rail-track">
            {matchesSectionLoading
              ? Array.from({ length: 7 }).map((_, index) => (
                  <div
                    key={`league-shelf-skeleton-${index}`}
                    className="h-20 w-[260px] shrink-0 animate-pulse rounded-2xl bg-(--ls-panel-alt)"
                  />
                ))
              : featuredLeagueShelf.map((league) => {
                  const pinned = pinnedLeagues.includes(league.name);

                  return (
                    <button
                      key={`shelf-league-${league.name}`}
                      type="button"
                      onClick={() => toggleLeaguePin(league.name)}
                      className="ls-league-tile flex w-[260px] shrink-0 items-center gap-3 p-4 text-left transition-transform hover:-translate-y-1"
                    >
                      {league.logo ? (
                        <SafeImage
                          src={league.logo}
                          alt=""
                          className="h-12 w-12 shrink-0 rounded-xl object-contain"
                          hideOnError
                        />
                      ) : league.flag ? (
                        <SafeImage
                          src={league.flag}
                          alt=""
                          className="h-12 w-12 shrink-0 rounded-full object-cover"
                          hideOnError
                        />
                      ) : (
                        <span className="inline-block h-12 w-12 shrink-0 rounded-xl bg-(--ls-panel-alt)" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-base font-bold text-(--ls-text)">
                          {league.name}
                        </span>
                        <span className="mt-1 block text-sm text-(--ls-muted)">
                          {league.liveCount} live right now
                        </span>
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest ${pinned ? "bg-(--ls-accent) text-black" : "bg-(--ls-panel-alt) text-(--ls-muted)"}`}
                      >
                        {pinned ? "Saved" : "Add"}
                      </span>
                    </button>
                  );
                })}
          </div>
        </section>

        <section className="mb-3 grid gap-3 xl:grid-cols-[minmax(0,1.65fr)_360px]">
          {heroLoading ? (
            <>
              <section className="ls-billboard min-h-[360px] animate-pulse" />
              <div className="grid gap-3">
                <div className="ls-card h-[172px] animate-pulse" />
                <div className="ls-card h-[172px] animate-pulse" />
              </div>
            </>
          ) : featuredLiveMatch ? (
            <>
              <article className="ls-billboard min-h-[360px] p-6 md:p-8">
                <span className="ls-billboard-accent" />
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  {featuredLiveMatch.homeBadge && (
                    <div className="absolute -left-14 top-1/2 -translate-y-1/2 opacity-[0.12] blur-[0.6px]">
                      <SafeImage
                        src={featuredLiveMatch.homeBadge}
                        alt=""
                        className="h-52 w-52 object-contain md:h-68 md:w-68 xl:h-80 xl:w-80"
                        hideOnError
                      />
                    </div>
                  )}
                  {featuredLiveMatch.awayBadge && (
                    <div className="absolute -right-14 top-1/2 -translate-y-1/2 opacity-[0.12] blur-[0.6px]">
                      <SafeImage
                        src={featuredLiveMatch.awayBadge}
                        alt=""
                        className="h-52 w-52 object-contain md:h-68 md:w-68 xl:h-80 xl:w-80"
                        hideOnError
                      />
                    </div>
                  )}
                </div>
                <div className="relative z-1 flex h-full flex-col justify-between gap-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="mono-label text-[11px] uppercase tracking-[0.22em] text-white/55">
                        Live on PulsePitch
                      </p>
                      <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/78">
                        {featuredLeagueMedia?.logo && (
                          <SafeImage
                            src={featuredLeagueMedia.logo}
                            alt=""
                            className="h-4 w-4 rounded object-contain"
                            hideOnError
                          />
                        )}
                        {featuredLeagueName}
                      </p>
                    </div>
                    <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-white">
                      Live
                    </span>
                  </div>

                  <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                    <div className="max-w-3xl">
                      <h1 className="text-4xl font-black tracking-[-0.06em] text-white md:text-6xl">
                        {featuredLiveMatch.homeTeam} vs{" "}
                        {featuredLiveMatch.awayTeam}
                      </h1>
                      <p className="mt-4 max-w-2xl text-sm leading-6 text-white/68 md:text-base">
                        Big-screen match coverage, fast score updates, and a
                        direct path into the stream without the extra noise.
                      </p>
                      <div className="mt-6 flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/82">
                          {totalLiveCount} live now
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/82">
                          {upcomingMatchesSource.length} scheduled
                        </span>
                        <span className="rounded-full border border-(--ls-accent)/30 bg-(--ls-accent)/12 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-(--ls-accent)">
                          {favoriteIds.length} saved
                        </span>
                      </div>
                      <div className="mt-7 flex flex-wrap items-center gap-3">
                        <Link
                          href={`/match/${encodeURIComponent(featuredLiveMatch.id)}?fs=1`}
                          className="ls-control ls-control-solid inline-flex h-12 items-center gap-2 px-6 text-sm font-black uppercase tracking-[0.14em]"
                        >
                          <PlayIcon />
                          Watch live
                        </Link>
                        <p className="text-sm font-semibold text-white/62">
                          {featuredLiveMatch.statusDetail ?? "In progress"} •{" "}
                          {formatKickoff(featuredLiveMatch.startTime)}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                      {[
                        {
                          team: featuredLiveMatch.homeTeam,
                          badge: featuredLiveMatch.homeBadge,
                          score: featuredLiveMatch.homeScore,
                        },
                        {
                          team: featuredLiveMatch.awayTeam,
                          badge: featuredLiveMatch.awayBadge,
                          score: featuredLiveMatch.awayScore,
                        },
                      ].map((entry) => (
                        <div
                          key={`${featuredLiveMatch.id}-${entry.team}`}
                          className="rounded-xl border border-white/10 bg-white/4 px-4 py-4"
                        >
                          <div className="flex items-center gap-3">
                            <SafeImage
                              src={entry.badge}
                              alt=""
                              className="h-12 w-12 shrink-0 object-contain"
                              fallbackClassName="inline-block h-12 w-12 rounded-full bg-white/10"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-base font-bold text-white">
                                {entry.team}
                              </p>
                              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-white/55">
                                {featuredLeagueName}
                              </p>
                            </div>
                            <div className="rounded-lg bg-black/35 px-3 py-2 text-2xl font-black text-white">
                              {entry.score}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>

              <div className="grid gap-3">
                {ADSTERRA_TOP_SLOT && (
                  <section className="ls-card overflow-hidden p-3">
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
                  </section>
                )}
                
                {/* Ezoic Sidebar Ad - Replace ID with actual Ezoic ID */}
                <EzoicAd id={101} />

                {/* Google AdSense Sidebar Ad */}
                {process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SIDEBAR_SLOT && (
                  <section className="ls-card overflow-hidden p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Sponsored
                      </p>
                      <span className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
                        AdSense
                      </span>
                    </div>
                    <GoogleAd 
                      slot={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SIDEBAR_SLOT} 
                      format="rectangle"
                    />
                  </section>
                )}

                {promoMatches.length === 0 ? (
                  <div className="ls-card flex min-h-[172px] items-center justify-center p-6 text-sm text-(--ls-muted)">
                    More featured matches will show here as live fixtures load.
                  </div>
                ) : (
                  promoMatches.map((match) => (
                    <MatchRailCard
                      key={`top-promo-${match.id}`}
                      match={match}
                    />
                  ))
                )}
              </div>
            </>
          ) : (
            <article className="ls-billboard min-h-[360px] flex items-center justify-center p-6 md:p-8 xl:col-span-2">
              <span className="ls-billboard-accent" />
              <div className="relative z-1 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 border border-white/10">
                  <PlayIcon />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white md:text-4xl">
                  No live matches right now
                </h1>
                <p className="mt-3 max-w-lg text-sm leading-6 text-white/55 md:text-base">
                  There are no matches currently in progress for the selected
                  sport and date. Check the upcoming rail below or change the
                  date to find more games.
                </p>
                <div className="mt-6 flex justify-center gap-2">
                  <button
                    onClick={() => setStatus("notstarted")}
                    className="ls-control ls-control-solid h-10 px-6 text-xs font-bold uppercase tracking-widest"
                  >
                    View Upcoming
                  </button>
                </div>
              </div>
            </article>
          )}
        </section>

        <section className="mb-3 space-y-3">
          <section className="ls-rail-shell p-4 md:p-5">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="mono-label text-[11px] uppercase tracking-[0.18em] text-(--ls-muted)">
                  Featured live
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-(--ls-text)">
                  Live events on now
                </h2>
              </div>
              <p className="hidden max-w-sm text-right text-sm leading-6 text-(--ls-muted) md:block">
                Big matches first, surfaced as a watch shelf instead of a
                utility list.
              </p>
            </div>
            <div className="ls-rail-track">
              {matchesSectionLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`live-rail-skeleton-${index}`}
                    className="h-[240px] w-[300px] shrink-0 animate-pulse rounded-2xl bg-(--ls-panel-alt) md:w-[348px]"
                  />
                ))
              ) : liveRailMatches.length === 0 ? (
                <div className="rounded-2xl border border-(--ls-border) bg-(--ls-panel-alt) px-4 py-6 text-sm text-(--ls-muted)">
                  No live matches are available in this rail yet.
                </div>
              ) : (
                liveRailMatches.map((match) => (
                  <MatchRailCard key={`rail-live-${match.id}`} match={match} />
                ))
              )}
            </div>
          </section>

          <section className="ls-rail-shell p-4 md:p-5">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="mono-label text-[11px] uppercase tracking-[0.18em] text-(--ls-muted)">
                  Coming up
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-(--ls-text)">
                  Scheduled next
                </h2>
              </div>
              <p className="hidden max-w-sm text-right text-sm leading-6 text-(--ls-muted) md:block">
                The next wave of fixtures, laid out like a content shelf.
              </p>
            </div>
            <div className="ls-rail-track">
              {matchesSectionLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`upcoming-rail-skeleton-${index}`}
                    className="h-[240px] w-[300px] shrink-0 animate-pulse rounded-2xl bg-(--ls-panel-alt) md:w-[348px]"
                  />
                ))
              ) : upcomingRailMatches.length === 0 ? (
                <div className="rounded-2xl border border-(--ls-border) bg-(--ls-panel-alt) px-4 py-6 text-sm text-(--ls-muted)">
                  No upcoming matches are available yet.
                </div>
              ) : (
                upcomingRailMatches.map((match) => (
                  <MatchRailCard
                    key={`rail-upcoming-${match.id}`}
                    match={match}
                  />
                ))
              )}
            </div>
          </section>
        </section>

        <div className="space-y-3">
          <section className="space-y-2.5">
            <section className="ls-section-shell p-3">
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
                      favoritesOnly ? "ls-control-solid" : "ls-control-muted"
                    }`}
                  >
                    {favoritesOnly ? "Favorites On" : "Favorites"}
                  </button>
                  <button
                    type="button"
                    onClick={togglePinnedOnly}
                    className={`ls-control inline-flex h-10 items-center px-4 text-sm font-semibold ${
                      pinnedOnly ? "ls-control-solid" : "ls-control-muted"
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

            <section className="ls-rail-shell p-4 md:p-5">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <p className="mono-label text-[11px] uppercase tracking-[0.18em] text-(--ls-muted)">
                    Editors&apos; picks
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-(--ls-text)">
                    More matches worth opening
                  </h2>
                </div>
                <p className="hidden max-w-sm text-right text-sm leading-6 text-(--ls-muted) md:block">
                  A tighter promotional shelf before the full schedule
                  underneath.
                </p>
              </div>
              <div className="ls-rail-track">
                {matchesSectionLoading
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={`marquee-skeleton-${index}`}
                        className="h-[240px] w-[300px] shrink-0 animate-pulse rounded-2xl bg-(--ls-panel-alt) md:w-[348px]"
                      />
                    ))
                  : displayMatches
                      .slice(0, 12)
                      .map((match) => (
                        <MatchRailCard
                          key={`marquee-${match.id}`}
                          match={match}
                        />
                      ))}
              </div>
            </section>

            {status !== "finished" && (
              <>
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
                      Match schedule
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
                  <p className="text-base font-bold text-slate-100">Next up</p>
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
