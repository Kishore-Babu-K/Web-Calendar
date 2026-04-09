// ─────────────────────────────────────────────────────────────────────────────
// dateHelpers.ts — Pure date utility functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns an ISO date string "YYYY-MM-DD" for a given Date object (local time).
 */
export function toISODateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parses an ISO date string "YYYY-MM-DD" into a local Date object (time 00:00).
 */
export function fromISODateStr(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Returns a "YYYY-MM" key for the given year + month (0-indexed).
 */
export function toMonthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

/**
 * Returns the full month name for a 0-indexed month number.
 */
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const DAY_NAMES_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Generates the grid of Date objects for the calendar view of a given month.
 * Always starts on Monday.  Returns exactly 6 rows × 7 = 42 cells.
 */
export function buildMonthGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  // day of week (0=Sun…6=Sat) → convert to Mon-base (0=Mon…6=Sun)
  const dayOfWeek = (firstDay.getDay() + 6) % 7;

  const start = new Date(year, month, 1 - dayOfWeek);

  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    cells.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }
  return cells;
}

/**
 * Returns true when dateStr falls inside [rangeStart, rangeEnd] (inclusive).
 */
export function isDateInRange(
  dateStr: string,
  rangeStart: string,
  rangeEnd: string,
): boolean {
  return dateStr >= rangeStart && dateStr <= rangeEnd;
}

/**
 * Computes the number of days between two ISO date strings (positive = future).
 */
export function daysBetween(fromStr: string, toStr: string): number {
  const from = fromISODateStr(fromStr);
  const to = fromISODateStr(toStr);
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

/**
 * Returns true if the given Date is today.
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

/**
 * Sorts two ISO date strings, returning [earlier, later].
 */
export function sortDates(a: string, b: string): [string, string] {
  return a <= b ? [a, b] : [b, a];
}
