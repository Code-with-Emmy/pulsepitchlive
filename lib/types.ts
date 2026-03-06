export type MatchStatus = "inprogress" | "notstarted" | "finished";

export interface SportItem {
  id: string;
  name: string;
}

export interface MatchItem {
  id: string;
  sport?: string;
  homeTeam: string;
  awayTeam: string;
  homeBadge?: string;
  awayBadge?: string;
  homeScore: string;
  awayScore: string;
  status: string;
  statusDetail?: string;
  league?: string;
  leagueLogo?: string;
  leagueFlag?: string;
  startTime?: string;
  raw: Record<string, unknown>;
}

export interface StreamSource {
  id: string;
  label: string;
  url: string;
  source?: string;
  language?: string;
  hd?: boolean;
}

export interface MatchDetailItem extends MatchItem {
  streams: StreamSource[];
  meta: Record<string, string>;
}
