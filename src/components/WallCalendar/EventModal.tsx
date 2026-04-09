// ─────────────────────────────────────────────────────────────────────────────
// EventModal.tsx — Modal for creating / editing calendar entries
// ─────────────────────────────────────────────────────────────────────────────
'use client';

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import type { CalendarEntry, EntryType } from '@/types/calendar';
import { toISODateStr } from '@/utils/dateHelpers';
import styles from './WallCalendar.module.css';

export interface EventModalPayload {
  /** If set, we're editing an existing entry */
  entry?: CalendarEntry;
  /** Pre-selected single date */
  date?: string;
  /** Pre-selected range */
  range?: { start: string; end: string };
}

interface EventModalProps {
  payload: EventModalPayload | null;
  onSave: (
    data: Omit<CalendarEntry, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string,
  ) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

const ENTRY_TYPES: { value: EntryType; label: string; icon: string }[] = [
  { value: 'event', label: 'Event', icon: '📅' },
  { value: 'countdown', label: 'Countdown', icon: '⏳' },
  { value: 'note', label: 'Note', icon: '📝' },
  { value: 'deadline', label: 'Deadline', icon: '🔴' },
];

const TYPE_COLORS: Record<EntryType, string> = {
  event: '#3b82f6',
  countdown: '#f59e0b',
  note: '#10b981',
  deadline: '#ef4444',
};

export const EventModal: React.FC<EventModalProps> = memo(
  ({ payload, onSave, onDelete, onClose }) => {
    const isOpen = payload !== null;
    const isEditing = Boolean(payload?.entry);

    const [type, setType] = useState<EntryType>('note');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [color, setColor] = useState('');
    const [error, setError] = useState<string | null>(null);

    const titleInputRef = useRef<HTMLInputElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    // Initialise form when payload changes
    useEffect(() => {
      if (!payload) return;
      if (payload.entry) {
        const e = payload.entry;
        setType(e.type);
        setTitle(e.title);
        setDescription(e.description ?? '');
        setTargetDate(e.targetDate ?? e.date ?? '');
        setColor(e.color ?? '');
      } else {
        setType('note');
        setTitle('');
        setDescription('');
        setTargetDate(payload.date ?? '');
        setColor('');
      }
      setTimeout(() => titleInputRef.current?.focus(), 80);
    }, [payload]);

    // Close on Escape
    useEffect(() => {
      if (!isOpen) return;
      const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen, onClose]);

    const handleOverlayClick = useCallback(
      (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) onClose();
      },
      [onClose],
    );

    const handleSave = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!title.trim()) return;

        if (type === 'countdown') {
          const todayStr = toISODateStr(new Date());
          if (startDate < todayStr) {
            setError('Countdowns cannot start in the past.');
            return;
          }
        }

        const data: Partial<CalendarEntry> = {
          title: title.trim(),
          description: description.trim(),
          type,
          color: color || TYPE_COLORS[type],
        };

        if (payload?.range) {
          if (payload.range.start === payload.range.end) {
            data.date = payload.range.start;
          } else {
            data.range = payload.range;
          }
        } else if (payload?.entry?.date || payload?.date) {
          data.date = payload?.entry?.date ?? payload?.date;
        } else if (payload?.entry?.range) {
          data.range = payload.entry.range;
        }

        if (type === 'countdown') {
          data.targetDate = payload?.range?.end ?? payload?.range?.start ?? payload?.entry?.date ?? payload?.date ?? '';
        }

