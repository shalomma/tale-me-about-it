// A fixed time zone keeps server and browser output identical. Without it the server
// renders in UTC (on Vercel) and the browser in local time, and hydration fails.
const DATE_TIME = new Intl.DateTimeFormat("he-IL", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Asia/Jerusalem",
});

/** Short Hebrew date and time, e.g. "20.11.2026, 14:05". */
export function formatDateTime(iso: string) {
  return DATE_TIME.format(new Date(iso));
}
