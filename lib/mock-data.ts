type MockParams = Record<string, string | number | boolean | undefined>;

interface MockFixture {
  id: string;
  league: {
    name: string;
    logo: string;
    flag: string;
  };
  homeTeam: string;
  awayTeam: string;
  homeBadge: string;
  awayBadge: string;
  liveMinute: string;
  liveScore: [string, string];
}

const MOCK_FIXTURES: MockFixture[] = [
  {
    id: "pl-ars-che",
    league: {
      name: "Premier League",
      logo: "https://crests.football-data.org/PL.png",
      flag: "https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg",
    },
    homeTeam: "Arsenal",
    awayTeam: "Chelsea",
    homeBadge: "https://crests.football-data.org/57.png",
    awayBadge: "https://crests.football-data.org/61.png",
    liveMinute: "45'",
    liveScore: ["2", "1"],
  },
  {
    id: "pl-mci-liv",
    league: {
      name: "Premier League",
      logo: "https://crests.football-data.org/PL.png",
      flag: "https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg",
    },
    homeTeam: "Man City",
    awayTeam: "Liverpool",
    homeBadge: "https://crests.football-data.org/65.png",
    awayBadge: "https://crests.football-data.org/64.png",
    liveMinute: "12'",
    liveScore: ["0", "0"],
  },
  {
    id: "pl-mun-tot",
    league: {
      name: "Premier League",
      logo: "https://crests.football-data.org/PL.png",
      flag: "https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg",
    },
    homeTeam: "Manchester United",
    awayTeam: "Tottenham",
    homeBadge: "https://crests.football-data.org/66.png",
    awayBadge: "https://crests.football-data.org/73.png",
    liveMinute: "63'",
    liveScore: ["1", "2"],
  },
  {
    id: "lal-rma-bar",
    league: {
      name: "La Liga",
      logo: "https://crests.football-data.org/PD.png",
      flag: "https://upload.wikimedia.org/wikipedia/en/9/9a/Flag_of_Spain.svg",
    },
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    homeBadge: "https://crests.football-data.org/86.png",
    awayBadge: "https://crests.football-data.org/81.png",
    liveMinute: "88'",
    liveScore: ["3", "3"],
  },
  {
    id: "lal-atm-sev",
    league: {
      name: "La Liga",
      logo: "https://crests.football-data.org/PD.png",
      flag: "https://upload.wikimedia.org/wikipedia/en/9/9a/Flag_of_Spain.svg",
    },
    homeTeam: "Atletico Madrid",
    awayTeam: "Sevilla",
    homeBadge: "https://crests.football-data.org/78.png",
    awayBadge: "https://crests.football-data.org/559.png",
    liveMinute: "30'",
    liveScore: ["1", "0"],
  },
  {
    id: "sa-int-mil",
    league: {
      name: "Serie A",
      logo: "https://crests.football-data.org/SA.png",
      flag: "https://upload.wikimedia.org/wikipedia/en/0/03/Flag_of_Italy.svg",
    },
    homeTeam: "Inter",
    awayTeam: "Milan",
    homeBadge: "https://crests.football-data.org/108.png",
    awayBadge: "https://crests.football-data.org/98.png",
    liveMinute: "55'",
    liveScore: ["2", "2"],
  },
  {
    id: "sa-nap-juv",
    league: {
      name: "Serie A",
      logo: "https://crests.football-data.org/SA.png",
      flag: "https://upload.wikimedia.org/wikipedia/en/0/03/Flag_of_Italy.svg",
    },
    homeTeam: "Napoli",
    awayTeam: "Juventus",
    homeBadge: "https://crests.football-data.org/113.png",
    awayBadge: "https://crests.football-data.org/109.png",
    liveMinute: "67'",
    liveScore: ["1", "1"],
  },
  {
    id: "bl-bay-dor",
    league: {
      name: "Bundesliga",
      logo: "https://crests.football-data.org/BL1.png",
      flag: "https://upload.wikimedia.org/wikipedia/en/b/ba/Flag_of_Germany.svg",
    },
    homeTeam: "Bayern Munich",
    awayTeam: "Dortmund",
    homeBadge: "https://crests.football-data.org/5.png",
    awayBadge: "https://crests.football-data.org/4.png",
    liveMinute: "76'",
    liveScore: ["4", "2"],
  },
  {
    id: "bl-rbl-lev",
    league: {
      name: "Bundesliga",
      logo: "https://crests.football-data.org/BL1.png",
      flag: "https://upload.wikimedia.org/wikipedia/en/b/ba/Flag_of_Germany.svg",
    },
    homeTeam: "RB Leipzig",
    awayTeam: "Leverkusen",
    homeBadge: "https://crests.football-data.org/721.png",
    awayBadge: "https://crests.football-data.org/3.png",
    liveMinute: "24'",
    liveScore: ["0", "1"],
  },
  {
    id: "ucl-psg-ben",
    league: {
      name: "Champions League",
      logo: "https://crests.football-data.org/CL.png",
      flag: "https://upload.wikimedia.org/wikipedia/commons/b/b7/Flag_of_Europe.svg",
    },
    homeTeam: "PSG",
    awayTeam: "Benfica",
    homeBadge: "https://crests.football-data.org/524.png",
    awayBadge: "https://crests.football-data.org/1903.png",
    liveMinute: "19'",
    liveScore: ["1", "0"],
  },
  {
    id: "ucl-ars-bay",
    league: {
      name: "Champions League",
      logo: "https://crests.football-data.org/CL.png",
      flag: "https://upload.wikimedia.org/wikipedia/commons/b/b7/Flag_of_Europe.svg",
    },
    homeTeam: "Bayer Leverkusen",
    awayTeam: "Arsenal",
    homeBadge: "https://crests.football-data.org/3.png",
    awayBadge: "https://crests.football-data.org/57.png",
    liveMinute: "HT",
    liveScore: ["0", "2"],
  },
];

