// ─────────────────────────────────────────────────────────────────────────────
// CalendarPage.tsx — One "page" of the wall calendar
//   Layout: Hero image → Month title overlay → Countdown strip → Notes → Grid
// ─────────────────────────────────────────────────────────────────────────────
'use client';

import React, { memo, useMemo } from 'react';
import { CalendarGrid } from './CalendarGrid';
import { MonthlyNotes } from './MonthlyNotes';
import type { CalendarEntry, MonthlyNote } from '@/types/calendar';
import type { SelectionState } from '@/hooks/useDateRange';
import { MONTH_NAMES, toISODateStr, daysBetween } from '@/utils/dateHelpers';
import styles from './WallCalendar.module.css';

/** Gradient overlays keyed by 0-indexed month for hero section variety */
const MONTH_GRADIENTS: string[] = [
  'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',  // Jan – deep ocean
  'linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%)',               // Feb – violet dusk
  'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',               // Mar – forest teal
  'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',               // Apr – golden dawn
  'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',               // May – emerald
  'linear-gradient(135deg, #16213e 0%, #0f3460 50%, #533483 100%)', // Jun – midnight
  'linear-gradient(135deg, #f953c6 0%, #b91d73 100%)',               // Jul – magenta
  'linear-gradient(135deg, #f7797d 0%, #fbd786 50%, #c6ffdd 100%)', // Aug – sunset
  'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)',               // Sep – sapphire
  'linear-gradient(135deg, #c94b4b 0%, #4b134f 100%)',               // Oct – autumn crimson
  'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',               // Nov – steel blue
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', // Dec – midnight navy
];

/** Abstract SVG patterns for the hero image */
const MONTH_PATTERNS = [
  // Jan – geometric mountains
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200">
    <polygon points="0,200 120,60 200,130 280,30 400,200" fill="rgba(255,255,255,0.08)"/>
    <polygon points="0,200 80,100 160,160 240,50 320,110 400,200" fill="rgba(255,255,255,0.05)"/>
    <circle cx="320" cy="50" r="40" fill="rgba(255,255,255,0.06)"/>
  </svg>`,
  // Feb – flowing curves
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200">
    <path d="M0,100 Q100,20 200,100 T400,100 V200 H0Z" fill="rgba(255,255,255,0.08)"/>
    <circle cx="200" cy="80" r="60" fill="rgba(255,255,255,0.06)"/>
  </svg>`,
  // Mar – leaves/nature
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200">
    <ellipse cx="150" cy="120" rx="120" ry="80" fill="rgba(255,255,255,0.07)" transform="rotate(-20 150 120)"/>
    <ellipse cx="280" cy="80" rx="100" ry="60" fill="rgba(255,255,255,0.06)" transform="rotate(15 280 80)"/>
  </svg>`,
];

interface CountdownDisplayProps {
  entries: CalendarEntry[];
  year: number;
  month: number;
}

const CountdownDisplay: React.FC<CountdownDisplayProps> = ({ entries, year, month }) => {
  const today = toISODateStr(new Date());
  const relevantCountdowns = useMemo(
    () =>
      entries.filter((e) => {
        if (e.type !== 'countdown' || !e.targetDate) return false;
        
        // Hide if today is before the start date!
        const start = e.range ? e.range.start : e.date;
        if (start && today < start) return false;

        const td = e.targetDate;
        const yr = parseInt(td.slice(0, 4));
        const mo = parseInt(td.slice(5, 7)) - 1;
        return yr === year && mo === month;
      }),
    [entries, year, month, today],
  );

  if (relevantCountdowns.length === 0) return null;

  return (
    <div className={styles.countdownStrip} aria-label="Countdowns">
      {relevantCountdowns.map((entry) => {
        const daysLeft = entry.targetDate ? daysBetween(today, entry.targetDate) : 0;
        const isPast = daysLeft < 0;
        return (
          <div
            key={entry.id}
            className={`${styles.countdownItem} ${isPast ? styles.countdownPast : ''}`}
            style={{ '--entry-color': entry.color ?? '#f59e0b' } as React.CSSProperties}
          >
            <span className={styles.countdownIcon}>{isPast ? '✓' : '⏳'}</span>
            <span className={styles.countdownTitle}>{entry.title}</span>
            <span className={styles.countdownBadge}>
              {isPast
                ? `${Math.abs(daysLeft)}d ago`
                : daysLeft === 0
                ? 'Today!'
                : `${daysLeft}d left`}
            </span>
          </div>
        );
      })}
    </div>
  );
};

interface CalendarPageProps {
  year: number;
  month: number;
  entries: CalendarEntry[];
  monthlyNote: MonthlyNote | undefined;
  selection: SelectionState;
  selectionStartStr?: string;
  hoverDate: string | null;
  onDayClick: (date: Date) => void;
  onDayHover: (dateStr: string) => void;
  onGridMouseLeave: () => void;
  onMonthlyNoteUpdate: (monthKey: string, lines: string[]) => void;
  monthKey: string;
}

export const CalendarPage: React.FC<CalendarPageProps> = memo(
  ({
    year,
    month,
    entries,
    monthlyNote,
    selection,
    selectionStartStr,
    hoverDate,
    onDayClick,
    onDayHover,
    onGridMouseLeave,
    onMonthlyNoteUpdate,
    monthKey,
  }) => {
    const gradient = MONTH_GRADIENTS[month % 12];
    const patternSvg = MONTH_PATTERNS[month % MONTH_PATTERNS.length];
    const patternEncoded = `data:image/svg+xml;utf8,${encodeURIComponent(patternSvg)}`;

    return (
      <article className={styles.calendarPage} aria-label={`${MONTH_NAMES[month]} ${year}`}>
        {/* ── Hero Section ─────────────────────────────────────────── */}
        <div
          className={styles.heroSection}
          style={{ background: gradient }}
          aria-hidden="true"
        >
          {/* Abstract pattern overlay */}
          <div
            className={styles.heroPattern}
            style={{ backgroundImage: `url("${patternEncoded}")` }}
          />
          {/* Decorative geometric shapes */}
          <div className={styles.heroShapes}>
            <div className={styles.heroShapeLeft} />
            <div className={styles.heroShapeRight} />
          </div>
          {/* Month / Year title */}
          <div className={styles.heroTitleBlock}>
            <span className={styles.heroYear}>{year}</span>
            <h2 className={styles.heroMonth}>{MONTH_NAMES[month].toUpperCase()}</h2>
          </div>
        </div>

        {/* ── Content Section ───────────────────────────────────────── */}
        <div className={styles.contentSection}>
          {/* Countdown strip (only visible if relevant entry exists) */}
          <CountdownDisplay entries={entries} year={year} month={month} />

          {/* Monthly notes */}
          <MonthlyNotes
            monthKey={monthKey}
            note={monthlyNote}
            onUpdate={onMonthlyNoteUpdate}
          />

          {/* Calendar grid */}
          <div className={styles.gridContainer}>
            <CalendarGrid
              year={year}
              month={month}
              entries={entries}
              selection={selection}
              selectionStartStr={selectionStartStr}
              hoverDate={hoverDate}
              onDayClick={onDayClick}
              onDayHover={onDayHover}
              onGridMouseLeave={onGridMouseLeave}
            />
          </div>
        </div>
      </article>
    );
  },
);

CalendarPage.displayName = 'CalendarPage';
