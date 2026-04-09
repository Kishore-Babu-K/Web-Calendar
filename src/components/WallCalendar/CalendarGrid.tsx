// ─────────────────────────────────────────────────────────────────────────────
// CalendarGrid.tsx — 7-column Mon–Sun date grid for a given month
// ─────────────────────────────────────────────────────────────────────────────
'use client';

import React, { memo } from 'react';
import { DayCell } from './DayCell';
import { buildMonthGrid, DAY_NAMES_SHORT, toISODateStr, isToday, sortDates } from '@/utils/dateHelpers';
import type { CalendarEntry } from '@/types/calendar';
import type { SelectionState } from '@/hooks/useDateRange';
import styles from './WallCalendar.module.css';

interface CalendarGridProps {
  year: number;
  month: number;
  entries: CalendarEntry[];
  selection: SelectionState;
  selectionStartStr?: string;
  hoverDate: string | null;
  onDayClick: (date: Date) => void;
  onDayHover: (dateStr: string) => void;
  onGridMouseLeave: () => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = memo(({
  year,
  month,
  entries,
  selection,
  selectionStartStr,
  hoverDate,
  onDayClick,
  onDayHover,
  onGridMouseLeave,
}) => {
  const cells = buildMonthGrid(year, month);

  const rangeStart =
    selection.phase === 'confirmed' ? selection.start
    : selection.phase === 'awaiting-end' ? selection.start
    : null;
  const rangeEnd = selection.phase === 'confirmed' ? selection.end : null;

  return (
    <div className={styles.gridWrapper} role="grid" aria-label="Calendar grid" onMouseLeave={onGridMouseLeave}>
      {/* Day-of-week header row */}
      <div className={styles.dayHeaders} role="row">
        {DAY_NAMES_SHORT.map((name) => (
          <div
            key={name}
            className={styles.dayHeader}
            role="columnheader"
            aria-label={name}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Date cells */}
      <div className={styles.gridCells} role="rowgroup">
        {cells
          .slice(0, cells[35].getMonth() === month ? 42 : 35)
          .map((date) => {
          const dateStr = toISODateStr(date);
          const isCurrent = date.getMonth() === month;

          const todayStr = toISODateStr(new Date());

          const dayEntries = entries.filter((e) => {
            if (e.type === 'countdown') {
              const start = e.range ? e.range.start : e.date;
              if (start && todayStr < start) return false;
            }
            if (e.date) return e.date === dateStr;
            if (e.range)
              return dateStr >= e.range.start && dateStr <= e.range.end;
            return false;
          });

          const isSelectionStart = rangeStart === dateStr;
          const isSelectionEnd = rangeEnd !== null && rangeEnd === dateStr;
          const inSelectionRange =
            rangeStart !== null &&
            rangeEnd !== null &&
            dateStr > rangeStart &&
            dateStr < rangeEnd;

          // Compute saved entry ranges
          let isEntryRangeStart = false;
          let isEntryRangeEnd = false;
          let isEntryInRange = false;
          let isEntrySingle = false;
          let dynamicRangeColor: string | undefined;
          let deadlineHighlightColor: string | undefined;

          dayEntries.forEach((e) => {
            if (e.type === 'countdown' && e.targetDate && todayStr > e.targetDate) {
              // The countdown is fully over, do not apply range styling
              return;
            }
            if (e.range) {
              if (e.range.start === dateStr) isEntryRangeStart = true;
              if (e.range.end === dateStr) isEntryRangeEnd = true;
              if (dateStr > e.range.start && dateStr < e.range.end) isEntryInRange = true;
              if (e.color) dynamicRangeColor = e.color;
            } else if (e.date === dateStr) {
              isEntrySingle = true;
              if (e.color) dynamicRangeColor = e.color;
            }
            // Deadline logic mapping
            if (e.type === 'deadline') {
              const diffTime = new Date(e.date!).getTime() - new Date(todayStr).getTime();
              const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (daysLeft === 3) deadlineHighlightColor = '#facc15'; // Yellow
              else if (daysLeft === 2) deadlineHighlightColor = '#f97316'; // Orange
              else if (daysLeft <= 1) deadlineHighlightColor = '#ef4444'; // Red
            }
          });

          // Combine active selection and saved entries
          const finalIsStart = isSelectionStart || isEntryRangeStart;
          const finalIsEnd = isSelectionEnd || isEntryRangeEnd;
          const finalInRange = inSelectionRange || isEntryInRange;
          const finalSelectionStart = (rangeStart === dateStr && selection.phase === 'idle') || isEntrySingle || (rangeStart === dateStr && selection.phase === 'awaiting-end');

          // Compute preview range if hovering
          let isPreviewStart = false;
          let isPreviewEnd = false;
          let isPreviewInRange = false;

          if (selection.phase === 'awaiting-end' && hoverDate) {
            const [pStart, pEnd] = sortDates(selection.start, hoverDate);
            isPreviewStart = dateStr === pStart;
            isPreviewEnd = dateStr === pEnd;
            isPreviewInRange = dateStr > pStart && dateStr < pEnd;
          }

          return (
            <DayCell
              key={dateStr}
              date={date}
              isCurrentMonth={isCurrent}
              isToday={isToday(date)}
              isRangeStart={finalIsStart}
              isRangeEnd={finalIsEnd}
              isInRange={finalInRange}
              isPreviewStart={isPreviewStart}
              isPreviewEnd={isPreviewEnd}
              isPreviewInRange={isPreviewInRange}
              isSelectionStart={finalSelectionStart}
              entries={dayEntries}
              dynamicRangeColor={dynamicRangeColor}
              deadlineHighlightColor={deadlineHighlightColor}
              onSingleClick={onDayClick}
              onHover={onDayHover}
            />
          );
        })}
      </div>
    </div>
  );
});

CalendarGrid.displayName = 'CalendarGrid';
