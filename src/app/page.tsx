// ─────────────────────────────────────────────────────────────────────────────
// page.tsx — Entry point: renders the WallCalendar component
// ─────────────────────────────────────────────────────────────────────────────
import { WallCalendar } from '@/components/WallCalendar';

/**
 * Home page — renders the interactive 3D wall calendar.
 * The WallCalendar component is self-contained and handles all state
 * internally, persisting data to localStorage.
 */
export default function HomePage() {
  return (
    <main>
      <h1 className="sr-only">Interactive 3D Wall Calendar</h1>
      <WallCalendar />
    </main>
  );
}
