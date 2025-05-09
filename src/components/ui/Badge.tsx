import React from 'react';
import clsx from 'clsx';

export type BadgeColor = 'blue' | 'green' | 'yellow' | 'orange' | 'gray' | 'pink';
export type BadgeSize = 'xs' | 'sm' | 'md';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
  size?: BadgeSize;
}

const colorMap: Record<BadgeColor, string> = {
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  orange: 'bg-orange-100 text-orange-800',
  gray: 'bg-gray-100 text-gray-800',
  pink: 'bg-pink-100 text-pink-700',
};
const sizeMap: Record<BadgeSize, string> = {
  xs: 'px-2 py-0.5 text-xs',
  sm: 'px-2 py-1 text-sm',
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
    className={clsx('rounded-full font-semibold', colorMap[color], sizeMap[size], className)}
    {...props}
  >
    {children}
  </span>
);

export default Badge; 