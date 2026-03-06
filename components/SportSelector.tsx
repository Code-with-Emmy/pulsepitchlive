"use client";

import type { SportItem } from "@/lib/types";

interface SportSelectorProps {
  sports: SportItem[];
  value: string;
  onChange: (nextSport: string) => void;
  loading?: boolean;
}

export default function SportSelector({ sports, value, onChange, loading = false }: SportSelectorProps) {
  return (
    <label className="flex min-w-[180px] flex-col gap-1.5">
      <span className="mono-label text-xs uppercase tracking-[0.14em] text-[var(--ls-muted)]">Sport</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={loading || sports.length === 0}
        className="h-11 rounded-lg border border-[var(--ls-border)] bg-[var(--ls-panel-alt)] px-3 text-base text-[var(--ls-text)] outline-none ring-emerald-400 transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {sports.length === 0 && <option value="">No sports available</option>}
        {sports.map((sport) => (
          <option key={sport.id} value={sport.id}>
            {sport.name}
          </option>
        ))}
      </select>
    </label>
  );
}
