'use client';

import { useEffect } from 'react';

/**
 * Locks background page scrolling while a modal/overlay is open.
 *
 * Uses the position:fixed technique so it also stops iOS Safari's
 * touch "rubber-band" scrolling of the page behind the overlay — plain
 * `overflow: hidden` on <body> is not enough on iOS. The scroll position
 * is preserved and restored when the lock is released.
 *
 * Intended for hand-rolled `fixed inset-0` modals. Headless UI's <Dialog>
 * already locks scroll on its own, so it does not need this.
 */
export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;

    const { body } = document;
    const scrollY = window.scrollY;
    const original = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    };

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';

    return () => {
      body.style.position = original.position;
      body.style.top = original.top;
      body.style.left = original.left;
      body.style.right = original.right;
      body.style.width = original.width;
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}
