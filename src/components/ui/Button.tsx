import React from 'react';
import clsx from 'clsx';
import { XMarkIcon } from '@heroicons/react/24/outline';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'info' | 'success' | 'neutral' | 'outline' | 'ghost' | 'rose' | 'amber' | 'donate';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const base = 'rounded-xl font-semibold focus:outline-none focus:ring-2 transition-all duration-200 active:scale-[0.98]';
const variants: Record<ButtonVariant, string> = {
  primary: 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 shadow-soft',
  secondary: 'bg-stone-100 text-stone-700 hover:bg-stone-200 focus:ring-stone-400',
  danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400',
  info: 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500',
  neutral: 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-50 focus:ring-stone-300',
  outline: 'border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 focus:ring-teal-500/30',
  ghost: 'bg-transparent text-stone-700 hover:bg-stone-100 focus:ring-stone-200',
  rose: 'bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-400',
  amber: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500',
  donate: 'bg-gradient-to-r from-rose-400 to-amber-400 text-white hover:from-rose-500 hover:to-amber-500 focus:ring-rose-400/50 shadow-soft',
};
const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
  icon: 'p-2.5 text-base',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => (
  <button
    className={clsx(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
    {...props}
  />
);

export const CloseButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', ...props }) => (
  <button
    type="button"
    aria-label="Close"
    className={clsx(
      'text-stone-400 hover:text-stone-600 p-1 rounded-lg focus:ring-1 focus:ring-teal-400',
      className
    )}
    {...props}
  >
    <XMarkIcon className="h-5 w-5" />
  </button>
);

export default Button; 