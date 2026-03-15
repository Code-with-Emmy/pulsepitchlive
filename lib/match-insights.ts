import type { MatchDetailItem, MatchItem } from "@/lib/types";

interface TeamLineup {
  teamName: string;
  formation: string;
  lines: Array<{
    label: string;
    players: string[];
  }>;
}

interface MatchStat {
  label: string;
  homeValue: number;
  awayValue: number;
  homeDisplay: string;
  awayDisplay: string;
}

interface MatchIncident {
  minute: string;
  team: "home" | "away" | "neutral";
  type: string;
  text: string;
}

interface FormMarker {
  label: "W" | "D" | "L";
  colorClass: string;
}

interface StandingsRow {
  team: string;
  played: number;
  goalDiff: number;
  points: number;
  highlight: boolean;
}

export interface MatchInsights {
  lineups: {
    home: TeamLineup;
    away: TeamLineup;
  };
  stats: MatchStat[];
  incidents: MatchIncident[];
  form: {
    home: FormMarker[];
    away: FormMarker[];
    h2hSummary: string;
  };
  standings: {
    league: string;
    rows: StandingsRow[];
  };
  momentum: number[];
}

const PLAYER_POOL = [
  "Onana",
  "White",
  "Silva",
  "Araujo",
  "Hakimi",
  "Rice",
  "Odegaard",
  "Valverde",
  "Pedri",
  "Saka",
  "Rashford",
  "Mbappe",
  "Kane",
  "Bellingham",
  "Bruno",
  "Salah",
  "Martinelli",
  "Palmer",
  "Rodri",
  "Musiala",
  "Vitinha",
  "Leao",
  "Osimhen",
  "Son",
  "Maddison",
  "Isak",
  "Saliba",
  "Bastoni",
  "Theo",
  "Walker",
  "Gyokeres",
  "Kudus",
];

const FORMATIONS = ["4-3-3", "4-2-3-1", "3-4-2-1", "4-4-2", "3-5-2"];

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function seeded(seed: string, min: number, max: number): number {
  const hash = hashString(seed);
  return min + (hash % (max - min + 1));
}

