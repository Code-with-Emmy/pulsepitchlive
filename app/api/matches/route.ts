import { NextResponse } from "next/server";
import { SportSRCError, fetchSportSRC, parseSportSRCError } from "@/lib/sportsrc";
import { normalizeMatches } from "@/lib/normalize";
import type { MatchStatus } from "@/lib/types";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";

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
  const rateLimit = checkRateLimit(request, {
    route: "api:matches",
    max: 60,
    windowMs: 60_000,
  });
  const respond = (body: unknown, status = 200) =>
    NextResponse.json(body, {
      status,
      headers: rateLimitHeaders(rateLimit),
    });

  if (!rateLimit.allowed) {
    return respond(
      {
        error: "Too many requests. Please retry shortly.",
      },
      429,
    );
  }

  const { searchParams } = new URL(request.url);
  const sport = searchParams.get("sport")?.trim();
  const status = searchParams.get("status")?.trim() as MatchStatus | null;
  const date = searchParams.get("date")?.trim();

  if (!sport || !status || !date) {
    return respond(
      {
        error: "Missing required query params: sport, status, date",
      },
      400,
    );
  }

  if (!ALLOWED_STATUSES.includes(status)) {
    return respond(
      {
        error: "Invalid status value",
      },
      400,
    );
  }

  try {
    if (status !== "inprogress") {
      const cacheWindow = status === "notstarted" ? 60 : 120;
      const data = await fetchSportSRC<unknown>(
        {
          type: "matches",
          sport,
          status,
          date,
        },
        cacheWindow,
      );

      return respond(data);
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
          return respond(payload);
        }
      } catch (error) {
        if (error instanceof SportSRCError && error.status === 429) {
          throw error;
        }

        // Continue through fallbacks for live feed resilience.
      }
    }

    return respond(latestPayload);
  } catch (error) {
    const parsed = parseSportSRCError(error);
    return respond(
      {
        error: parsed.message,
        detail: parsed.detail,
      },
      parsed.status,
    );
  }
}
