import { type ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, className, hover, onClick, padding = 'md' }: CardProps) {
  const padMap = { none: '', sm: 'p-3', md: 'p-5', lg: 'p-6' };
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800',
        hover && 'transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer',
        onClick && 'cursor-pointer',
        padMap[padding],
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
