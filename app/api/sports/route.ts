import { NextResponse } from "next/server";
import { fetchSportSRC, parseSportSRCError } from "@/lib/sportsrc";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const rateLimit = checkRateLimit(request, {
    route: "api:sports",
    max: 30,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Too many requests. Please retry shortly.",
      },
      {
        status: 429,
        headers: rateLimitHeaders(rateLimit),
      },
    );
  }

  try {
    const data = await fetchSportSRC<unknown>({ type: "sports" }, 3600);
    return NextResponse.json(data, {
      headers: rateLimitHeaders(rateLimit),
    });
  } catch (error) {
    const parsed = parseSportSRCError(error);
    return NextResponse.json(
      {
        error: parsed.message,
        detail: parsed.detail,
      },
      {
        status: parsed.status,
        headers: rateLimitHeaders(rateLimit),
      },
    );
  }
}
