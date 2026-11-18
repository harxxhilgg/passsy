const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function formatHistoryDay(date: Date): string {
  const day = getOrdinal(date.getDate());
  const month = MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function formatHistoryTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatExactDateTime(dateOrIso: string | Date): string {
  const date = typeof dateOrIso === "string" ? new Date(dateOrIso) : dateOrIso;
  if (isNaN(date.getTime())) return "";
  return `${formatHistoryDay(date)} - ${formatHistoryTime(date)}`;
}

/**
 * Formats a timestamp into a clean, minimalist string matching Claude's chats/tasks style:
 * e.g., "Just now", "5m ago", "2h ago", "Yesterday", "2 days ago", "Oct 25", "Oct 25, 2025"
 */
export function formatActivityDate(
  dateOrIso: string | Date,
  referenceDate = new Date()
): string {
  const date = typeof dateOrIso === "string" ? new Date(dateOrIso) : dateOrIso;
  if (isNaN(date.getTime())) return "";

  const diffMs = referenceDate.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);

  if (diffSecs < 60) {
    return "Just now";
  }

  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24 && date.getDate() === referenceDate.getDate()) {
    return `${diffHours}h ago`;
  }

  // Check if yesterday
  const yesterday = new Date(referenceDate);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return "Yesterday";
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays >= 2 && diffDays < 7) {
    return `${diffDays} days ago`;
  }

  const month = SHORT_MONTHS[date.getMonth()];
  const day = date.getDate();

  if (date.getFullYear() === referenceDate.getFullYear()) {
    return `${month} ${day}`;
  }

  return `${month} ${day}, ${date.getFullYear()}`;
}
