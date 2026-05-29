import React from 'react';

export const WineGlassIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2C13.1 2 14 2.9 14 4V7.5C14 9.43 12.43 11 10.5 11H10V13C10 14.1 10.9 15 12 15C13.1 15 14 14.1 14 13V11H13.5C11.57 11 10 9.43 10 7.5V4C10 2.9 10.9 2 12 2ZM7 4V7.5C7 10.54 9.46 13 12.5 13C15.54 13 18 10.54 18 7.5V4C18 2.9 17.1 2 16 2H8C6.9 2 6 2.9 6 4V7.5C6 10.54 8.46 13 11.5 13C14.54 13 17 10.54 17 7.5V4C17 2.9 16.1 2 15 2H9C7.9 2 7 2.9 7 4ZM12 17C10.34 17 9 18.34 9 20H15C15 18.34 13.66 17 12 17Z" />
  </svg>
);

export const HighChairIcon = (props: React.SVGProps<SVGSVGElement>) => (
  // Side-view baby high chair: backrest, seat, front tray, splayed legs + footrest.
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <rect x="7" y="3" width="2.4" height="8" rx="1.2" />
    <rect x="7" y="9.6" width="7.5" height="2.2" rx="1" />
    <rect x="12.6" y="7" width="2.2" height="2.4" rx="0.6" />
    <path d="M7.7 11.4 5.4 21h2l1.7-9.6H7.7z" />
    <path d="M13.3 11.4 15.6 21h-2l-1.7-9.6h1.4z" />
    <rect x="7" y="16" width="6" height="1.6" rx="0.8" />
  </svg>
);

export const HalalBadgeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}>
    <circle cx="16" cy="16" r="15" fill="#34D399" stroke="#059669" strokeWidth="2"/>
    <text x="16" y="21" textAnchor="middle" fontSize="14" fontFamily="Arial, sans-serif" fill="white" fontWeight="bold">حلال</text>
  </svg>
);

export const PartiallyHalalBadgeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}>
    <defs>
      <linearGradient id="half" x1="0" y1="0" x2="32" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="50%" stopColor="#34D399" />
        <stop offset="50%" stopColor="#D1D5DB" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="15" fill="url(#half)" stroke="#059669" strokeWidth="2"/>
    <text x="16" y="21" textAnchor="middle" fontSize="14" fontFamily="Arial, sans-serif" fill="#059669" fontWeight="bold">حلال</text>
  </svg>
);

export const OutdoorSeatingIcon = (props: React.SVGProps<SVGSVGElement>) => (
  // Patio umbrella over a bistro table — the universal "outdoor seating" cue.
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2c4.4 0 8 2.6 8.6 5.9.1.4-.2.8-.6.8H4c-.4 0-.7-.4-.6-.8C4 4.6 7.6 2 12 2z" />
    <rect x="11.5" y="8.5" width="1" height="13" rx="0.5" />
    <rect x="6.5" y="13.6" width="11" height="1.8" rx="0.9" />
  </svg>
);

export const MosqueIcon = (props: React.SVGProps<SVGSVGElement>) => (
  // Dome + minarets + arched doorway — clearly reads as a prayer space.
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    {/* minarets */}
    <rect x="3" y="9" width="2" height="12" rx="0.5" />
    <path d="M4 6.4 5.3 9H2.7L4 6.4z" />
    <rect x="19" y="9" width="2" height="12" rx="0.5" />
    <path d="M20 6.4 21.3 9h-2.6L20 6.4z" />
    {/* hall with arched doorway */}
    <path d="M6 21V11h12v10h-3v-4a3 3 0 0 0-6 0v4H6z" />
    {/* onion dome */}
    <path d="M12 3.4c2 2 3.5 4 3.5 5.5 0 1.5-1.6 2.1-3.5 2.1S8.5 10.4 8.5 8.9c0-1.5 1.5-3.5 3.5-5.5z" />
    {/* finial */}
    <rect x="11.6" y="1.5" width="0.8" height="2.2" rx="0.4" />
  </svg>
);

/** Facebook-style heart: symmetrical, rounded lobes, pointed bottom. Use fill for filled state, stroke for outline. */
export const HeartIcon = ({ fill = '#ef4444', stroke = 'none', ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={stroke !== 'none' ? 1.5 : undefined} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

export const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

export const PhotoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="8.5" cy="10.5" r="1.5" />
    <path d="M21 15l-5-5a2 2 0 0 0-2.8 0l-5.2 5.2" />
  </svg>
);

export const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M19 9l-7 7-7-7" />
  </svg>
);

export const ChevronUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M5 15l7-7 7 7" />
  </svg>
);

export const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M15 19l-7-7 7-7" />
  </svg>
);

export const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M9 5l7 7-7 7" />
  </svg>
);

export const ExclamationTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M12 9v4m0 4h.01M21.8 18.4l-8-14a2 2 0 0 0-3.6 0l-8 14A2 2 0 0 0 4 22h16a2 2 0 0 0 1.8-3.6z" />
  </svg>
); 