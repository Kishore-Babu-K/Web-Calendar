// ─────────────────────────────────────────────────────────────────────────────
// layout.tsx — Root layout with SEO meta and font loading
// ─────────────────────────────────────────────────────────────────────────────
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wall Calendar — Interactive 3D Planner',
  description:
    'A interactive 3D wall calendar with page-flip animation, date range selection, notes, countdowns, and event tracking. Built with Next.js and vanilla CSS.',
  keywords: ['calendar', 'planner', 'wall calendar', '3D flip', 'events', 'countdown'],
  authors: [{ name: 'Wall Calendar App' }],
  openGraph: {
    title: 'Interactive 3D Wall Calendar',
    description: 'Plan your month with a beautiful, interactive wall calendar.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1a1a2e',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
