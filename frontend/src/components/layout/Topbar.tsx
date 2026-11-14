import { useLocation } from 'react-router-dom';
import { Moon, Sun, Wifi, WifiOff } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useHealth } from '../../hooks/useHealth';
import { cn } from '../ui/Card';

const PAGE_TITLES: Record<string, string> = {
  '/':        'Dashboard',
  '/dfa':     'DFA Explorer',
  '/analyze': 'Analyze Trace',
  '/batch':   'Batch Analyze',
  '/history': 'Analysis History',
  '/orders':  'Order Lookup',
  '/ml':      'ML Insights',
};

export function Topbar() {
  const { darkMode, toggleDarkMode } = useAppStore();
  const { pathname } = useLocation();
  const { data: health, isError } = useHealth();

  // Match dynamic routes too
  const title = Object.entries(PAGE_TITLES).find(([path]) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path)
  )?.[1] ?? 'TOC Workflow';

  const isOperational = health?.service_status === 'OPERATIONAL';

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
      <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Backend health indicator */}
        <div
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
            isError
              ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
              : isOperational
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400'
          )}
        >
          {isError ? <WifiOff size={12} /> : <Wifi size={12} />}
          {isError ? 'Offline' : isOperational ? 'Operational' : 'Degraded'}
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
