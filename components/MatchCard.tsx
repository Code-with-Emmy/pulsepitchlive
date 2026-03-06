"use client";

import Link from "next/link";
import FavoritesButton from "@/components/FavoritesButton";
import SafeImage from "@/components/SafeImage";
import { formatKickoff } from "@/lib/date";
import type { MatchItem } from "@/lib/types";

interface MatchCardProps {
  match: MatchItem;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  isLeaguePinned: boolean;
  onToggleLeaguePin: (league: string) => void;
}

function statusLabel(status: string): { label: string; dotClass: string; badgeClass: string } {
  if (status === "inprogress") {
    return {
      label: "LIVE",
      dotClass: "bg-emerald-500",
      badgeClass: "border-emerald-700 bg-emerald-950/40 text-emerald-200",
    };
  }

  if (status === "notstarted") {
    return {
      label: "UPCOMING",
      dotClass: "bg-sky-500",
      badgeClass: "border-sky-800 bg-sky-950/30 text-sky-200",
    };
  }

  if (status === "finished") {
    return {
      label: "FINISHED",
      dotClass: "bg-slate-400",
      badgeClass: "border-[var(--ls-border)] bg-[var(--ls-panel-alt)] text-[var(--ls-text)]",
    };
  }

  return {
    label: status.toUpperCase(),
    dotClass: "bg-slate-400",
    badgeClass: "border-[var(--ls-border)] bg-[var(--ls-panel-alt)] text-[var(--ls-text)]",
  };
}

export default function MatchCard({
  match,
  isFavorite,
  onToggleFavorite,
  isLeaguePinned,
  onToggleLeaguePin,
}: MatchCardProps) {
  const status = statusLabel(match.status);
  const leagueName = match.league ?? "Unknown League";

  return (
    <article className="border-b border-[var(--ls-border)] bg-[var(--ls-surface)] px-3 py-3 transition hover:bg-[var(--ls-panel-alt)] last:border-b-0 md:px-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="flex min-w-0 items-center gap-1.5 truncate text-xs font-semibold uppercase tracking-wide text-[var(--ls-muted)]">
          {match.leagueFlag && (
            <SafeImage
              src={match.leagueFlag}
              alt=""
              className="h-3.5 w-3.5 rounded-full object-cover"
              hideOnError
            />
          )}
          {match.leagueLogo && (
            <SafeImage
              src={match.leagueLogo}
              alt=""
              className="h-3.5 w-3.5 rounded object-contain"
              hideOnError
            />
          )}
            <span className="truncate">{leagueName}</span>
          </p>
          <button
            type="button"
            onClick={() => onToggleLeaguePin(leagueName)}
            className={`inline-flex h-7 items-center rounded-full border px-2 text-[11px] font-semibold ${
              isLeaguePinned
                ? "border-amber-600 bg-amber-950/40 text-amber-200"
                : "border-[var(--ls-border)] bg-[var(--ls-panel-alt)] text-[var(--ls-text)]"
            }`}
          >
            {isLeaguePinned ? "Pinned" : "Pin"}
          </button>
        </div>
        <span className="mono-label text-xs text-[var(--ls-muted)]">{formatKickoff(match.startTime)}</span>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <SafeImage
              src={match.homeBadge}
              alt=""
              className="h-7 w-7 shrink-0 object-contain"
              fallbackClassName="inline-block h-7 w-7 shrink-0 rounded-full bg-[var(--ls-panel-alt)]"
            />
            <span className="truncate text-sm font-semibold text-[var(--ls-text)]">{match.homeTeam}</span>
          </div>

          <div className="rounded-lg bg-[var(--ls-panel-alt)] px-3 py-1 text-center">
            <p className="text-lg font-extrabold text-[var(--ls-text)]">
              {match.homeScore} - {match.awayScore}
            </p>
          </div>

          <div className="flex min-w-0 items-center justify-end gap-2">
            <span className="truncate text-right text-sm font-semibold text-[var(--ls-text)]">{match.awayTeam}</span>
            <SafeImage
              src={match.awayBadge}
              alt=""
              className="h-7 w-7 shrink-0 object-contain"
              fallbackClassName="inline-block h-7 w-7 shrink-0 rounded-full bg-[var(--ls-panel-alt)]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 ${status.badgeClass}`}>
            <span className={`ls-status-dot ${status.dotClass}`} />
            <span className="mono-label text-xs">{status.label}</span>
          </span>
          <FavoritesButton active={isFavorite} onClick={() => onToggleFavorite(match.id)} />
        </div>
        <p className="text-right text-xs font-semibold capitalize text-[var(--ls-muted)]">
          {match.statusDetail ?? "No detail"}
        </p>
      </div>

      <div className="mt-3">
        <Link
          href={`/match/${encodeURIComponent(match.id)}`}
          className="inline-flex h-8 items-center rounded-full border border-emerald-500 px-3 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-950/30"
        >
          Open match
        </Link>
      </div>
    </article>
  );
}
