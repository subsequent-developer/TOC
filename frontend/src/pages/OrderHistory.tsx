import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Package,
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { VerdictBadge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { useOrderHistory } from '../hooks/useOrderHistory';
import { formatRelativeTime } from '../lib/formatters';
import { cn } from '../components/ui/Card';

export function OrderHistory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(initialQuery ? initialQuery.trim() : null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data, isLoading, isFetching } = useOrderHistory(activeOrderId);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchTerm(q);
      setActiveOrderId(q.trim());
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    const clean = searchTerm.trim();
    setActiveOrderId(clean);
    setSearchParams({ q: clean });
  };

  const sampleOrders = ['ORD-101', 'ORD-102', 'ORD-103', 'ORD-104', 'ORD-105', 'ORD-20241114-001'];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Package className="text-indigo-600 dark:text-indigo-400" />
          <span>Order Trace History & Lifecycle Audit</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Look up an individual order to inspect its chronological audit trail, state transitions, and anomaly diagnoses
        </p>
      </div>

      {/* Search Bar Card */}
      <Card padding="md" className="space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Order ID (e.g. ORD-101)..."
              className="input-base pl-9 text-sm"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isFetching}
            icon={<Search size={14} />}
          >
            Search Order
          </Button>
        </form>

        <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
          <span>Try quick sample:</span>
          {sampleOrders.map((ord) => (
            <button
              key={ord}
              type="button"
              onClick={() => {
                setSearchTerm(ord);
                setActiveOrderId(ord);
                setSearchParams({ q: ord });
              }}
              className="font-mono text-indigo-600 dark:text-indigo-400 hover:underline px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900"
            >
              {ord}
            </button>
          ))}
        </div>
      </Card>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      )}

      {/* Result list */}
      {!isLoading && activeOrderId && (
        <div className="space-y-6">
          {data && data.analyses.length > 0 ? (
            <>
              {/* Order Overview Summary */}
              <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold font-mono text-gray-900 dark:text-gray-100">
                      {data.order_id}
                    </h2>
                    <span className="text-xs text-gray-400">({data.returned_count} audit traces)</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Chronological lifecycle executions recorded for this order identifier
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block">Latest Status:</span>
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {data.analyses[data.analyses.length - 1].fsm_evaluation.final_state}
                    </span>
                  </div>
                  <VerdictBadge
                    verdict={data.analyses[data.analyses.length - 1].verdict}
                    size="sm"
                  />
                </div>
              </div>

              {/* Chronological Timeline */}
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-800">
                {data.analyses.map((analysis, index) => {
                  const isExpanded = expandedId === analysis.id;
                  const rawString = Array.isArray(analysis.raw_input_payload)
                    ? analysis.raw_input_payload.join(';')
                    : String(analysis.raw_input_payload);

                  return (
                    <motion.div
                      key={analysis.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative pl-10"
                    >
                      {/* Timeline Node Dot */}
                      <div
                        className={cn(
                          'absolute left-2.5 top-5 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white dark:border-gray-950 flex items-center justify-center',
                          analysis.is_anomaly ? 'bg-red-500' : 'bg-emerald-500'
                        )}
                      />

                      <Card padding="md" className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold text-gray-400">
                              Trace #{index + 1}
                            </span>
                            <VerdictBadge verdict={analysis.verdict} size="xs" />
                            <span className="text-xs text-gray-500 font-medium">
                              Final State: <code className="font-mono font-bold text-gray-700 dark:text-gray-300">{analysis.fsm_evaluation.final_state}</code>
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {formatRelativeTime(analysis.created_at)}
                            </span>
                            <Button
                              variant="ghost"
                              size="xs"
                              icon={<ExternalLink size={12} />}
                              onClick={() => navigate(`/analyses/${analysis.id}`)}
                            >
                              Inspect
                            </Button>
                          </div>
                        </div>

                        {/* Summary & Event Preview */}
                        <p className="text-sm text-gray-700 dark:text-gray-300">{analysis.summary}</p>

                        <div className="p-2.5 bg-gray-50 dark:bg-gray-800/60 rounded-lg text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
                          {rawString}
                        </div>

                        {/* Diagnostics Expand Toggle */}
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : analysis.id)}
                          className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 hover:underline pt-1"
                        >
                          <span>{isExpanded ? 'Hide Diagnostics' : 'View Operational Remediation'}</span>
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>

                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2 text-xs"
                          >
                            <div className="p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-300">
                              <p className="font-semibold mb-1">Recommended Action:</p>
                              <p>{analysis.diagnostics.recommended_action}</p>
                            </div>
                          </motion.div>
                        )}
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </>
          ) : (
            <EmptyState
              icon={<Package size={28} />}
              title={`No trace records found for "${activeOrderId}"`}
              description="This order has not been submitted yet or has a different ID."
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/analyze')}
                >
                  Analyze Trace for this Order
                </Button>
              }
            />
          )}
        </div>
      )}

      {!activeOrderId && !isLoading && (
        <EmptyState
          icon={<Search size={28} />}
          title="Search for an Order Trace"
          description="Enter an order ID above or click one of the quick samples to inspect its lifecycle history."
        />
      )}
    </div>
  );
}
