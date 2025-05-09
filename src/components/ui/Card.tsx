import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: boolean;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> & {
  Header: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  Title: React.FC<React.HTMLAttributes<HTMLHeadingElement>>;
  Description: React.FC<React.HTMLAttributes<HTMLParagraphElement>>;
  Content: React.FC<React.HTMLAttributes<HTMLDivElement>>;
} = ({
  children,
  className = '',
  padding = true,
  hoverable = false,
  ...props
}) => (
  <div
    className={clsx(
      'bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-300 overflow-hidden',
      padding && 'p-4',
      hoverable && 'hover:shadow-lg hover:-translate-y-1',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

Card.Header = ({ children, className = '', ...props }) => (
  <div className={clsx('px-4 py-2 border-b border-gray-100 bg-white', className)} {...props}>{children}</div>
);
Card.Title = ({ children, className = '', ...props }) => (
  <h2 className={clsx('text-lg font-bold text-gray-900', className)} {...props}>{children}</h2>
);
Card.Description = ({ children, className = '', ...props }) => (
  <p className={clsx('text-sm text-gray-600', className)} {...props}>{children}</p>
);
Card.Content = ({ children, className = '', ...props }) => (
  <div className={clsx('p-4', className)} {...props}>{children}</div>
);

Card.Header.displayName = 'Card.Header';
Card.Title.displayName = 'Card.Title';
Card.Description.displayName = 'Card.Description';
Card.Content.displayName = 'Card.Content';

export default Card; 