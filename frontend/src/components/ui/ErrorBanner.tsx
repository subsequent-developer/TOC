import { AlertTriangle } from 'lucide-react';
import { cn } from './Card';

interface ErrorBannerProps {
  message: string;
  className?: string;
}

export function ErrorBanner({ message, className }: ErrorBannerProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800',
        className
      )}
    >
      <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
      <p className="text-sm text-red-700 dark:text-red-400">{message}</p>
    </div>
  );
}
