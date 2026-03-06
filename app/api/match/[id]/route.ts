import { NextResponse } from "next/server";
import { SportSRCError, fetchSportSRC, parseSportSRCError } from "@/lib/sportsrc";

type DetailParams =
  | { type: "detail"; id: string }
  | { type: "detail"; match_id: string }
  | { type: "detail"; event_id: string }
  | { type: "match"; id: string };

function friendlyMatchError(status: number): string {
  if (status === 404) {
    return "Match not available (may be finished or removed).";
  }

  if (status === 503) {
    return "Match data is updating. Retrying shortly.";
  }

  return "Unable to load match data right now. Please refresh and try again.";
}

function idCandidates(rawId: string): string[] {
  const candidates = new Set<string>();
  const trimmed = rawId.trim();
  if (trimmed) {
    candidates.add(trimmed);
  }

  try {
    const decoded = decodeURIComponent(trimmed);
    if (decoded.trim()) {
      candidates.add(decoded.trim());
    }
  } catch {
    // Ignore invalid URI sequences.
  }

  return Array.from(candidates);
}

async function fetchMatchDetailWithFallback(rawId: string): Promise<unknown> {
  const ids = idCandidates(rawId);
  let lastError: unknown = null;

  for (const candidateId of ids) {
    const attempts: DetailParams[] = [
      { type: "detail", id: candidateId },
      { type: "detail", match_id: candidateId },
      { type: "detail", event_id: candidateId },
      { type: "match", id: candidateId },
    ];

    for (const params of attempts) {
      try {
        return await fetchSportSRC<unknown>(params, 15);
      } catch (error) {
        lastError = error;

        if (
          error instanceof SportSRCError &&
          error.status !== 400 &&
          error.status !== 404 &&
          error.status !== 422
        ) {
          throw error;
        }
      }
    }
  }

  throw lastError ?? new Error("Unable to fetch match detail");
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      {
        error: "Missing match id",
      },
      { status: 400 },
    );
  }

  try {
    const data = await fetchMatchDetailWithFallback(id);

    return NextResponse.json(data);
  } catch (error) {
    const parsed = parseSportSRCError(error);
    return NextResponse.json(
      {
        error: friendlyMatchError(parsed.status),
        detail: parsed.detail,
      },
      { status: parsed.status },
    );
  }
}
