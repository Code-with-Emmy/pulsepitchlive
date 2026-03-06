import type { MatchDetailItem, MatchItem, SportItem, StreamSource } from "@/lib/types";

const FALLBACK_HOME = "Home";
const FALLBACK_AWAY = "Away";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return undefined;
}

function asUrl(value: unknown): string | undefined {
  const raw = asString(value);
  if (!raw) {
    return undefined;
  }

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }

  return undefined;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (isRecord(value)) {
    return value;
  }

  return undefined;
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  return [];
}

function findArray(payload: unknown, keys: string[]): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!isRecord(payload)) {
    return [];
  }

  for (const key of keys) {
    const value = payload[key];
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

function recordFromUnknown(value: unknown): Record<string, unknown> {
  if (isRecord(value)) {
    return value;
  }

  return {};
}

function pickId(record: Record<string, unknown>): string | undefined {
  // Prefer event/match identifiers because detail endpoints often expect these over generic row ids.
  const idKeys = ["match_id", "matchId", "event_id", "eventId", "game_id", "gameId", "id"];
  for (const key of idKeys) {
    const id = asString(record[key]);
    if (id) {
      return id;
    }
  }

  return undefined;
}

function leagueNameFromRecord(match: Record<string, unknown>): string | undefined {
  const leagueValue = match.league;

  if (typeof leagueValue === "string") {
    return leagueValue;
  }

  const leagueRecord = asRecord(leagueValue);
  if (leagueRecord) {
    return asString(leagueRecord.name) ?? asString(leagueRecord.title);
  }

  const nestedLeague = asRecord(match.__league);
  if (nestedLeague) {
    return asString(nestedLeague.name) ?? asString(nestedLeague.title);
  }

  return (
    asString(match.competition) ??
    asString(match.tournament) ??
    asString(match.category)
  );
}

function leagueMediaFromRecord(match: Record<string, unknown>): {
  logo?: string;
  flag?: string;
} {
  const leagueValue = asRecord(match.league) ?? asRecord(match.__league);
  if (!leagueValue) {
    return {};
  }

  return {
    logo: asUrl(leagueValue.logo),
    flag: asUrl(leagueValue.flag),
  };
}

function getTeamName(match: Record<string, unknown>, side: "home" | "away"): string {
  const teams = asRecord(match.teams);
  const sideTeam = teams ? asRecord(teams[side]) : undefined;

  const fromTeams = sideTeam
    ? asString(sideTeam.name) ?? asString(sideTeam.team_name) ?? asString(sideTeam.short_name)
    : undefined;

  if (fromTeams) {
    return fromTeams;
  }

  const teamKeys =
    side === "home"
      ? ["home_team", "homeTeam", "team1", "home", "localteam"]
      : ["away_team", "awayTeam", "team2", "away", "visitorteam"];

  for (const key of teamKeys) {
    const value = match[key];
    const text = asString(value);
    if (text) {
      return text;
    }

    const nested = asRecord(value);
    if (nested) {
      const nestedText =
        asString(nested.name) ?? asString(nested.team_name) ?? asString(nested.short_name);
      if (nestedText) {
        return nestedText;
      }
    }
  }

  return side === "home" ? FALLBACK_HOME : FALLBACK_AWAY;
}

function getTeamBadge(match: Record<string, unknown>, side: "home" | "away"): string | undefined {
  const teams = asRecord(match.teams);
  const sideTeam = teams ? asRecord(teams[side]) : undefined;
  const badge = sideTeam ? asUrl(sideTeam.badge) ?? asUrl(sideTeam.logo) : undefined;
  if (badge) {
    return badge;
  }

  const fallbackKeys = side === "home" ? ["home_badge", "home_logo"] : ["away_badge", "away_logo"];
  for (const key of fallbackKeys) {
    const value = asUrl(match[key]);
    if (value) {
      return value;
    }
  }

  return undefined;
}

function getScore(match: Record<string, unknown>, side: "home" | "away"): string {
  const score = asRecord(match.score);
  const current = score ? asRecord(score.current) : undefined;

  const currentValue = side === "home" ? current?.home : current?.away;
  const fromCurrent = asString(currentValue);
  if (fromCurrent) {
    return fromCurrent;
  }

  const scoreKeys =
    side === "home"
      ? ["home_score", "homeScore", "score1", "goals_home", "home_goals"]
      : ["away_score", "awayScore", "score2", "goals_away", "away_goals"];

  for (const key of scoreKeys) {
    const value = asString(match[key]);
    if (value) {
      return value;
    }
  }

  if (score) {
    const fallback = side === "home" ? asString(score.home) : asString(score.away);
    if (fallback) {
      return fallback;
    }

    const display = asString(score.display);
    if (display && display.includes("-")) {
      const [left, right] = display.split("-").map((item) => item.trim());
      return side === "home" ? left || "-" : right || "-";
    }
  }

  return "-";
}

function normalizeStatus(value: unknown): string {
  const raw = asString(value)?.toLowerCase();
  if (!raw) {
    return "unknown";
  }

  if (raw.includes("progress") || raw === "live" || raw === "inplay") {
    return "inprogress";
  }

  if (raw.includes("finish") || raw === "ended" || raw === "fulltime") {
    return "finished";
  }

  if (raw.includes("start") || raw.includes("sched") || raw === "upcoming") {
    return "notstarted";
  }

  return raw;
}

function normalizeStartTime(match: Record<string, unknown>): string | undefined {
  const timestamp = match.timestamp;
  if (typeof timestamp === "number" && Number.isFinite(timestamp)) {
    return new Date(timestamp).toISOString();
  }

  if (typeof timestamp === "string" && /^\d+$/.test(timestamp)) {
    const parsed = Number(timestamp);
    if (Number.isFinite(parsed)) {
      return new Date(parsed).toISOString();
    }
  }

  return (
    asString(match.time) ??
    asString(match.date) ??
    asString(match.start_time) ??
    asString(match.startTime)
  );
}

function flattenSportsrcLeagueData(payload: unknown): Record<string, unknown>[] {
  const root = recordFromUnknown(payload);
  const data = asArray(root.data);

  const flattened: Record<string, unknown>[] = [];

  for (const row of data) {
    const leagueRow = asRecord(row);
    if (!leagueRow) {
      continue;
    }

    const league = asRecord(leagueRow.league);
    const matches = asArray(leagueRow.matches);

    for (const item of matches) {
      const match = asRecord(item);
      if (!match) {
        continue;
      }

      flattened.push({
        ...match,
        __league: league,
      });
    }
  }

  return flattened;
}

function normalizeMatchRecord(record: Record<string, unknown>): MatchItem | null {
  const id = pickId(record);
  if (!id) {
    return null;
  }

  const leagueMedia = leagueMediaFromRecord(record);

  return {
    id,
    sport: asString(record.sport),
    homeTeam: getTeamName(record, "home"),
    awayTeam: getTeamName(record, "away"),
    homeBadge: getTeamBadge(record, "home"),
    awayBadge: getTeamBadge(record, "away"),
    homeScore: getScore(record, "home"),
    awayScore: getScore(record, "away"),
    status: normalizeStatus(record.status ?? record.state),
    statusDetail:
      asString(record.status_detail) ??
      asString(record.match_status) ??
      asString(record.minute) ??
      asString(record.time_status),
    league: leagueNameFromRecord(record),
    leagueLogo: leagueMedia.logo,
    leagueFlag: leagueMedia.flag,
    startTime: normalizeStartTime(record),
    raw: record,
  };
}

function toStreamSource(item: unknown, index: number): StreamSource | null {
  if (typeof item === "string") {
    const url = asString(item);
    if (!url) {
      return null;
    }

    return {
      id: `stream-${index}`,
      label: `Source ${index + 1}`,
      url,
    };
  }

  const record = asRecord(item);
  if (!record) {
    return null;
  }

  const url =
    asString(record.url) ??
    asString(record.link) ??
    asString(record.src) ??
    asString(record.embed) ??
    asString(record.embedUrl) ??
    asString(record.iframe) ??
    asString(record.stream_url);

  if (!url) {
    return null;
  }

  const label =
    asString(record.name) ??
    asString(record.label) ??
    asString(record.source) ??
    asString(record.language) ??
    `Source ${index + 1}`;

  const id = asString(record.id) ?? `stream-${index}`;
  const source = asString(record.source);
  const language = asString(record.language);
  const hdRaw = record.hd;
  const hd = typeof hdRaw === "boolean" ? hdRaw : asString(hdRaw) === "true";

  return { id, label, url, source, language, hd };
}

function collectStreams(
  detail: Record<string, unknown>,
  parent?: Record<string, unknown>,
): StreamSource[] {
  const streamKeys = ["streams", "sources", "links", "channels", "streams_list"];

  const candidates = [detail, parent].filter(Boolean) as Record<string, unknown>[];

  const fromArrays = candidates.flatMap((source) =>
    streamKeys.flatMap((key) =>
      asArray(source[key])
        .map((entry, index) => toStreamSource(entry, index))
        .filter(Boolean) as StreamSource[],
    ),
  );

  const direct = [detail.stream, detail.stream_url, detail.embed, detail.iframe]
    .map((entry, index) => toStreamSource(entry, index))
    .filter(Boolean) as StreamSource[];

  return [...fromArrays, ...direct].filter(
    (item, index, arr) => arr.findIndex((candidate) => candidate.url === item.url) === index,
  );
}

export function normalizeSports(payload: unknown): SportItem[] {
  const rows = findArray(payload, ["sports", "data", "result", "items"]);

  const mapped = rows
    .map((row) => {
      const record = asRecord(row);
      if (!record) {
        return null;
      }

      const name =
        asString(record.name) ??
        asString(record.sport) ??
        asString(record.title) ??
        asString(record.slug) ??
        asString(record.id);

      if (!name) {
        return null;
      }

      const id =
        asString(record.id) ?? asString(record.sport) ?? asString(record.slug) ?? name.toLowerCase();

      return {
        id: id.toLowerCase(),
        name,
      };
    })
    .filter(Boolean) as SportItem[];

  return mapped.filter(
    (item, index, arr) => arr.findIndex((candidate) => candidate.id === item.id) === index,
  );
}

export function normalizeMatches(payload: unknown): MatchItem[] {
  const flattened = flattenSportsrcLeagueData(payload);

  const rows =
    flattened.length > 0
      ? flattened
      : findArray(payload, ["matches", "data", "result", "events", "items"])
          .map((row) => asRecord(row))
          .filter(Boolean) as Record<string, unknown>[];

  return rows
    .map((row) => normalizeMatchRecord(row))
    .filter(Boolean) as MatchItem[];
}

export function normalizeMatchDetail(payload: unknown): MatchDetailItem | null {
  const root = recordFromUnknown(payload);
  const rootData = asRecord(root.data);

  const detail =
    asRecord(rootData?.match_info) ??
    asRecord(root.match_info) ??
    asRecord(root.detail) ??
    asRecord(root.match) ??
    asRecord(root.data) ??
    asRecord(root.result) ??
    root;

  const baseMatch = normalizeMatchRecord(detail);
  if (!baseMatch) {
    return null;
  }

  const info = asRecord(rootData?.info) ?? asRecord(root.info);
  const venue = asRecord(info?.venue);
  const referee = asRecord(info?.referee);
  const league = asRecord(detail.league);

  const meta: Record<string, string> = {};
  const candidates: Array<[string, unknown]> = [
    ["stadium", venue?.stadium ?? detail.stadium ?? detail.venue],
    ["city", venue?.city],
    ["country", venue?.country ?? league?.country ?? detail.country],
    ["referee", referee?.name ?? detail.referee],
    ["season", league?.season ?? detail.season],
    ["round", league?.round ?? detail.round],
    ["kickoff", detail.timestamp ?? detail.time ?? detail.start_time],
  ];

  for (const [key, value] of candidates) {
    const parsed = asString(value);
    if (parsed) {
      meta[key] = parsed;
    }
  }

  return {
    ...baseMatch,
    streams: collectStreams(detail, rootData ?? root),
    meta,
  };
}
