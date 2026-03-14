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
      className={`ls-control inline-flex h-10 items-center justify-center gap-1.5 px-3 text-sm font-semibold ${
        active
          ? "border-rose-500/55 bg-rose-500 text-white shadow-[0_12px_22px_rgba(244,63,94,0.28)]"
          : "ls-control-muted"
      } ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
    >
      <span className="text-base leading-none">{active ? "★" : "☆"}</span>
      <span className="hidden sm:inline">{active ? "Saved" : "Save"}</span>
    </button>
  );
}
