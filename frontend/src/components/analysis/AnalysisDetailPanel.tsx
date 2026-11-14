import { motion, AnimatePresence } from 'framer-motion';
import { VerdictBadge } from '../ui/Badge';
import { FsmResultCard } from './FsmResultCard';
import { MlResultCard } from './MlResultCard';
import { DiagnosticsCard } from './DiagnosticsCard';
import { formatDate, formatRelativeTime } from '../../lib/formatters';
import type { AnalysisRecord } from '../../types/analysis';
import { X, ExternalLink, Hash, Package } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

interface AnalysisDetailPanelProps {
  record: AnalysisRecord;
  onClose: () => void;
}

export function AnalysisDetailPanel({ record, onClose }: AnalysisDetailPanelProps) {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex"
      >
        {/* Backdrop */}
        <div
          className="flex-1 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="w-full max-w-2xl bg-gray-50 dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 overflow-y-auto flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <VerdictBadge verdict={record.verdict} />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">#{record.id}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(record.created_at)} · {formatRelativeTime(record.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                icon={<ExternalLink size={14} />}
                onClick={() => { navigate(`/analyses/${record.id}`); onClose(); }}
              >
                Full View
              </Button>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4 flex-1">
            {/* Summary */}
            <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{record.summary}</p>
              <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400">
                {record.order_id && (
                  <span className="flex items-center gap-1">
                    <Package size={12} />
                    Order: <code className="font-mono">{record.order_id}</code>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Hash size={12} />
                  Format: {record.input_format}
                </span>
              </div>
            </div>

            {/* Raw input */}
            <div className="bg-gray-900 dark:bg-gray-950 rounded-xl p-4 border border-gray-700 dark:border-gray-800">
              <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">Raw Input</p>
              <code className="text-xs text-emerald-400 font-mono break-all leading-relaxed">
                {Array.isArray(record.raw_input_payload)
                  ? record.raw_input_payload.join(';')
                  : String(record.raw_input_payload)}
              </code>
            </div>

            {/* Result cards */}
            <FsmResultCard fsmEvaluation={record.fsm_evaluation} />
            <MlResultCard mlEvaluation={record.ml_evaluation} skipReason={record.ml_skip_reason} />
            <DiagnosticsCard diagnostics={record.diagnostics} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
