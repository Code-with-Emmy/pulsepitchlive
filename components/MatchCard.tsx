"use client";

import Link from "next/link";
import FavoritesButton from "@/components/FavoritesButton";
import SafeImage from "@/components/SafeImage";
import { triggerAdsterraSmartLink } from "@/lib/adsterra-smart-link";
import { formatKickoff } from "@/lib/date";
import type { MatchItem } from "@/lib/types";

interface MatchCardProps {
  match: MatchItem;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  isLeaguePinned: boolean;
  onToggleLeaguePin: (league: string) => void;
  smartLinkEnabled?: boolean;
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
  smartLinkEnabled = false,
}: MatchCardProps) {
  const status = statusLabel(match.status);
  const leagueName = match.league ?? "Unknown League";

  return (
    <article className="ls-match-card px-3 py-3.5 last:border-b-0 md:px-4 md:py-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-1.5">
              {match.leagueFlag && (
                <SafeImage
                  src={match.leagueFlag}
                  alt=""
                  className="h-4 w-4 rounded-full object-cover"
                  hideOnError
                />
              )}
              {match.leagueLogo && (
                <SafeImage
                  src={match.leagueLogo}
                  alt=""
                  className="h-4 w-4 rounded object-contain"
                  hideOnError
                />
              )}
              <p className="truncate text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ls-muted)]">
                {leagueName}
              </p>
            </div>
            <p className="mono-label mt-1 text-xs uppercase tracking-[0.14em] text-[var(--ls-muted)]">
              {formatKickoff(match.startTime)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleLeaguePin(leagueName)}
              className={`ls-control inline-flex h-8 items-center px-3 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                isLeaguePinned
                  ? "border-amber-500/55 bg-amber-500/12 text-amber-300"
                  : "ls-control-muted"
              }`}
            >
              {isLeaguePinned ? "Pinned" : "Pin League"}
            </button>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${status.badgeClass}`}>
              <span className={`ls-status-dot ${status.dotClass}`} />
              <span className="mono-label text-[11px]">{status.label}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2.5 md:gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <SafeImage
              src={match.homeBadge}
              alt=""
              className="h-9 w-9 shrink-0 object-contain md:h-10 md:w-10"
              fallbackClassName="inline-block h-9 w-9 shrink-0 rounded-full bg-[var(--ls-panel-alt)] md:h-10 md:w-10"
            />
            <span className="truncate text-sm font-bold text-[var(--ls-text)] md:text-[15px]">
              {match.homeTeam}
            </span>
          </div>

          <div className="rounded-2xl border border-[var(--ls-border)] bg-[var(--ls-panel-alt)] px-3 py-2 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <p className="text-xl font-black tracking-tight text-[var(--ls-text)] md:text-2xl">
              {match.homeScore}
              <span className="px-1.5 text-[var(--ls-muted)]">:</span>
              {match.awayScore}
            </p>
          </div>

          <div className="flex min-w-0 items-center justify-end gap-3">
            <span className="truncate text-right text-sm font-bold text-[var(--ls-text)] md:text-[15px]">
              {match.awayTeam}
            </span>
            <SafeImage
              src={match.awayBadge}
              alt=""
              className="h-9 w-9 shrink-0 object-contain md:h-10 md:w-10"
              fallbackClassName="inline-block h-9 w-9 shrink-0 rounded-full bg-[var(--ls-panel-alt)] md:h-10 md:w-10"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-xs font-semibold capitalize tracking-[0.02em] text-[var(--ls-muted)]">
            {match.statusDetail ?? "No detail"}
          </p>
          <div className="flex items-center justify-between gap-2 md:justify-end">
            <FavoritesButton
              active={isFavorite}
              onClick={() => onToggleFavorite(match.id)}
            />
          </div>
        </div>

        <Link
          href={`/match/${encodeURIComponent(match.id)}`}
          onClick={() => {
            if (smartLinkEnabled) {
              triggerAdsterraSmartLink(
                "adsterra_smart_link_match_cta_last_opened_at",
              );
            }
          }}
          className="ls-control ls-control-solid inline-flex h-10 items-center justify-center px-4 text-sm font-bold uppercase tracking-[0.08em] sm:w-fit"
        >
          Open match
        </Link>
      </div>
    </article>
  );
}
