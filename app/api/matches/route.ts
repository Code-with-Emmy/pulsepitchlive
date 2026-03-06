import { NextResponse } from "next/server";
import { fetchSportSRC, parseSportSRCError } from "@/lib/sportsrc";
import { normalizeMatches } from "@/lib/normalize";
import type { MatchStatus } from "@/lib/types";

const ALLOWED_STATUSES: MatchStatus[] = ["inprogress", "notstarted", "finished"];

function normalizeLiveOnlyPayload(payload: unknown): unknown {
  const liveOnlyRaw = normalizeMatches(payload)
    .filter((item) => item.status === "inprogress")
    .map((item) => item.raw);

  return {
    matches: liveOnlyRaw,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get("sport")?.trim();
  const status = searchParams.get("status")?.trim() as MatchStatus | null;
  const date = searchParams.get("date")?.trim();

  if (!sport || !status || !date) {
    return NextResponse.json(
      {
        error: "Missing required query params: sport, status, date",
      },
      { status: 400 },
    );
  }

  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json(
      {
        error: "Invalid status value",
      },
      { status: 400 },
    );
  }

  try {
    if (status !== "inprogress") {
      const data = await fetchSportSRC<unknown>(
        {
          type: "matches",
          sport,
          status,
          date,
        },
        15,
      );

      return NextResponse.json(data);
    }

    const attempts: Array<{
      params: Record<string, string>;
      liveOnly?: boolean;
    }> = [
      {
        params: { type: "matches", sport, status: "inprogress", date },
      },
      {
        params: { type: "matches", sport, status: "live", date },
      },
      {
        params: { type: "matches", sport, status: "inplay", date },
      },
      {
        params: { type: "matches", sport, date },
        liveOnly: true,
      },
    ];

    let latestPayload: unknown = { matches: [] };
    for (const attempt of attempts) {
      try {
        const data = await fetchSportSRC<unknown>(attempt.params, 15);
        const payload = attempt.liveOnly ? normalizeLiveOnlyPayload(data) : data;
        latestPayload = payload;

        if (normalizeMatches(payload).length > 0) {
          return NextResponse.json(payload);
        }
      } catch {
        // Continue through fallbacks for live feed resilience.
      }
    }

    return NextResponse.json(latestPayload);
  } catch (error) {
    const parsed = parseSportSRCError(error);
    return NextResponse.json(
      {
        error: parsed.message,
        detail: parsed.detail,
      },
      { status: parsed.status },
    );
  }
}
