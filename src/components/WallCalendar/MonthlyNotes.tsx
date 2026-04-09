// ─────────────────────────────────────────────────────────────────────────────
// MonthlyNotes.tsx — Handwriting-style editable monthly notes panel
// ─────────────────────────────────────────────────────────────────────────────
'use client';

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import type { MonthlyNote } from '@/types/calendar';
import styles from './WallCalendar.module.css';

const DEFAULT_LINE_COUNT = 6;

interface MonthlyNotesProps {
  monthKey: string;
  note: MonthlyNote | undefined;
  onUpdate: (monthKey: string, lines: string[]) => void;
}

export const MonthlyNotes: React.FC<MonthlyNotesProps> = memo(({ monthKey, note, onUpdate }) => {
  const [lines, setLines] = useState<string[]>(() => {
    if (note?.lines && note.lines.length > 0) return note.lines;
    return Array(DEFAULT_LINE_COUNT).fill('');
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  // Sync external note changes (e.g. month navigation)
  useEffect(() => {
    setLines(
      note?.lines && note.lines.length > 0
        ? note.lines
        : Array(DEFAULT_LINE_COUNT).fill(''),
    );
    setEditingIndex(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey]); // Only reset state when monthKey changes, not on every note update

  const handleLineChange = useCallback(
    (index: number, value: string) => {
      const updated = [...lines];
      updated[index] = value;
      // Auto-grow: add a new empty line if last line has content
      if (index === updated.length - 1 && value.trim() !== '') {
        updated.push('');
      }
      setLines(updated);
      onUpdate(monthKey, updated);
    },
    [lines, monthKey, onUpdate],
  );

  const handleDoubleClick = useCallback((index: number) => {
    setEditingIndex(index);
    setTimeout(() => {
      inputRefs.current[index]?.focus();
      inputRefs.current[index]?.select();
    }, 50);
  }, []);

  const handleBlur = useCallback(() => {
    setEditingIndex(null);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const nextIndex = index + 1;
        if (nextIndex < lines.length) {
          setEditingIndex(nextIndex);
          setTimeout(() => inputRefs.current[nextIndex]?.focus(), 50);
        } else {
          setEditingIndex(null);
        }
      } else if (e.key === 'Escape') {
        setEditingIndex(null);
      }
    },
    [lines.length],
  );

  return (
    <section className={styles.monthlyNotesPanel} aria-label="Monthly notes">
      <h3 className={styles.monthlyNotesHeading}>
        <span className={styles.monthlyNotesBullet}>✦</span> Notes
      </h3>

      <div className={styles.noteLines}>
        {lines.map((line, index) => (
          <div
            key={index}
            className={`${styles.noteLine} ${editingIndex === index ? styles.noteLineEditing : ''}`}
            onDoubleClick={() => handleDoubleClick(index)}
          >
            {/* Ruled line visual */}
            <span className={styles.noteRuledLine} aria-hidden="true" />

            {editingIndex === index ? (
              <textarea
                ref={(el) => { inputRefs.current[index] = el; }}
                id={`monthly-note-line-${monthKey}-${index}`}
                className={styles.noteInput}
                value={line}
                rows={1}
                onChange={(e) => handleLineChange(index, e.target.value)}
                onBlur={handleBlur}
                onKeyDown={(e) => handleKeyDown(e, index)}
                aria-label={`Note line ${index + 1}`}
                placeholder="Write a note…"
              />
            ) : (
              <span
                className={`${styles.noteText} ${line ? '' : styles.noteTextEmpty}`}
                aria-label={line || `Empty note line ${index + 1}`}
                title="Double-click to edit"
              >
                {line || '\u00A0'}
              </span>
            )}
          </div>
        ))}
      </div>

      <p className={styles.monthlyNotesHint}>Double-click a line to edit</p>
    </section>
  );
});

MonthlyNotes.displayName = 'MonthlyNotes';
