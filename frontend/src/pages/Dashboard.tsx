import { motion } from 'framer-motion';
import {
  Activity, AlertTriangle, CheckCircle, Users,
  Clock,
} from 'lucide-react';
import { MetricCard } from '../components/metrics/MetricCard';
import { VerdictDonutChart } from '../components/metrics/VerdictDonutChart';
import { useMetrics } from '../hooks/useMetrics';
import { useAnalyses } from '../hooks/useAnalyses';
import { VerdictBadge } from '../components/ui/Badge';
import { formatRelativeTime, formatPercent } from '../lib/formatters';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { ErrorBanner } from '../components/ui/ErrorBanner';

export function Dashboard() {
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useMetrics();
  const { data: recent } = useAnalyses({ skip: 0, limit: 8 });

  if (metricsLoading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
  if (metricsError) return <ErrorBanner message="Failed to load metrics. Is the backend running?" className="max-w-xl" />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Real-time overview of TOC workflow anomaly detection
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Analyses"
          value={metrics?.total_analyses.toLocaleString() ?? '—'}
          icon={Activity}
          color="indigo"
          delay={0}
        />
        <MetricCard
          label="Total Anomalies"
          value={metrics?.total_anomalies.toLocaleString() ?? '—'}
          subtext={`${metrics ? formatPercent(metrics.anomaly_rate) : '—'} anomaly rate`}
          icon={AlertTriangle}
          color="red"
          delay={0.07}
        />
        <MetricCard
          label="Normal Analyses"
          value={metrics?.normal_count.toLocaleString() ?? '—'}
          icon={CheckCircle}
          color="emerald"
          delay={0.14}
        />
        <MetricCard
          label="Unique Orders"
          value={metrics?.unique_orders_count.toLocaleString() ?? '—'}
          icon={Users}
          color="sky"
          delay={0.21}
        />
      </div>

      {/* Charts + breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut */}
        <Card padding="md" className="lg:col-span-1">
          <h2 className="section-title mb-1">Verdict Distribution</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Breakdown by verdict type</p>
          {metrics && <VerdictDonutChart metrics={metrics} />}
        </Card>

        {/* Breakdown stats */}
        <Card padding="md" className="lg:col-span-2">
          <h2 className="section-title mb-4">Verdict Breakdown</h2>
          <div className="space-y-3">
            {[
              { label: 'Normal', value: metrics?.normal_count ?? 0, verdict: 'NORMAL' as const, color: 'bg-emerald-500' },
              { label: 'Rule Violations', value: metrics?.rule_violation_count ?? 0, verdict: 'RULE_VIOLATION' as const, color: 'bg-red-500' },
              { label: 'Statistical Anomalies', value: metrics?.statistical_anomaly_count ?? 0, verdict: 'STATISTICAL_ANOMALY' as const, color: 'bg-amber-500' },
              { label: 'Valid Incomplete', value: metrics?.valid_incomplete_count ?? 0, verdict: 'VALID_INCOMPLETE' as const, color: 'bg-sky-500' },
            ].map(({ label, value, verdict, color }) => {
              const pct = metrics?.total_analyses
                ? Math.round((value / metrics.total_analyses) * 100)
                : 0;
              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <VerdictBadge verdict={verdict} size="xs" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 tabular-nums">
                      {value.toLocaleString()} <span className="text-xs text-gray-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
                      className={`h-full rounded-full ${color}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Recent analyses */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h2 className="section-title flex items-center gap-2">
            <Clock size={18} className="text-gray-400" />
            Recent Analyses
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Last {recent?.items.length ?? 0} records
          </span>
        </div>
        {recent && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40">
                  {['ID', 'Order ID', 'Verdict', 'Final State', 'Anomaly', 'Created'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                {recent.items.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-2.5 text-xs font-mono text-gray-400">#{r.id}</td>
                    <td className="px-4 py-2.5 text-xs font-mono text-gray-600 dark:text-gray-400 max-w-[100px] truncate">
                      {r.order_id || '—'}
                    </td>
                    <td className="px-4 py-2.5"><VerdictBadge verdict={r.verdict} size="xs" /></td>
                    <td className="px-4 py-2.5 text-xs font-mono text-gray-500">{r.fsm_evaluation.final_state}</td>
                    <td className="px-4 py-2.5 text-xs font-bold">
                      <span className={r.is_anomaly ? 'text-red-500' : 'text-emerald-500'}>
                        {r.is_anomaly ? '⚠ Yes' : '✓ No'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-400 whitespace-nowrap">
                      {formatRelativeTime(r.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
