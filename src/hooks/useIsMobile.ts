'use client';

import { useEffect, useState } from 'react';

/** Matches Tailwind's `sm` breakpoint: "mobile" is anything narrower than 640px. */
const MOBILE_QUERY = '(max-width: 639.98px)';

/**
 * True below Tailwind's `sm` breakpoint. Use it only where the mobile and desktop versions
 * of a component must not both be in the DOM (e.g. an inline panel vs. a bottom sheet that
 * share test ids); for plain styling prefer `sm:` classes.
 *
 * Returns false during SSR and the first client render, then updates after mount.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  return isMobile;
}
