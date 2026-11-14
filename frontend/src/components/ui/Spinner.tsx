import { Loader2 } from 'lucide-react';
import { cn } from './Card';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = { sm: 16, md: 24, lg: 36 };
  return (
    <Loader2
      size={sizes[size]}
      className={cn('animate-spin text-indigo-500', className)}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-3">
        <Spinner size="lg" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
