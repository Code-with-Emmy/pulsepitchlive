"use client";

interface FavoritesButtonProps {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export default function FavoritesButton({
  active,
  onClick,
  disabled = false,
}: FavoritesButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-9 items-center justify-center rounded-full border px-3 text-sm font-semibold transition ${
        active
          ? "border-rose-500 bg-rose-500 text-white"
          : "border-(--ls-border) bg-(--ls-panel-alt) text-(--ls-text) hover:border-emerald-400"
      } ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
    >
      {active ? "★" : "☆"}
    </button>
  );
}
