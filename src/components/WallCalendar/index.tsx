// ─────────────────────────────────────────────────────────────────────────────
// WallCalendar/index.tsx — Main container: shell, binding, flip animation,
//   pointer/swipe handling, modal orchestration
// ─────────────────────────────────────────────────────────────────────────────
'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { BindingRings } from './BindingRings';
import { CalendarPage } from './CalendarPage';
import { EventModal, type EventModalPayload } from './EventModal';
import { usePageFlip } from '@/hooks/usePageFlip';
import { useDateRange } from '@/hooks/useDateRange';
import { useNotesManager } from '@/hooks/useNotesManager';
import { toISODateStr, toMonthKey, sortDates } from '@/utils/dateHelpers';
import type { CalendarEntry } from '@/types/calendar';
import styles from './WallCalendar.module.css';

/**
 * WallCalendar — top-level component exported for use anywhere in the app.
 *
 * Props allow initial month override; defaults to current month.
 */
interface WallCalendarProps {
  /** Override default starting month (defaults to current month) */
  initialYear?: number;
  initialMonth?: number; // 0-indexed
}

export function WallCalendar({ initialYear, initialMonth }: WallCalendarProps = {}) {
  const now = new Date();
  const startDate = new Date(
    initialYear ?? now.getFullYear(),
    initialMonth ?? now.getMonth(),
    1,
  );

  const { currentMonth, phase, soundEnabled, setSoundEnabled, flipToNextMonth, flipToPrevMonth } =
    usePageFlip(startDate);

  const { entries, monthlyNotes, addEntry, updateEntry, deleteEntry, updateMonthlyNote } =
    useNotesManager();

  const { selection, hoverDate, handleDateClick, handleDateHover, clearHover, clearSelection } = useDateRange();

  const [modalPayload, setModalPayload] = useState<EventModalPayload | null>(null);

  // Swipe tracking
  const pointerStartY = useRef<number | null>(null);
  const pointerStartX = useRef<number | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthKey = toMonthKey(year, month);

  // ── Date interaction handlers ──────────────────────────────────────────────

  const handleDayClick = useCallback(
    (date: Date) => {
      handleDateClick(date, {
        onSingleClick: (dateStr) => {
          // If a range was just confirmed, open modal with it
          if (selection.phase === 'confirmed') {
            setModalPayload({ range: { start: selection.start, end: selection.end } });
            clearSelection();
            return;
          }
          // Check existing entries on this date
          const dayEntries = entries.filter((e) => {
            if (e.date) return e.date === dateStr;
            if (e.range) return dateStr >= e.range.start && dateStr <= e.range.end;
            return false;
          });
          if (dayEntries.length === 1) {
            setModalPayload({ entry: dayEntries[0] });
          } else if (dayEntries.length > 1) {
            // Open modal for first; future improvement: list picker
            setModalPayload({ entry: dayEntries[0] });
          } else {
            setModalPayload({ date: dateStr });
          }
        },
        onDoubleClick: (_dateStr) => {
          // Range selection started – no modal yet
        },
      });
    },
    [handleDateClick, selection, entries, clearSelection],
  );

  // When range is confirmed, open modal automatically
  useEffect(() => {
    if (selection.phase === 'confirmed') {
      const [start, end] = sortDates(selection.start, selection.end);
      setModalPayload({ range: { start, end } });
      clearSelection();
    }
  }, [selection, clearSelection]);

  // ── Modal save / delete ───────────────────────────────────────────────────

  const handleModalSave = useCallback(
    (data: Omit<CalendarEntry, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string) => {
      if (existingId) {
        updateEntry(existingId, data);
      } else {
        addEntry(data);
      }
      setModalPayload(null);
    },
    [addEntry, updateEntry],
  );

  const handleModalDelete = useCallback(
    (id: string) => {
      deleteEntry(id);
      setModalPayload(null);
    },
    [deleteEntry],
  );

  const handleModalClose = useCallback(() => {
    setModalPayload(null);
  }, []);

  // ── Keyboard navigation ───────────────────────────────────────────────────

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') flipToNextMonth();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') flipToPrevMonth();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [flipToNextMonth, flipToPrevMonth]);

  // ── Pointer/swipe handling ────────────────────────────────────────────────

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerStartY.current = e.clientY;
    pointerStartX.current = e.clientX;
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (pointerStartY.current === null || pointerStartX.current === null) return;
      const dy = pointerStartY.current - e.clientY;
      const dx = e.clientX - pointerStartX.current;
      const absDy = Math.abs(dy);
      const absDx = Math.abs(dx);

      // Swipe up (next) or down (prev) — requires dominant vertical gesture
      if (absDy > 60 && absDy > absDx * 1.5) {
        if (dy > 0) flipToNextMonth();
        else flipToPrevMonth();
      }
      pointerStartY.current = null;
      pointerStartX.current = null;
    },
    [flipToNextMonth, flipToPrevMonth],
  );

  // ── Computed values ───────────────────────────────────────────────────────

  const selectionStartStr = useMemo(() => {
    return selection.phase === 'awaiting-end' ? selection.start : undefined;
  }, [selection]);

  const flipClass = useMemo(() => {
    if (phase === 'flipping-next') return styles.flipNext;
    if (phase === 'flipping-prev') return styles.flipPrev;
    return '';
  }, [phase]);

  return (
    <div className={styles.wallScene} aria-label="Wall calendar">
      {/* Wall texture / background */}
      <div className={styles.wallTexture} aria-hidden="true" />

      {/* Nail */}
      <div className={styles.nailAnchor} aria-hidden="true">
        <div className={styles.nailHead} />
        <div className={styles.nailPoint} />
      </div>

      {/* Calendar frame */}
      <div
        className={styles.calendarFrame}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {/* ── Binding Rings ─────────────────────────────────────────── */}
        <BindingRings count={16} />

        {/* ── 3D Page Flip Wrapper ───────────────────────────────────── */}
        <div className={`${styles.pageFlipWrapper} ${flipClass}`}>
          {/* Back page (visible during flip, simulates page beneath) */}
          <div className={styles.backPage} aria-hidden="true">
            <div className={styles.backPageInner}>
              <div className={styles.backPageLines}>
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className={styles.backPageLine} />
                ))}
              </div>
            </div>
          </div>

          {/* Front/current page */}
          <div className={styles.frontPage}>
            <CalendarPage
              year={year}
              month={month}
              entries={entries}
              monthlyNote={monthlyNotes[monthKey]}
              selection={selection}
              selectionStartStr={selectionStartStr}
              hoverDate={hoverDate}
              onDayClick={handleDayClick}
              onDayHover={handleDateHover}
              onGridMouseLeave={clearHover}
              onMonthlyNoteUpdate={updateMonthlyNote}
              monthKey={monthKey}
            />
          </div>
        </div>

        {/* ── Bottom Page Flutter Effect ─────────────────────────────── */}
        <div className={styles.pageCornerLeft} aria-hidden="true" />
        <div className={styles.pageCornerRight} aria-hidden="true" />

        {/* ── Navigation Controls ────────────────────────────────────── */}
        <nav className={styles.navControls} aria-label="Month navigation">
          <button
            id="prev-month-btn"
            className={styles.navBtn}
            onClick={flipToPrevMonth}
            aria-label="Previous month"
            disabled={phase !== 'idle'}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            id="today-btn"
            className={styles.navBtnToday}
            onClick={() => {
              /* Navigate to current month */
              const todayMonth = new Date();
              if (
                todayMonth.getMonth() !== month ||
                todayMonth.getFullYear() !== year
              ) {
                const diff =
                  (todayMonth.getFullYear() - year) * 12 +
                  (todayMonth.getMonth() - month);
                if (diff > 0) {
                  for (let i = 0; i < diff; i++) flipToNextMonth();
                } else {
                  for (let i = 0; i < Math.abs(diff); i++) flipToPrevMonth();
                }
              }
            }}
            aria-label="Go to today"
            disabled={phase !== 'idle'}
          >
            Today
          </button>

          <button
            id="next-month-btn"
            className={styles.navBtn}
            onClick={flipToNextMonth}
            aria-label="Next month"
            disabled={phase !== 'idle'}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </nav>

        {/* ── Sound Toggle ───────────────────────────────────────────── */}
        <button
          id="sound-toggle-btn"
          className={styles.soundToggleBtn}
          onClick={() => setSoundEnabled((prev) => !prev)}
          aria-label={soundEnabled ? 'Mute page flip sound' : 'Enable page flip sound'}
          title={soundEnabled ? 'Sound On' : 'Sound Off'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      {/* ── Selection hint ────────────────────────────────────────────── */}
      {selection.phase === 'awaiting-end' && (
        <div className={styles.selectionHint} role="status" aria-live="polite">
          Click another date to complete the range
        </div>
      )}

      {/* ── Event Modal ───────────────────────────────────────────────── */}
      <EventModal
        payload={modalPayload}
        onSave={handleModalSave}
        onDelete={handleModalDelete}
        onClose={handleModalClose}
      />
    </div>
  );
}

export default WallCalendar;
