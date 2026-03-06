"use client";

import type { StreamSource } from "@/lib/types";

interface StreamSourceSelectProps {
  sources: StreamSource[];
  selectedUrl: string;
  onChange: (url: string) => void;
}

function sourceTitle(source: StreamSource, index: number): string {
  if (index === 0) {
    return source.hd ? "Best Server" : "Primary Server";
  }

  if (index === 1) {
    return source.hd ? "High Quality" : "Normal Quality";
  }

  return `Backup Server ${index - 1}`;
}

export default function StreamSourceSelect({
  sources,
  selectedUrl,
  onChange,
}: StreamSourceSelectProps) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <section className="ls-stream-source-wrap space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--ls-muted)]">
          Stream Source
        </h3>
        <span className="mono-label rounded-full border border-[var(--ls-border)] bg-[var(--ls-panel-alt)] px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] text-[var(--ls-muted)]">
          {sources.length} available
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {sources.map((source, index) => {
          const active = source.url === selectedUrl;
          const title = sourceTitle(source, index);

          return (
            <button
              key={`${source.id}-${source.url}`}
              type="button"
              onClick={() => onChange(source.url)}
              aria-pressed={active}
              className={`ls-stream-source-card w-full rounded-xl border p-3 text-left transition ${
                active
                  ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]"
                  : "border-[var(--ls-border)] bg-[var(--ls-surface)] hover:border-emerald-400/70"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--ls-text)]">
                    {title}
                  </p>
                  <p className="truncate text-xs text-[var(--ls-muted)]">
                    {active ? "Now Playing" : "Switch Source"}
                  </p>
                </div>
                <span
                  className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-black ${
                    active
                      ? "bg-emerald-500 text-black"
                      : "bg-[var(--ls-panel-alt)] text-[var(--ls-muted)]"
                  }`}
                >
                  {index + 1}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
