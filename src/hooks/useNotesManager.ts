// ─────────────────────────────────────────────────────────────────────────────
// useNotesManager.ts — localStorage-backed CRUD for calendar entries
// ─────────────────────────────────────────────────────────────────────────────
'use client';

import { useCallback, useEffect, useState } from 'react';
import type { CalendarEntry, MonthlyNote } from '@/types/calendar';

const ENTRIES_KEY = 'wall_calendar_entries';
const MONTHLY_NOTES_KEY = 'wall_calendar_monthly_notes';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function useNotesManager() {
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [monthlyNotes, setMonthlyNotes] = useState<Record<string, MonthlyNote>>({});

  // Hydrate from localStorage on mount
  useEffect(() => {
    setEntries(loadFromStorage<CalendarEntry[]>(ENTRIES_KEY, []));
    setMonthlyNotes(loadFromStorage<Record<string, MonthlyNote>>(MONTHLY_NOTES_KEY, {}));
  }, []);

  // Persist entries whenever they change
  useEffect(() => {
    saveToStorage(ENTRIES_KEY, entries);
  }, [entries]);

  // Persist monthly notes whenever they change
  useEffect(() => {
    saveToStorage(MONTHLY_NOTES_KEY, monthlyNotes);
  }, [monthlyNotes]);

  /** Add a brand-new calendar entry */
  const addEntry = useCallback((entry: Omit<CalendarEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newEntry: CalendarEntry = {
      ...entry,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setEntries((prev) => [...prev, newEntry]);
    return newEntry;
  }, []);

  /** Update an existing entry by id */
  const updateEntry = useCallback(
    (id: string, patch: Partial<Omit<CalendarEntry, 'id' | 'createdAt'>>) => {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, ...patch, updatedAt: new Date().toISOString() } : e,
        ),
      );
    },
    [],
  );

  /** Delete an entry by id */
  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  /** Get all entries that touch a specific ISO date string */
  const getEntriesForDate = useCallback(
    (dateStr: string): CalendarEntry[] => {
      return entries.filter((e) => {
        if (e.date) return e.date === dateStr;
        if (e.range) return dateStr >= e.range.start && dateStr <= e.range.end;
        if (e.targetDate) return e.targetDate === dateStr;
        return false;
      });
    },
    [entries],
  );

  /** Update a monthly notes block */
  const updateMonthlyNote = useCallback((monthKey: string, lines: string[]) => {
    setMonthlyNotes((prev) => ({
      ...prev,
      [monthKey]: { monthKey, lines },
    }));
  }, []);

  return {
    entries,
    monthlyNotes,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntriesForDate,
    updateMonthlyNote,
  };
}
