import { NextResponse } from "next/server";
import { fetchSportSRC, parseSportSRCError } from "@/lib/sportsrc";

export async function GET() {
  try {
    const data = await fetchSportSRC<unknown>({ type: "sports" }, 3600);
    return NextResponse.json(data);
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
