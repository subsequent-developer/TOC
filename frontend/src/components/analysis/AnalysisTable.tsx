import { useState } from 'react';
import { VerdictBadge } from '../ui/Badge';
import { formatRelativeTime } from '../../lib/formatters';
import type { AnalysisRecord } from '../../types/analysis';
import { VERDICTS } from '../../lib/constants';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Button } from '../ui/Button';
import { AnalysisDetailPanel } from './AnalysisDetailPanel';
import { EmptyState } from '../ui/EmptyState';
import { Spinner } from '../ui/Spinner';

interface AnalysisTableProps {
  items: AnalysisRecord[];
  total: number;
  skip: number;
  limit: number;
  isLoading: boolean;
  onPageChange: (skip: number) => void;
  onVerdictFilter: (v: string | null) => void;
  onAnomalyFilter: (v: boolean | null) => void;
  verdictFilter: string | null;
  anomalyFilter: boolean | null;
}

export function AnalysisTable({
  items, total, skip, limit, isLoading,
  onPageChange, onVerdictFilter, onAnomalyFilter,
  verdictFilter, anomalyFilter,
}: AnalysisTableProps) {
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null);
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(skip / limit) + 1;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <Filter size={12} />
          <span>Filter:</span>
        </div>
        <select
          className="text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={verdictFilter ?? ''}
          onChange={(e) => onVerdictFilter(e.target.value || null)}
        >
          <option value="">All Verdicts</option>
          {VERDICTS.map((v) => (
            <option key={v} value={v}>{v.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <select
          className="text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={anomalyFilter === null ? '' : String(anomalyFilter)}
          onChange={(e) =>
            onAnomalyFilter(e.target.value === '' ? null : e.target.value === 'true')
          }
        >
          <option value="">All</option>
          <option value="true">Anomalies Only</option>
          <option value="false">Normal Only</option>
        </select>
        <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">{total} records</span>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No analyses found"
            description="Try adjusting filters or submit some traces first."
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60">
                {['ID', 'Order ID', 'Verdict', 'Is Anomaly', 'Final State', 'Steps', 'Created'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {items.map((record) => (
                <tr
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                    #{record.id}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
                    {record.order_id || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <VerdictBadge verdict={record.verdict} size="xs" />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold ${record.is_anomaly ? 'text-red-500' : 'text-emerald-500'}`}>
                      {record.is_anomaly ? '⚠ Yes' : '✓ No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">
                    {record.fsm_evaluation.final_state}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 text-center">
                    {record.fsm_evaluation.total_steps}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {formatRelativeTime(record.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="xs"
              icon={<ChevronLeft size={12} />}
              disabled={skip === 0}
              onClick={() => onPageChange(Math.max(0, skip - limit))}
            >
              Prev
            </Button>
            <Button
              variant="secondary"
              size="xs"
              onClick={() => onPageChange(skip + limit)}
              disabled={skip + limit >= total}
            >
              Next <ChevronRight size={12} />
            </Button>
          </div>
        </div>
      )}

      {/* Detail panel */}
      {selectedRecord && (
        <AnalysisDetailPanel
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
}
