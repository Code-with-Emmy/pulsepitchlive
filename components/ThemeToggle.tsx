"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
}

function getInitialTheme(): Theme {
  if (typeof document !== "undefined") {
    return document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  }

  if (typeof window === "undefined") {
    return "light";
  }

  const stored = window.localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return stored === "dark" || stored === "light" ? stored : systemPrefersDark ? "dark" : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    window.localStorage.setItem("theme", next);
    applyTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="ls-control ls-control-muted inline-flex h-9 items-center gap-2 px-3 text-sm font-semibold"
      aria-label="Toggle theme"
    >
      <span className="text-base leading-none" suppressHydrationWarning>
        {theme === "dark" ? "☀" : "☾"}
      </span>
      <span suppressHydrationWarning>
        {theme === "dark" ? "Light" : "Dark"}
      </span>
    </button>
  );
}
