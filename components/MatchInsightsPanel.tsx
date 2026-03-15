"use client";

import type { MatchItem, MatchDetailItem } from "@/lib/types";
import { buildMatchInsights } from "@/lib/match-insights";

interface MatchInsightsPanelProps {
  detail: MatchDetailItem;
  relatedMatches: MatchItem[];
}

function sectionTitle(title: string) {
  return (
    <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--ls-muted)]">
      {title}
    </h3>
  );
}

export default function MatchInsightsPanel({
  detail,
  relatedMatches,
}: MatchInsightsPanelProps) {
  const insights = buildMatchInsights(detail, relatedMatches);

  return (
    <section className="grid gap-3">
      <article className="ls-card overflow-hidden p-4 md:p-5">
        <div className="flex items-center justify-between gap-2">
          {sectionTitle("⚽ Lineups & Formations")}
          <span className="mono-label rounded-full border border-[var(--ls-border)] bg-[var(--ls-panel-alt)] px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] text-[var(--ls-muted)]">
            {insights.lineups.home.formation} vs {insights.lineups.away.formation}
          </span>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {[insights.lineups.home, insights.lineups.away].map((lineup) => (
            <div
              key={lineup.teamName}
              className="rounded-2xl border border-[var(--ls-border)] bg-[var(--ls-panel-alt)] p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-base font-bold text-[var(--ls-text)]">
                  {lineup.teamName}
                </p>
                <span className="rounded-full bg-emerald-500/12 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                  {lineup.formation}
                </span>
              </div>

              <div className="space-y-3">
                {lineup.lines.map((line) => (
                  <div key={`${lineup.teamName}-${line.label}`}>
                    <p className="mono-label text-[11px] uppercase tracking-[0.12em] text-[var(--ls-muted)]">
                      {line.label}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {line.players.map((player) => (
                        <span
                          key={`${lineup.teamName}-${line.label}-${player}`}
                          className="rounded-full border border-[var(--ls-border)] bg-[var(--ls-surface)] px-2.5 py-1 text-xs font-semibold text-[var(--ls-text)]"
                        >
                          {player}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </article>

      <div className="grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="ls-card overflow-hidden p-4 md:p-5">
          <div className="flex items-center justify-between gap-2">
            {sectionTitle("📈 Live Stats (xG, Shots)")}
            <span className="text-xs font-semibold text-emerald-300">
              Live model
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {insights.stats.map((stat) => {
              const total = Math.max(stat.homeValue + stat.awayValue, 1);
              const homeWidth = `${(stat.homeValue / total) * 100}%`;
              const awayWidth = `${(stat.awayValue / total) * 100}%`;

              return (
                <div key={stat.label} className="space-y-1.5">
                  <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                    <span className="text-sm font-bold text-[var(--ls-text)]">
                      {stat.homeDisplay}
                    </span>
                    <span className="text-center text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ls-muted)]">
                      {stat.label}
                    </span>
                    <span className="text-right text-sm font-bold text-[var(--ls-text)]">
                      {stat.awayDisplay}
                    </span>
                  </div>
                  <div className="flex h-2 overflow-hidden rounded-full bg-[var(--ls-border)]/40">
                    <div
                      className="rounded-l-full bg-emerald-500"
                      style={{ width: homeWidth }}
                    />
                    <div
                      className="rounded-r-full bg-sky-500"
                      style={{ width: awayWidth }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="ls-card overflow-hidden p-4 md:p-5">
          <div className="flex items-center justify-between gap-2">
            {sectionTitle("⚡ Real-time Incidents")}
            <span className="text-xs font-semibold text-amber-300">
              Auto-updating
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {insights.incidents.map((incident) => (
              <div
                key={`${incident.minute}-${incident.type}-${incident.text}`}
                className="grid grid-cols-[auto_1fr] gap-3"
              >
                <span className="mono-label rounded-full border border-[var(--ls-border)] bg-[var(--ls-panel-alt)] px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] text-[var(--ls-muted)]">
                  {incident.minute}
                </span>
                <div className="rounded-2xl border border-[var(--ls-border)] bg-[var(--ls-panel-alt)] p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ls-muted)]">
                    {incident.type}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--ls-text)]">
                    {incident.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <article className="ls-card overflow-hidden p-4 md:p-5">
          <div className="flex items-center justify-between gap-2">
            {sectionTitle("🆚 H2H & Form Analysis")}
            <span className="text-xs font-semibold text-[var(--ls-muted)]">
              Last five
            </span>
          </div>

          <div className="mt-4 space-y-4">
            {[
              { team: detail.homeTeam, form: insights.form.home },
              { team: detail.awayTeam, form: insights.form.away },
            ].map((entry) => (
              <div key={entry.team}>
                <p className="mb-2 text-sm font-bold text-[var(--ls-text)]">
                  {entry.team}
                </p>
                <div className="flex gap-2">
                  {entry.form.map((item, index) => (
                    <span
                      key={`${entry.team}-${index}`}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${item.colorClass}`}
                    >
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <div className="rounded-2xl border border-[var(--ls-border)] bg-[var(--ls-panel-alt)] p-3">
              <p className="text-sm font-semibold text-[var(--ls-text)]">
                {insights.form.h2hSummary}
              </p>
            </div>
          </div>
        </article>

        <article className="ls-card overflow-hidden p-4 md:p-5">
          <div className="flex items-center justify-between gap-2">
            {sectionTitle("🏆 Live Standings Tables")}
            <span className="text-xs font-semibold text-[var(--ls-muted)]">
              {insights.standings.league}
            </span>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--ls-border)]">
            <div className="grid grid-cols-[40px_1fr_52px_52px_52px] gap-2 border-b border-[var(--ls-border)] bg-[var(--ls-panel-alt)] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ls-muted)]">
              <span>#</span>
              <span>Team</span>
              <span>P</span>
              <span>GD</span>
              <span>Pts</span>
            </div>

            {insights.standings.rows.map((row, index) => (
              <div
                key={row.team}
                className={`grid grid-cols-[40px_1fr_52px_52px_52px] gap-2 border-b border-[var(--ls-border)] px-3 py-3 text-sm last:border-b-0 ${
                  row.highlight ? "bg-emerald-500/10" : "bg-[var(--ls-surface)]"
                }`}
              >
                <span className="font-bold text-[var(--ls-text)]">
                  {index + 1}
                </span>
                <span className="truncate font-semibold text-[var(--ls-text)]">
                  {row.team}
                </span>
                <span className="text-[var(--ls-muted)]">{row.played}</span>
                <span className="text-[var(--ls-muted)]">
                  {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                </span>
                <span className="font-bold text-[var(--ls-text)]">
                  {row.points}
                </span>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="ls-card overflow-hidden p-4 md:p-5">
        <div className="flex items-center justify-between gap-2">
          {sectionTitle("📊 Momentum Graphs")}
          <span className="text-xs font-semibold text-[var(--ls-muted)]">
            Pressure swings
          </span>
        </div>

        <div className="mt-5">
          <div className="flex h-44 items-end gap-2">
            {insights.momentum.map((value, index) => (
              <div
                key={`momentum-${index}`}
                className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
              >
                <div
                  className={`w-full rounded-t-2xl ${
                    value >= 50 ? "bg-emerald-500/80" : "bg-sky-500/80"
                  }`}
                  style={{ height: `${Math.max(value, 12)}%` }}
                />
                <span className="mono-label text-[10px] text-[var(--ls-muted)]">
                  {index + 1}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-semibold text-[var(--ls-muted)]">
            <span>{detail.homeTeam} momentum</span>
            <span>{detail.awayTeam} momentum</span>
          </div>
        </div>
      </article>
    </section>
  );
}
