import { cn } from './Card';
import type { VerdictType, SeverityType } from '../../types/analysis';
import { verdictConfig, severityConfig } from '../../lib/verdictColors';

interface VerdictBadgeProps {
  verdict: VerdictType;
  size?: 'xs' | 'sm' | 'md';
  showDot?: boolean;
}

export function VerdictBadge({ verdict, size = 'sm', showDot = true }: VerdictBadgeProps) {
  const cfg = verdictConfig[verdict];
  const sizes = { xs: 'text-[10px] px-1.5 py-0.5', sm: 'text-xs px-2 py-1', md: 'text-sm px-3 py-1.5' };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold border',
        cfg.bg, cfg.border, cfg.text,
        sizes[size]
      )}
    >
      {showDot && <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />}
      {cfg.label}
    </span>
  );
}

interface SeverityBadgeProps {
  severity: SeverityType;
  size?: 'xs' | 'sm' | 'md';
}

export function SeverityBadge({ severity, size = 'sm' }: SeverityBadgeProps) {
  const cfg = severityConfig[severity];
  const sizes = { xs: 'text-[10px] px-1.5 py-0.5', sm: 'text-xs px-2 py-1', md: 'text-sm px-3 py-1.5' };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold border',
        cfg.bg, cfg.border, cfg.text,
        sizes[size]
      )}
    >
      <span>{cfg.icon}</span>
      {severity}
    </span>
  );
}
