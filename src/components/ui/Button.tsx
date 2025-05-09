import React from 'react';
import clsx from 'clsx';
import { XMarkIcon } from '@heroicons/react/24/outline';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'info' | 'success' | 'neutral' | 'outline' | 'ghost' | 'rose' | 'amber';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const base = 'rounded-lg font-semibold focus:outline-none focus:ring-2 transition-all duration-150 active:scale-95';
const variants: Record<ButtonVariant, string> = {
  primary: 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400',
  danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400',
  info: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400',
  success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-400',
  neutral: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-300',
  outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-300',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-200',
  rose: 'bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-400',
  amber: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500',
};
const sizes: Record<ButtonSize, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
  icon: 'p-1.5 text-base',
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
      'text-gray-400 hover:text-gray-600 p-1 rounded focus:ring-1 focus:ring-orange-400',
      className
    )}
    {...props}
  >
    <XMarkIcon className="h-5 w-5" />
  </button>
);

export default Button; 