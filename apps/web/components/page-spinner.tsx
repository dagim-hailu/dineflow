'use client';

import { useEffect, useState } from 'react';

/** Brief full-screen loader — Tailwind only, no Bootstrap. */
export function PageSpinner() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(false));
    return () => cancelAnimationFrame(t);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div
        className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary"
        aria-hidden
      />
    </div>
  );
}
