'use client';

import React from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Sticky footer, e.g. "Clear all" + "Show results". */
  footer?: React.ReactNode;
  'data-testid'?: string;
}

/**
 * A mobile bottom sheet: slides up from the bottom edge, at most 85% of the screen tall,
 * with a scrollable body and an optional sticky footer that clears the home indicator.
 *
 * Headless UI handles focus trapping, Escape, backdrop taps and the scroll lock. Like
 * ConfirmationDialog it uses no Headless UI transition (closing in the same frame it opens
 * can leave a transitioned dialog mounted and invisible); the slide-in is plain CSS on mount.
 */
export function BottomSheet({ open, onClose, title, children, footer, ...rest }: BottomSheetProps) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/40 animate-dialog-overlay-in motion-reduce:animate-none" />
      <div className="fixed inset-x-0 bottom-0 flex justify-center">
        <DialogPanel
          className="w-full max-h-[85dvh] flex flex-col bg-white rounded-t-3xl shadow-2xl animate-sheet-in motion-reduce:animate-none"
          data-testid={rest['data-testid']}
        >
          {/* Grab handle + title row */}
          <div className="flex-shrink-0 pt-2.5 px-4">
            <div className="mx-auto h-1.5 w-10 rounded-full bg-stone-300" aria-hidden="true" />
            <div className="flex items-center justify-between py-2">
              <DialogTitle className="text-lg font-bold text-stone-900">{title}</DialogTitle>
              <button
                type="button"
                onClick={onClose}
                className="-mr-2 h-11 w-11 inline-flex items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                aria-label={`Close ${title.toLowerCase()}`}
                data-testid="bottom-sheet-close"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pb-4">{children}</div>

          {footer && (
            <div
              className="flex-shrink-0 border-t border-stone-100 px-4 pt-3"
              style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
            >
              {footer}
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
