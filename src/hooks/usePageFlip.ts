// ─────────────────────────────────────────────────────────────────────────────
// usePageFlip.ts — Animation state for the 3D page flip
// ─────────────────────────────────────────────────────────────────────────────
'use client';

import { useCallback, useRef, useState } from 'react';

export type FlipPhase = 'idle' | 'flipping-next' | 'flipping-prev';

/** Synthesises a subtle paper-rustle sound via Web Audio API */
function playPageFlipSound(): void {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new AudioContext();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      // Pink-ish noise envelope
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2) * 0.3;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start();
    source.onended = () => ctx.close();
  } catch {
    // Silently fail if audio not available
  }
}

export function usePageFlip(initialMonth: Date) {
  const [currentMonth, setCurrentMonth] = useState<Date>(initialMonth);
  const [phase, setPhase] = useState<FlipPhase>('idle');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const lockRef = useRef(false);

  const flipToNextMonth = useCallback(() => {
    if (lockRef.current) return;
    lockRef.current = true;
    setPhase('flipping-next');
    if (soundEnabled) playPageFlipSound();

    setTimeout(() => {
      setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
      setPhase('idle');
      lockRef.current = false;
    }, 700);
  }, [soundEnabled]);

  const flipToPrevMonth = useCallback(() => {
    if (lockRef.current) return;
    lockRef.current = true;
    setPhase('flipping-prev');
    if (soundEnabled) playPageFlipSound();

    setTimeout(() => {
      setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
      setPhase('idle');
      lockRef.current = false;
    }, 700);
  }, [soundEnabled]);

  return {
    currentMonth,
    phase,
    soundEnabled,
    setSoundEnabled,
    flipToNextMonth,
    flipToPrevMonth,
  };
}