function groupFixturesByLeague(
  fixtures: Array<{
    id: string;
    status: string;
    statusDetail?: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: string;
    awayScore: string;
    homeBadge: string;
    awayBadge: string;
    startTime: string;
    league: MockFixture["league"];
  }>,
) {
  const leagueMap = new Map<
    string,
    {
      league: MockFixture["league"];
      matches: Array<Record<string, string | undefined>>;
    }
  >();

  for (const fixture of fixtures) {
    const currentLeague = leagueMap.get(fixture.league.name) ?? {
      league: fixture.league,
      matches: [],
    };

    currentLeague.matches.push({
      match_id: fixture.id,
      status: fixture.status,
      status_detail: fixture.statusDetail,
      home_team: fixture.homeTeam,
      away_team: fixture.awayTeam,
      home_score: fixture.homeScore,
      away_score: fixture.awayScore,
      home_badge: fixture.homeBadge,
      away_badge: fixture.awayBadge,
      start_time: fixture.startTime,
    });

    leagueMap.set(fixture.league.name, currentLeague);
  }

  return Array.from(leagueMap.values()).map((entry) => ({
    league: entry.league,
    matches: entry.matches,
  }));
}

function buildMockMatches(status: string | undefined) {
  const now = Date.now();
  const normalizedStatus = status ?? "inprogress";

  const fixtures = MOCK_FIXTURES.map((fixture, index) => {
    if (normalizedStatus === "notstarted") {
      return {
        ...fixture,
        status: "notstarted",
        statusDetail: undefined,
        homeScore: "0",
        awayScore: "0",
        startTime: new Date(now + (index + 1) * 45 * 60 * 1000).toISOString(),
      };
    }

    if (normalizedStatus === "finished") {
      return {
        ...fixture,
        status: "finished",
        statusDetail: "FT",
        homeScore: fixture.liveScore[0],
        awayScore: fixture.liveScore[1],
        startTime: new Date(now - (index + 2) * 90 * 60 * 1000).toISOString(),
      };
    }

    return {
      ...fixture,
      status: "inprogress",
      statusDetail: fixture.liveMinute,
      homeScore: fixture.liveScore[0],
      awayScore: fixture.liveScore[1],
      startTime: new Date(now - (index + 1) * 12 * 60 * 1000).toISOString(),
    };
  });

  return {
    success: true,
    data: groupFixturesByLeague(fixtures),
  };
}

function buildMockDetail(id: string | undefined) {
  const fixture =
    MOCK_FIXTURES.find((item) => item.id === id) ?? MOCK_FIXTURES[0];

  return {
    success: true,
    data: {
      match_info: {
        match_id: fixture.id,
        status: "inprogress",
        status_detail: fixture.liveMinute,
        home_team: fixture.homeTeam,
        away_team: fixture.awayTeam,
        home_score: fixture.liveScore[0],
        away_score: fixture.liveScore[1],
        home_badge: fixture.homeBadge,
        away_badge: fixture.awayBadge,
        league: {
          name: fixture.league.name,
          logo: fixture.league.logo,
          flag: fixture.league.flag,
        },
        start_time: Date.now() - 45 * 60 * 1000,
        stadium: "Mock Arena",
        referee: "Demo Referee",
      },
      info: {
        venue: {
          stadium: "Mock Arena",
          city: "Lagos",
          country: "Nigeria",
        },
        referee: { name: "Demo Referee" },
      },
      streams: [
        {
          id: `${fixture.id}-stream-1`,
          source: "Stream Source 1",
          language: "EN",
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
          hd: true,
        },
        {
          id: `${fixture.id}-stream-2`,
          source: "YouTube Mirror",
          language: "ES",
          url: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
        },
      ],
    },
  };
}

export function mockFetchSportSRC(params: MockParams): unknown {
  const type = params.type;

  if (type === "sports") {
    return {
      success: true,
      data: [
        { id: "football", name: "Football" },
        { id: "basketball", name: "Basketball" },
        { id: "tennis", name: "Tennis" },
        { id: "hockey", name: "Ice Hockey" },
      ],
    };
  }

  if (type === "matches") {
    return buildMockMatches(
      typeof params.status === "string" ? params.status : undefined,
    );
  }

  if (type === "detail") {
    return buildMockDetail(
      typeof params.id === "string" ? params.id : undefined,
    );
  }

  return { success: true, data: [] };
}