function parseScore(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function extractMinute(detail: MatchDetailItem): number {
  const raw = detail.statusDetail ?? "";
  const normalized = raw.toLowerCase();

  if (normalized.includes("ht")) {
    return 45;
  }

  if (normalized.includes("ft")) {
    return 90;
  }

  const parsed = Number.parseInt(raw, 10);
  if (Number.isFinite(parsed)) {
    return parsed;
  }

  if (detail.status === "finished") {
    return 90;
  }

  if (detail.status === "notstarted") {
    return 0;
  }

  return 35;
}

function pickFormation(teamName: string): string {
  return FORMATIONS[hashString(teamName) % FORMATIONS.length];
}

function uniquePlayers(teamName: string, total: number): string[] {
  const base = hashString(teamName);
  const players: string[] = [];
  let offset = 0;

  while (players.length < total) {
    const player = PLAYER_POOL[(base + offset * 5) % PLAYER_POOL.length];
    if (!players.includes(player)) {
      players.push(player);
    }
    offset += 1;
  }

  return players;
}

function formationLabels(counts: number[]): string[] {
  if (counts.length === 3) {
    return ["DEF", "MID", "ATT"];
  }

  if (counts.length === 4) {
    return ["DEF", "DM", "AM", "ATT"];
  }

  return counts.map((_, index) => `LINE ${index + 1}`);
}

function buildLineup(teamName: string): TeamLineup {
  const formation = pickFormation(teamName);
  const counts = formation.split("-").map(Number);
  const players = uniquePlayers(teamName, 1 + counts.reduce((sum, value) => sum + value, 0));
  const labels = formationLabels(counts);
  let cursor = 1;

  return {
    teamName,
    formation,
    lines: [
      { label: "GK", players: [players[0]] },
      ...counts.map((count, index) => {
        const linePlayers = players.slice(cursor, cursor + count);
        cursor += count;
        return {
          label: labels[index],
          players: linePlayers,
        };
      }),
    ],
  };
}

function buildStats(detail: MatchDetailItem): MatchStat[] {
  const homeGoals = parseScore(detail.homeScore);
  const awayGoals = parseScore(detail.awayScore);
  const minute = extractMinute(detail);
  const seedBase = `${detail.id}:${detail.homeTeam}:${detail.awayTeam}`;

  const homeXg = Number((homeGoals + 0.6 + seeded(`${seedBase}:hxg`, 0, 12) / 10).toFixed(1));
  const awayXg = Number((awayGoals + 0.5 + seeded(`${seedBase}:axg`, 0, 11) / 10).toFixed(1));
  const homeShots = Math.max(homeGoals + 4, seeded(`${seedBase}:hshots`, 7, 19));
  const awayShots = Math.max(awayGoals + 4, seeded(`${seedBase}:ashots`, 6, 17));
  const homePossession = seeded(`${seedBase}:pos`, 44, 58);
  const awayPossession = 100 - homePossession;
  const homeCorners = seeded(`${seedBase}:hcorners`, 2, 9);
  const awayCorners = seeded(`${seedBase}:acorners`, 2, 8);
  const homeAttacks = seeded(`${seedBase}:hattacks`, 38, 74) + Math.floor(minute / 4);
  const awayAttacks = seeded(`${seedBase}:aattacks`, 34, 70) + Math.floor(minute / 4);

  return [
    {
      label: "xG",
      homeValue: homeXg,
      awayValue: awayXg,
      homeDisplay: homeXg.toFixed(1),
      awayDisplay: awayXg.toFixed(1),
    },
    {
      label: "Shots",
      homeValue: homeShots,
      awayValue: awayShots,
      homeDisplay: String(homeShots),
      awayDisplay: String(awayShots),
    },
    {
      label: "Possession",
      homeValue: homePossession,
      awayValue: awayPossession,
      homeDisplay: `${homePossession}%`,
      awayDisplay: `${awayPossession}%`,
    },
    {
      label: "Corners",
      homeValue: homeCorners,
      awayValue: awayCorners,
      homeDisplay: String(homeCorners),
      awayDisplay: String(awayCorners),
    },
    {
      label: "Dangerous Attacks",
      homeValue: homeAttacks,
      awayValue: awayAttacks,
      homeDisplay: String(homeAttacks),
      awayDisplay: String(awayAttacks),
    },
  ];
}

function buildIncidents(detail: MatchDetailItem): MatchIncident[] {
  const homeGoals = parseScore(detail.homeScore);
  const awayGoals = parseScore(detail.awayScore);
  const minute = extractMinute(detail);
  const incidents: MatchIncident[] = [
    {
      minute: "1'",
      team: "neutral",
      type: "Kickoff",
      text: `${detail.homeTeam} vs ${detail.awayTeam} started`,
    },
  ];

  for (let index = 0; index < homeGoals; index += 1) {
    incidents.push({
      minute: `${12 + index * 19}'`,
      team: "home",
      type: "Goal",
      text: `${detail.homeTeam} found the net`,
    });
  }

  for (let index = 0; index < awayGoals; index += 1) {
    incidents.push({
      minute: `${18 + index * 21}'`,
      team: "away",
      type: "Goal",
      text: `${detail.awayTeam} converted a chance`,
    });
  }

  incidents.push({
    minute: `${Math.min(Math.max(minute, 28), 83)}'`,
    team: homeGoals >= awayGoals ? "away" : "home",
    type: "Yellow Card",
    text: "Tactical foul stops a break",
  });

  incidents.push({
    minute: `${Math.min(Math.max(minute + 2, 36), 89)}'`,
    team: "neutral",
    type: "Update",
    text: detail.statusDetail ?? "Match still in progress",
  });

  return incidents.sort(
    (left, right) =>
      Number.parseInt(left.minute, 10) - Number.parseInt(right.minute, 10),
  );
}

function formMarker(seed: string, index: number): FormMarker {
  const value = seeded(`${seed}:${index}`, 0, 2);
  if (value === 0) {
    return { label: "W", colorClass: "bg-emerald-500/20 text-emerald-300" };
  }
  if (value === 1) {
    return { label: "D", colorClass: "bg-amber-500/20 text-amber-300" };
  }

  return { label: "L", colorClass: "bg-rose-500/20 text-rose-300" };
}

function buildForm(detail: MatchDetailItem) {
  const home = Array.from({ length: 5 }, (_, index) =>
    formMarker(`${detail.homeTeam}:form`, index),
  );
  const away = Array.from({ length: 5 }, (_, index) =>
    formMarker(`${detail.awayTeam}:form`, index),
  );

  const homeWins = seeded(`${detail.id}:h2h-home`, 1, 4);
  const awayWins = seeded(`${detail.id}:h2h-away`, 1, 3);
  const draws = seeded(`${detail.id}:h2h-draw`, 0, 2);

  return {
    home,
    away,
    h2hSummary: `Last ${homeWins + awayWins + draws} meetings: ${detail.homeTeam} ${homeWins} wins, ${detail.awayTeam} ${awayWins} wins, ${draws} draws.`,
  };
}

function buildStandings(detail: MatchDetailItem, relatedMatches: MatchItem[]) {
  const league = detail.league ?? "League";
  const teamPool = new Set<string>([detail.homeTeam, detail.awayTeam]);

  relatedMatches.forEach((match) => {
    if ((match.league ?? "") === league || teamPool.size < 8) {
      teamPool.add(match.homeTeam);
      teamPool.add(match.awayTeam);
    }
  });

  const rows = Array.from(teamPool)
    .slice(0, 8)
    .map((team) => {
      const points = seeded(`${league}:${team}:pts`, 18, 68);
      const played = seeded(`${league}:${team}:pld`, 10, 28);
      const goalDiff = seeded(`${league}:${team}:gd`, -8, 29);
      const highlight = team === detail.homeTeam || team === detail.awayTeam;

      return {
        team,
        played,
        goalDiff,
        points,
        highlight,
      };
    })
    .sort((left, right) => {
      if (right.points !== left.points) {
        return right.points - left.points;
      }

      return right.goalDiff - left.goalDiff;
    })
    .slice(0, 6);

  return { league, rows };
}

function buildMomentum(detail: MatchDetailItem): number[] {
  const homeGoals = parseScore(detail.homeScore);
  const awayGoals = parseScore(detail.awayScore);
  const balance = (homeGoals - awayGoals) * 6;
  const seedBase = `${detail.id}:momentum`;

  return Array.from({ length: 14 }, (_, index) => {
    const wave = seeded(`${seedBase}:${index}`, 18, 82);
    const adjusted = Math.max(10, Math.min(90, wave + balance));
    return adjusted;
  });
}

export function buildMatchInsights(
  detail: MatchDetailItem,
  relatedMatches: MatchItem[],
): MatchInsights {
  return {
    lineups: {
      home: buildLineup(detail.homeTeam),
      away: buildLineup(detail.awayTeam),
    },
    stats: buildStats(detail),
    incidents: buildIncidents(detail),
    form: buildForm(detail),
    standings: buildStandings(detail, relatedMatches),
    momentum: buildMomentum(detail),
  };
}
