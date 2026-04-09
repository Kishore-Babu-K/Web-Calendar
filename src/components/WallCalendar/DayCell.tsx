// ─────────────────────────────────────────────────────────────────────────────
// DayCell.tsx — Individual date cell with indicators, hover states, and selection
// ─────────────────────────────────────────────────────────────────────────────
'use client';

import React, { memo, useCallback } from 'react';
import type { DayCellProps } from '@/types/calendar';
import { toISODateStr } from '@/utils/dateHelpers';
import styles from './WallCalendar.module.css';

/**
 * Returns a short abbreviated label for an entry type.
 */
function getEntryIndicatorClass(type: string): string {
  switch (type) {
    case 'deadline': return styles.indicatorDeadline;
    case 'countdown': return styles.indicatorCountdown;
    case 'event': return styles.indicatorEvent;
    default: return styles.indicatorNote;
  }
}

export const DayCell: React.FC<DayCellProps> = memo(({
  date,
  isCurrentMonth,
  isToday,
  isRangeStart,
  isRangeEnd,
  isInRange,
  isPreviewStart,
  isPreviewEnd,
  isPreviewInRange,
  isSelectionStart,
  entries,
  dynamicRangeColor,
  deadlineHighlightColor,
  onSingleClick,
  onHover,
}) => {
  const dateStr = toISODateStr(date);
  const dayNumber = date.getDate();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onSingleClick(date);
    },
    [date, onSingleClick],
  );

  const handlePointerEnter = useCallback(() => {
    if (onHover) onHover(dateStr);
  }, [dateStr, onHover]);



  // Build cell class list
  const classNames = [
    styles.dayCell,
    !isCurrentMonth && styles.dayCellOtherMonth,
    isToday && styles.dayCellToday,
    isRangeStart && styles.dayCellRangeStart,
    isRangeEnd && styles.dayCellRangeEnd,
    isInRange && styles.dayCellInRange,
    isPreviewStart && styles.dayCellPreviewStart,
    isPreviewEnd && styles.dayCellPreviewEnd,
    isPreviewInRange && styles.dayCellPreviewInRange,
    isSelectionStart && styles.dayCellSelectionStart,
    entries.some((e) => e.type === 'deadline') && styles.dayCellDeadline,
    entries.length > 0 && !entries.some((e) => e.type === 'deadline') && styles.dayCellHasEntries,
  ]
    .filter(Boolean)
    .join(' ');

  const todayStr = toISODateStr(new Date());

  // Special case: check if there's a deadline or countdown that hits its exact target date *today*
  const hasRunningEdgeBorder = entries.some(
    (e) =>
      (e.type === 'deadline' && e.date === todayStr && dateStr === todayStr) ||
      (e.type === 'countdown' && e.targetDate === todayStr && dateStr === todayStr)
  );

  // Unique id for accessibility
  const cellId = `day-cell-${dateStr}`;

  return (
    <div
      id={cellId}
      className={classNames}
      role="gridcell"
      aria-label={`${dateStr}${isToday ? ', today' : ''}${entries.length ? `, ${entries.length} event(s)` : ''}`}
      aria-selected={isRangeStart || isRangeEnd || isInRange}
      tabIndex={isCurrentMonth ? 0 : -1}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick(e as unknown as React.MouseEvent);
      }}
      data-date={dateStr}
      style={{
        ...(dynamicRangeColor ? {
          '--range-start-bg': dynamicRangeColor,
          '--range-bg': `${dynamicRangeColor}33`, /* 20% opacity */
        } : {}),
        ...(deadlineHighlightColor ? {
          '--accent-deadline': deadlineHighlightColor,
        } : {}),
      } as React.CSSProperties}
    >
      {/* Smooth balanced pulse for today's deadline */}
      {isCurrentMonth && hasRunningEdgeBorder && (
        <div className={styles.smoothDeadlinePulse} aria-hidden="true" />
      )}
      {/* Strike-through for past countdown dates (only while active) */}
      {isCurrentMonth && entries.some((e) => 
        e.type === 'countdown' && 
        e.targetDate && 
        todayStr <= e.targetDate && // Countdown has not expired completely
        dateStr < todayStr // This specific day is in the past
      ) && (
        <div className={styles.countdownStrike} aria-hidden="true" />
      )}

      {/* Day number */}
      <span className={styles.dayNumber}>{dayNumber}</span>

      {/* Entry Pills (showing actual titles) */}
      {isCurrentMonth && entries.length > 0 && (
        <div className={styles.entryPills} aria-hidden="true">
          {entries.slice(0, 3).map((entry) => {
            // Only show the event name if it's the start date of a range, or not a range
            const showName = !entry.range || entry.range.start === dateStr;
            return (
              <div
                key={entry.id}
                className={`${styles.entryPill} ${getEntryIndicatorClass(entry.type)}`}
                title={entry.title || entry.type}
              >
                {showName ? (entry.title || (entry.type.charAt(0).toUpperCase() + entry.type.slice(1))) : '\u00A0'}
              </div>
            );
          })}
          {entries.length > 3 && (
            <div className={styles.entryPillMore}>+{entries.length - 3} more</div>
          )}
        </div>
      )}

      {/* Deadline pulse ring */}
      {entries.some((e) => e.type === 'deadline') && isCurrentMonth && (
        <div className={styles.deadlinePulse} aria-hidden="true" />
      )}
    </div>
  );
});

DayCell.displayName = 'DayCell';