        onSave(data as Omit<CalendarEntry, 'id' | 'createdAt' | 'updatedAt'>, payload?.entry?.id);
        onClose();
      },
      [title, description, type, color, payload, onSave, onClose],
    );

    const handleDelete = useCallback(() => {
      if (payload?.entry && onDelete) {
        onDelete(payload.entry.id);
        onClose();
      }
    }, [payload, onDelete, onClose]);

    if (!isOpen) return null;

    const rangeLabel =
      payload?.range
        ? `${payload.range.start} → ${payload.range.end}`
        : payload?.entry?.range
        ? `${payload.entry.range.start} → ${payload.entry.range.end}`
        : payload?.date ?? payload?.entry?.date ?? '';

    return (
      <div
        ref={overlayRef}
        className={styles.modalOverlay}
        role="dialog"
        aria-modal="true"
        aria-label={isEditing ? 'Edit entry' : 'New entry'}
        onClick={handleOverlayClick}
      >
        <div className={styles.modal}>
          {/* Header */}
          <header className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>
              {isEditing ? 'Edit Entry' : 'New Entry'}
            </h2>
            {rangeLabel && (
              <span className={styles.modalDateLabel}>{rangeLabel}</span>
            )}
            <button
              id="modal-close-btn"
              className={styles.modalCloseBtn}
              onClick={onClose}
              aria-label="Close modal"
              type="button"
            >
              ✕
            </button>
          </header>

          <form className={styles.modalForm} onSubmit={handleSave} noValidate>
            {error && <div className={styles.errorMessage}>{error}</div>}
            {/* Type selector */}
            <div className={styles.typeSelector} role="radiogroup" aria-label="Entry type">
              {ENTRY_TYPES.map(({ value, label, icon }) => (
                <label
                  key={value}
                  id={`type-option-${value}`}
                  className={`${styles.typeOption} ${type === value ? styles.typeOptionSelected : ''}`}
                  style={type === value ? { borderColor: TYPE_COLORS[value], background: `${TYPE_COLORS[value]}1a` } : {}}
                >
                  <input
                    type="radio"
                    name="entry-type"
                    value={value}
                    checked={type === value}
                    onChange={() => setType(value)}
                    className={styles.srOnly}
                  />
                  <span className={styles.typeIcon}>{icon}</span>
                  <span>{label}</span>
                </label>
              ))}
            </div>

            {/* Title */}
            <div className={styles.formGroup}>
              <label htmlFor="entry-title" className={styles.formLabel}>Title *</label>
              <input
                ref={titleInputRef}
                id="entry-title"
                type="text"
                className={styles.formInput}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={type === 'countdown' ? 'e.g. Project Launch' : 'Add a title…'}
                required
              />
            </div>

            {/* Description */}
            <div className={styles.formGroup}>
              <label htmlFor="entry-description" className={styles.formLabel}>Description</label>
              <textarea
                id="entry-description"
                className={`${styles.formInput} ${styles.formTextarea}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional details…"
                rows={3}
              />
            </div>

            {/* Color override */}
            <div className={styles.formGroup}>
              <label htmlFor="entry-color" className={styles.formLabel}>Color</label>
              <div className={styles.colorRow}>
                {Object.entries(TYPE_COLORS).map(([t, c]) => (
                  <button
                    key={t}
                    type="button"
                    id={`color-swatch-${t}`}
                    className={`${styles.colorSwatch} ${color === c ? styles.colorSwatchSelected : ''}`}
                    style={{ background: c }}
                    onClick={() => setColor(c)}
                    aria-label={`Color for ${t}`}
                  />
                ))}
                <input
                  id="entry-color"
                  type="color"
                  className={styles.colorPicker}
                  value={color || TYPE_COLORS[type]}
                  onChange={(e) => setColor(e.target.value)}
                  aria-label="Custom color"
                />
              </div>
            </div>

            {/* Actions */}
            <div className={styles.modalActions}>
              {isEditing && onDelete && (
                <button
                  id="modal-delete-btn"
                  type="button"
                  className={styles.btnDanger}
                  onClick={handleDelete}
                >
                  Delete
                </button>
              )}
              <button
                id="modal-cancel-btn"
                type="button"
                className={styles.btnSecondary}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                id="modal-save-btn"
                type="submit"
                className={styles.btnPrimary}
              >
                {isEditing ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  },
);

EventModal.displayName = 'EventModal';
