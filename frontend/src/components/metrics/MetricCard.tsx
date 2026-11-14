import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import { cn } from '../ui/Card';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  color: 'indigo' | 'emerald' | 'red' | 'amber' | 'sky';
  delay?: number;
}

const colorMap = {
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    icon: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400',
    value: 'text-indigo-700 dark:text-indigo-300',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    icon: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400',
    value: 'text-emerald-700 dark:text-emerald-300',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950/40',
    icon: 'bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-400',
    value: 'text-red-700 dark:text-red-300',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    icon: 'bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400',
    value: 'text-amber-700 dark:text-amber-300',
  },
  sky: {
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    icon: 'bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-400',
    value: 'text-sky-700 dark:text-sky-300',
  },
};

export function MetricCard({ label, value, subtext, icon: Icon, color, delay = 0 }: MetricCardProps) {
  const c = colorMap[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn('rounded-xl p-5 border border-transparent', c.bg)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', c.icon)}>
          <Icon size={20} />
        </div>
      </div>
      <div className={cn('text-3xl font-bold tabular-nums mb-0.5', c.value)}>{value}</div>
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</div>
      {subtext && <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{subtext}</div>}
    </motion.div>
  );
}
