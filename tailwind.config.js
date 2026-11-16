/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: 'var(--surface)',
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          muted: 'var(--accent-muted)',
        },
        halal: {
          DEFAULT: 'var(--halal)',
          muted: 'var(--halal-muted)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        'design': 'var(--radius)',
        'design-lg': 'var(--radius-lg)',
      },
      boxShadow: {
        'soft': 'var(--shadow-sm)',
        'soft-md': 'var(--shadow-md)',
        'soft-lg': 'var(--shadow-lg)',
      },
      // Enter-only animations for ConfirmationDialog (it unmounts instantly on close).
      keyframes: {
        'dialog-overlay-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'dialog-panel-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        // Mobile bottom sheet (filters) slides up from the bottom edge.
        'sheet-in': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
      },
      animation: {
        'dialog-overlay-in': 'dialog-overlay-in 300ms ease-out',
        'dialog-panel-in': 'dialog-panel-in 300ms ease-out',
        'sheet-in': 'sheet-in 250ms ease-out',
      },
    },
  },
  plugins: [],
} 