// ─────────────────────────────────────────────────────────────────────────────
// useDateRange.ts — Date range selection with double-click / single-click logic
// ─────────────────────────────────────────────────────────────────────────────
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toISODateStr, sortDates } from '@/utils/dateHelpers';

export type SelectionState =
  | { phase: 'idle' }
  | { phase: 'awaiting-end'; start: string }
  | { phase: 'confirmed'; start: string; end: string };

export function useDateRange() {
  const [selection, setSelection] = useState<SelectionState>({ phase: 'idle' });
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const selectionRef = useRef<SelectionState>(selection);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickCountRef = useRef(0);

  // Keep ref up to date
  useEffect(() => {
    selectionRef.current = selection;
  }, [selection]);

  const handleDateClick = useCallback(
    (
      date: Date,
      {
        onSingleClick,
        onDoubleClick,
      }: {
        onSingleClick: (dateStr: string) => void;
        onDoubleClick: (dateStr: string) => void;
      },
    ) => {
      const dateStr = toISODateStr(date);
      clickCountRef.current += 1;

      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

      clickTimerRef.current = setTimeout(() => {
        const clicks = clickCountRef.current;
        clickCountRef.current = 0;

        if (clicks === 1) {
          // Single click
          if (selectionRef.current.phase === 'awaiting-end') {
            // Complete the range
            const [start, end] = sortDates(selectionRef.current.start, dateStr);
            setSelection({ phase: 'confirmed', start, end });
          } else {
            onSingleClick(dateStr);
          }
        } else if (clicks >= 2) {
          // Double click — set range start
          setSelection({ phase: 'awaiting-end', start: dateStr });
          onDoubleClick(dateStr);
        }
      }, 250);
    },
    [],
  );

  const clearSelection = useCallback(() => {
    setSelection({ phase: 'idle' });
    setHoverDate(null);
  }, []);

  const handleDateHover = useCallback((dateStr: string) => {
    if (selectionRef.current.phase === 'awaiting-end') {
      setHoverDate(dateStr);
    }
  }, []);

  const clearHover = useCallback(() => {
    setHoverDate(null);
  }, []);

  return { selection, hoverDate, handleDateClick, handleDateHover, clearHover, clearSelection };
}
