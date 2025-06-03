import React from 'react';

export const WineGlassIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2C13.1 2 14 2.9 14 4V7.5C14 9.43 12.43 11 10.5 11H10V13C10 14.1 10.9 15 12 15C13.1 15 14 14.1 14 13V11H13.5C11.57 11 10 9.43 10 7.5V4C10 2.9 10.9 2 12 2ZM7 4V7.5C7 10.54 9.46 13 12.5 13C15.54 13 18 10.54 18 7.5V4C18 2.9 17.1 2 16 2H8C6.9 2 6 2.9 6 4V7.5C6 10.54 8.46 13 11.5 13C14.54 13 17 10.54 17 7.5V4C17 2.9 16.1 2 15 2H9C7.9 2 7 2.9 7 4ZM12 17C10.34 17 9 18.34 9 20H15C15 18.34 13.66 17 12 17Z" />
  </svg>
);

export const HighChairIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <rect x="7" y="2" width="10" height="4" rx="2" className="fill-yellow-400" />
    <rect x="9" y="6" width="6" height="8" rx="2" className="fill-yellow-300" />
    <rect x="8" y="14" width="2" height="6" className="fill-yellow-600" />
    <rect x="14" y="14" width="2" height="6" className="fill-yellow-600" />
    <rect x="11" y="14" width="2" height="4" className="fill-yellow-500" />
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
  <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}>
    <ellipse cx="16" cy="10" rx="10" ry="4" fill="#FBBF24" />
    <rect x="15" y="10" width="2" height="10" fill="#A3A3A3" />
    <rect x="10" y="20" width="12" height="2" rx="1" fill="#6B7280" />
    <rect x="12" y="22" width="2" height="4" rx="1" fill="#6B7280" />
    <rect x="18" y="22" width="2" height="4" rx="1" fill="#6B7280" />
  </svg>
); 

export const HeartIcon = ({ fill = '#ef4444', stroke = 'none', ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M16.5 3.75a5.25 5.25 0 0 1 3.713 8.888l-7.213 7.212-7.213-7.212A5.25 5.25 0 1 1 12 6.75a5.25 5.25 0 0 1 4.5-3z" />
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

export const ExclamationTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M12 9v4m0 4h.01M21.8 18.4l-8-14a2 2 0 0 0-3.6 0l-8 14A2 2 0 0 0 4 22h16a2 2 0 0 0 1.8-3.6z" />
  </svg>
); 