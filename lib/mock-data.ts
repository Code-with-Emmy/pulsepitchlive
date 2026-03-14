export function mockFetchSportSRC(params: Record<string, string | number | boolean | undefined>): unknown {
  const type = params.type;

  if (type === "sports") {
    return {
      success: true,
      data: [
        { id: "football", name: "Football" },
        { id: "basketball", name: "Basketball" },
        { id: "tennis", name: "Tennis" },
        { id: "hockey", name: "Ice Hockey" },
      ]
    };
  }

  if (type === "matches") {
    const status = params.status;
    const isLive = status === "inprogress" || status === "live" || status === "inplay";
    const isUpcoming = status === "notstarted";
    const isFinished = status === "finished";

    const baseTime = new Date().getTime();

    return {
      success: true,
      data: [
        {
          league: { name: "Premier League", logo: "https://crests.football-data.org/PL.png", flag: "https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg" },
          matches: [
            {
              match_id: `m-live-1`,
              status: isUpcoming ? "notstarted" : isFinished ? "finished" : "inprogress",
              status_detail: isLive ? "45'" : isFinished ? "FT" : undefined,
              home_team: "Arsenal",
              away_team: "Chelsea",
              home_score: isUpcoming ? "0" : "2",
              away_score: isUpcoming ? "0" : "1",
              home_badge: "https://crests.football-data.org/57.png",
              away_badge: "https://crests.football-data.org/61.png",
              start_time: new Date(baseTime + (isUpcoming ? 86400000 : isFinished ? -86400000 : -2700000)).toISOString()
            },
            {
              match_id: `m-live-2`,
              status: isUpcoming ? "notstarted" : isFinished ? "finished" : "inprogress",
              status_detail: isLive ? "12'" : isFinished ? "FT" : undefined,
              home_team: "Man City",
              away_team: "Liverpool",
              home_score: "0",
              away_score: "0",
              home_badge: "https://crests.football-data.org/65.png",
              away_badge: "https://crests.football-data.org/64.png",
              start_time: new Date(baseTime + (isUpcoming ? 90000000 : isFinished ? -90000000 : -720000)).toISOString()
            }
          ]
        },
        {
          league: { name: "La Liga", logo: "https://crests.football-data.org/PD.png", flag: "https://upload.wikimedia.org/wikipedia/en/9/9a/Flag_of_Spain.svg" },
          matches: [
            {
              match_id: `m-live-3`,
              status: isUpcoming ? "notstarted" : isFinished ? "finished" : "inprogress",
              status_detail: isLive ? "88'" : isFinished ? "FT" : undefined,
              home_team: "Real Madrid",
              away_team: "Barcelona",
              home_score: isUpcoming ? "0" : "3",
              away_score: isUpcoming ? "0" : "3",
              home_badge: "https://crests.football-data.org/86.png",
              away_badge: "https://crests.football-data.org/81.png",
              start_time: new Date(baseTime + (isUpcoming ? 86400000 : isFinished ? -86400000 : -5280000)).toISOString()
            }
          ]
        }
      ]
    };
  }

  if (type === "detail") {
    return {
      success: true,
      data: {
        match_info: {
          match_id: params.id || "mock-detail",
          status: "inprogress",
          status_detail: "45'",
          home_team: "Arsenal",
          away_team: "Chelsea",
          home_score: "2",
          away_score: "1",
          home_badge: "https://crests.football-data.org/57.png",
          away_badge: "https://crests.football-data.org/61.png",
          league: { name: "Premier League" },
          start_time: new Date().getTime() - 2700000,
          stadium: "Emirates Stadium",
          referee: "Michael Oliver"
        },
        info: {
           venue: { stadium: "Emirates Stadium", city: "London", country: "England" },
           referee: { name: "Michael Oliver" }
        },
        streams: [
          {
            id: "stream-mock-1",
            source: "Stream Source 1",
            language: "EN",
            url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
            hd: true
          },
          {
            id: "stream-mock-2",
            source: "Youtube (Iframe)",
            language: "ES",
            url: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
          }
        ]
      }
    };
  }

  return { success: true, data: [] };
}
