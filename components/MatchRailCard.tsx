"use client";

import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import { formatKickoff } from "@/lib/date";
import type { MatchItem } from "@/lib/types";

interface MatchRailCardProps {
  match: MatchItem;
}

export default function MatchRailCard({ match }: MatchRailCardProps) {
  const isLive = match.status === "inprogress";

  return (
    <Link
      href={`/match/${encodeURIComponent(match.id)}${isLive ? "?fs=1" : ""}`}
      className="ls-rail-card group block w-[300px] shrink-0 p-5 transition-transform duration-200 hover:-translate-y-1 md:w-[348px]"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {match.homeBadge && (
          <div className="absolute -left-7 -top-6 opacity-[0.14] blur-[0.4px]">
            <SafeImage
              src={match.homeBadge}
              alt=""
              className="h-32 w-32 object-contain md:h-40 md:w-40"
              hideOnError
            />
          </div>
        )}
        {match.awayBadge && (
          <div className="absolute -bottom-7 -right-6 opacity-[0.14] blur-[0.4px]">
            <SafeImage
              src={match.awayBadge}
              alt=""
              className="h-36 w-36 object-contain md:h-44 md:w-44"
              hideOnError
            />
          </div>
        )}
      </div>

      <div className="relative z-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="mono-label text-[11px] uppercase tracking-[0.18em] text-white/48">
              {match.league ?? "League"}
            </p>
            <p className="mt-2 text-sm font-semibold text-white/74">
              {formatKickoff(match.startTime)}
            </p>
          </div>
          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
              isLive
                ? "border-rose-500 bg-rose-600 text-white"
                : match.status === "notstarted"
                  ? "border-white/10 bg-white/6 text-white/80"
                  : "border-white/10 bg-white/6 text-white/70"
            }`}
          >
            {isLive ? "Live" : match.status === "notstarted" ? "Soon" : "FT"}
          </span>
        </div>

        <div className="mt-10 space-y-5">
          {[
            {
              team: match.homeTeam,
              badge: match.homeBadge,
              score: match.homeScore,
            },
            {
              team: match.awayTeam,
              badge: match.awayBadge,
              score: match.awayScore,
            },
          ].map((entry) => (
            <div
              key={`${match.id}-${entry.team}`}
              className="flex items-center gap-3"
            >
              <SafeImage
                src={entry.badge}
                alt=""
                className="h-11 w-11 shrink-0 object-contain"
                fallbackClassName="inline-block h-11 w-11 shrink-0 rounded-full bg-white/10"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[17px] font-black tracking-[-0.03em] text-white">
                  {entry.team}
                </p>
              </div>
              <div className="rounded-lg bg-white/8 px-3 py-1.5 text-xl font-black text-white">
                {match.status === "notstarted" ? "-" : entry.score}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-7 flex items-center justify-between gap-3 border-t border-white/8 pt-4">
          <p className="text-sm font-semibold text-white/66">
            {match.statusDetail ?? (isLive ? "Live match" : "Matchday")}
          </p>
          <span className="rounded-full bg-(--ls-accent) px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-black">
            Open
          </span>
        </div>
      </div>
    </Link>
  );
}
