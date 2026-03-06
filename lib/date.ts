export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayInputDate(): string {
  return toDateInputValue(new Date());
}

export function formatKickoff(value?: string): string {
  if (!value) {
    return "Time not available";
  }

  const numericValue = /^\d+$/.test(value) ? Number(value) : null;
  const date = Number.isFinite(numericValue) ? new Date(numericValue as number) : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  }).format(date);
}
