// ─────────────────────────────────────────────────────────────────────────────
// calendar.ts — Shared TypeScript type definitions
// ─────────────────────────────────────────────────────────────────────────────

export type EntryType = 'event' | 'countdown' | 'note' | 'deadline';

export interface DateRange {
  start: string; // ISO date string "YYYY-MM-DD"
  end: string;   // ISO date string "YYYY-MM-DD"
}

export interface CalendarEntry {
  id: string;
  type: EntryType;
  title: string;
  description?: string;
  /** ISO date "YYYY-MM-DD" for single-day entries */
  date?: string;
  /** Date range for multi-day entries */
  range?: DateRange;
  /** Hex color override */
  color?: string;
  /** For countdowns: target date */
  targetDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyNote {
  /** Key format: "YYYY-MM" */
  monthKey: string;
  lines: string[];
}

export interface CalendarState {
  entries: CalendarEntry[];
  monthlyNotes: Record<string, MonthlyNote>;
}

export interface DayCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isInRange: boolean;
  isPreviewStart?: boolean;
  isPreviewEnd?: boolean;
  isPreviewInRange?: boolean;
  isSelectionStart: boolean;
  entries: CalendarEntry[];
  dynamicRangeColor?: string;
  deadlineHighlightColor?: string;
  onSingleClick: (date: Date) => void;
  onHover?: (dateStr: string) => void;
}

export interface FlipDirection {
  direction: 'next' | 'prev';
}
