import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Hash,
  Package,
  Copy,
  Check,
  GitBranch,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAnalysis } from '../hooks/useAnalysis';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { VerdictBadge, SeverityBadge } from '../components/ui/Badge';
import { FsmResultCard } from '../components/analysis/FsmResultCard';
import { MlResultCard } from '../components/analysis/MlResultCard';
import { DiagnosticsCard } from '../components/analysis/DiagnosticsCard';
import { Spinner } from '../components/ui/Spinner';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { formatDate, formatRelativeTime } from '../lib/formatters';
import { verdictConfig } from '../lib/verdictColors';
import { cn } from '../components/ui/Card';

export function AnalysisDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const numericId = id ? parseInt(id, 10) : null;
  const { data: record, isLoading, error } = useAnalysis(numericId);
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="max-w-xl mx-auto py-12 space-y-4">
        <ErrorBanner message={`Failed to load analysis record #${id}. It may not exist.`} />
        <Button variant="secondary" onClick={() => navigate('/history')} icon={<ArrowLeft size={14} />}>
          Back to History
        </Button>
      </div>
    );
  }

  const rawString = Array.isArray(record.raw_input_payload)
    ? record.raw_input_payload.join(';')
    : String(record.raw_input_payload);

  const copyRaw = () => {
    navigator.clipboard.writeText(rawString);
    setCopied(true);
    toast.success('Trace copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const vConfig = verdictConfig[record.verdict];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/history')}
          icon={<ArrowLeft size={16} />}
        >
          Back to History
        </Button>

        <Button
          variant="secondary"
          size="sm"
          icon={<GitBranch size={15} />}
          onClick={() => navigate('/dfa')}
        >
          Explore in DFA
        </Button>
      </div>

      {/* Main Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('p-6 rounded-2xl border shadow-sm', vConfig.bg, vConfig.border)}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-sm font-mono font-bold text-gray-500">Record #{record.id}</span>
              <VerdictBadge verdict={record.verdict} size="md" />
              <SeverityBadge severity={record.diagnostics.severity} size="sm" />
            </div>
            <h1 className={cn('text-xl font-bold leading-relaxed', vConfig.text)}>
              {record.summary}
            </h1>
          </div>

          <div className="flex flex-col items-end text-xs text-gray-500 space-y-1">
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar size={13} />
              <span>{formatDate(record.created_at)}</span>
            </div>
            <span className="text-gray-400">({formatRelativeTime(record.created_at)})</span>
          </div>
        </div>

        {/* Metadata pills */}
        <div className="mt-4 pt-4 border-t border-gray-200/60 dark:border-gray-800/60 flex flex-wrap gap-4 text-xs">
          {record.order_id && (
            <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
              <Package size={14} className="text-gray-400" />
              <span>Order ID:</span>
              <span
                onClick={() => navigate(`/orders?q=${encodeURIComponent(record.order_id!)}`)}
                className="font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {record.order_id}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
            <Hash size={14} className="text-gray-400" />
            <span>Format:</span>
            <span className="font-mono">{record.input_format}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
            <span>Anomaly Status:</span>
            <span className={record.is_anomaly ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>
              {record.is_anomaly ? 'ANOMALOUS' : 'NORMAL'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Raw Input Payload Card */}
      <Card padding="md" className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="label-base mb-0">Verbatim Trace Input Payload</label>
          <button
            type="button"
            onClick={copyRaw}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            <span>{copied ? 'Copied!' : 'Copy Trace'}</span>
          </button>
        </div>
        <div className="p-3 bg-gray-900 dark:bg-black rounded-lg border border-gray-800 font-mono text-xs text-emerald-400 break-all leading-relaxed">
          {rawString}
        </div>
      </Card>

      {/* Analysis Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FsmResultCard fsmEvaluation={record.fsm_evaluation} />
        <MlResultCard mlEvaluation={record.ml_evaluation} skipReason={record.ml_skip_reason} />
        <DiagnosticsCard diagnostics={record.diagnostics} />
      </div>
    </div>
  );
}
