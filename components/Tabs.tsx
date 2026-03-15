"use client";

import type { ReactElement } from "react";
import type { MatchStatus } from "@/lib/types";

interface TabsProps {
  value: MatchStatus;
  onChange: (status: MatchStatus) => void;
}

function LiveIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3.5" />
      <path d="M4.9 8.8a10 10 0 0 1 14.2 0" />
      <path d="M7.7 16.5a6 6 0 0 1 8.6 0" />
    </svg>
  );
}

function UpcomingIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.5 2.5" />
    </svg>
  );
}

function FinishedIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 7 10 17l-5-5" />
    </svg>
  );
}

const OPTIONS: Array<{
  id: MatchStatus;
  label: string;
  Icon: () => ReactElement;
  dotClass: string;
}> = [
  { id: "inprogress", label: "Live", Icon: LiveIcon, dotClass: "bg-emerald-500" },
  { id: "notstarted", label: "Upcoming", Icon: UpcomingIcon, dotClass: "bg-sky-500" },
  { id: "finished", label: "Finished", Icon: FinishedIcon, dotClass: "bg-slate-400" },
];

export default function Tabs({ value, onChange }: TabsProps) {
  return (
    <div className="ls-segmented flex items-center gap-1.5 overflow-x-auto py-1">
      {OPTIONS.map((option) => {
        const active = option.id === value;
        const Icon = option.Icon;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            data-active={active}
            className={`ls-segmented-button inline-flex h-10 items-center gap-2 px-4 text-sm font-black uppercase tracking-[0.12em] whitespace-nowrap ${
              active ? "" : "text-[var(--ls-text)]"
            }`}
          >
            <span className="relative inline-flex h-5 w-5 items-center justify-center">
              <Icon />
              <span
                className={`absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ${option.dotClass} ${
                  active ? "ls-blink" : ""
                }`}
              />
            </span>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
