// ─────────────────────────────────────────────────────────────────────────────
// BindingRings.tsx — Decorative spiral-binding rings at the top of the calendar
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';
import styles from './WallCalendar.module.css';

interface BindingRingsProps {
  count?: number;
}

/**
 * Renders a row of metallic spiral-binding rings rendered in SVG
 * to give the calendar a realistic physical look.
 */
export const BindingRings: React.FC<BindingRingsProps> = ({ count = 14 }) => {
  return (
    <div className={styles.bindingContainer} aria-hidden="true">
      {/* Nail / hook at center top */}
      <div className={styles.nail}>
        <div className={styles.nailHead} />
        <div className={styles.nailShaft} />
        <div className={styles.nailHook} />
      </div>

      {/* Binding bar */}
      <div className={styles.bindingBar}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className={styles.ring}>
            <div className={styles.ringOuter} />
            <div className={styles.ringInner} />
          </div>
        ))}
      </div>
    </div>
  );
};
