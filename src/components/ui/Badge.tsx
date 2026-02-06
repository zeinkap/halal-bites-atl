import React from 'react';
import clsx from 'clsx';

export type BadgeColor = 'blue' | 'green' | 'yellow' | 'orange' | 'gray' | 'pink' | 'teal';
export type BadgeSize = 'xs' | 'sm' | 'md';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
  size?: BadgeSize;
}

const colorMap: Record<BadgeColor, string> = {
  blue: 'bg-blue-50 text-blue-700 border border-blue-100',
  green: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  yellow: 'bg-amber-50 text-amber-700 border border-amber-100',
  orange: 'bg-orange-50 text-orange-700 border border-orange-100',
  gray: 'bg-stone-100 text-stone-700 border border-stone-200',
  pink: 'bg-pink-50 text-pink-700 border border-pink-100',
  teal: 'bg-teal-50 text-teal-700 border border-teal-100',
};
const sizeMap: Record<BadgeSize, string> = {
  xs: 'px-2 py-0.5 text-xs',
  sm: 'px-2.5 py-1 text-sm',
  md: 'px-3 py-1.5 text-base',
};

export const Badge: React.FC<BadgeProps> = ({
  color = 'gray',
  size = 'xs',
  className = '',
  children,
  ...props
}) => (
  <span
    className={clsx('rounded-lg font-medium', colorMap[color], sizeMap[size], className)}
    {...props}
  >
    {children}
  </span>
);

export default Badge;
