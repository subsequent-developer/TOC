import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, GitBranch, Zap, Layers, History,
  Search, Brain, ChevronLeft, ChevronRight, Activity,
} from 'lucide-react';
import { cn } from '../ui/Card';
import { useAppStore } from '../../store/appStore';

const navItems = [
  { to: '/',        label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/dfa',     label: 'DFA Explorer', icon: GitBranch },
  { to: '/analyze', label: 'Analyze',      icon: Zap },
  { to: '/batch',   label: 'Batch Analyze',icon: Layers },
  { to: '/history', label: 'History',      icon: History },
  { to: '/orders',  label: 'Order Lookup', icon: Search },
  { to: '/ml',      label: 'ML Insights',  icon: Brain },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <aside
      className={cn(
        'flex flex-col bg-gray-950 dark:bg-gray-950 border-r border-gray-800',
        'transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Activity size={16} className="text-white" />
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-bold text-sm leading-tight truncate">TOC Workflow</p>
            <p className="text-gray-500 text-xs truncate">Anomaly Detection</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
              )
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            {!sidebarCollapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-gray-800">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-all"
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
