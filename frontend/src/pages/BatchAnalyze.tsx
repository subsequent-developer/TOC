import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Layers,
  Upload,
  Download,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { VerdictBadge } from '../components/ui/Badge';
import { FsmResultCard } from '../components/analysis/FsmResultCard';
import { MlResultCard } from '../components/analysis/MlResultCard';
import { DiagnosticsCard } from '../components/analysis/DiagnosticsCard';
import { useBatchAnalyze } from '../hooks/useBatchAnalyze';
import { formatPercent, formatScore } from '../lib/formatters';
import type { BatchAnalysisResponse } from '../types/analysis';
import { cn } from '../components/ui/Card';

const SAMPLE_BATCH = [
  '# Sample 1: Happy path linear completion\nORD-101: CONFIRM_PAYMENT;PACK_ITEMS;SHIP_ITEMS;DELIVER_ITEMS',
  '# Sample 2: Payment retry loop with eventual fulfillment\nORD-102: FAIL_PAYMENT;RETRY_PAYMENT;CONFIRM_PAYMENT;PACK_ITEMS;SHIP_ITEMS;DELIVER_ITEMS',
  '# Sample 3: Customer early cancellation before payment\nORD-103: CANCEL_ORDER',
  '# Sample 4: Structural FSM rule violation (skipping packaging)\nORD-104: CONFIRM_PAYMENT;SHIP_ITEMS;DELIVER_ITEMS',
  '# Sample 5: High-friction statistical anomaly (excessive payment retries)\nORD-105: FAIL_PAYMENT;RETRY_PAYMENT;FAIL_PAYMENT;RETRY_PAYMENT;FAIL_PAYMENT;RETRY_PAYMENT;CONFIRM_PAYMENT;PACK_ITEMS;SHIP_ITEMS;DELIVER_ITEMS',
  '# Sample 6: In-progress order currently in warehouse\nORD-106: CONFIRM_PAYMENT;PACK_ITEMS',
].join('\n\n');

export function BatchAnalyze() {
  const [inputText, setInputText] = useState<string>(SAMPLE_BATCH);
  const [response, setResponse] = useState<BatchAnalysisResponse | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  const { mutateAsync, isPending } = useBatchAnalyze();

  const handleRunBatch = async () => {
    const lines = inputText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('#'));

    if (lines.length === 0) {
      toast.error('Please enter at least one workflow trace.');
      return;
    }

    if (lines.length > 500) {
      toast.error('Batch size limit is 500 traces.');
      return;
    }

    const tracesPayload = lines.map((line) => {
      // Check if format is "ORDER_ID: EVENT1;EVENT2..."
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0 && !line.startsWith('{')) {
        const orderId = line.substring(0, colonIdx).trim();
        const seq = line.substring(colonIdx + 1).trim();
        return { order_id: orderId, event_sequence: seq };
      }
      return line;
    });

    try {
      const res = await mutateAsync({ traces: tracesPayload });
      setResponse(res);
      toast.success(`Successfully analyzed ${res.results.length} traces!`);
    } catch (err: any) {
      toast.error(err.message || 'Batch analysis failed.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputText(content);
      toast.success(`Loaded file ${file.name}`);
    };
    reader.readAsText(file);
  };

  const exportCsv = () => {
    if (!response || response.results.length === 0) return;

    const headers = [
      'ID',
      'Order ID',
      'Verdict',
      'Is Anomaly',
      'Anomaly Type',
      'Final State',
      'Total Steps',
      'Anomaly Score',
      'Created At',
      'Summary',
    ];

    const rows = response.results.map((r) => [
      r.id,
      r.order_id || '',
      r.verdict,
      r.is_anomaly ? 'TRUE' : 'FALSE',
      r.anomaly_type || '',
      r.fsm_evaluation.final_state,
      r.fsm_evaluation.total_steps,
      r.ml_evaluation?.anomaly_score !== undefined ? r.ml_evaluation.anomaly_score : '',
      r.created_at,
      `"${r.summary.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `toc_batch_results_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Layers className="text-indigo-600 dark:text-indigo-400" />
            <span>Batch Workflow Analysis</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Ingest and evaluate up to 500 order workflow traces simultaneously with aggregated summary metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="btn-secondary text-xs cursor-pointer">
            <Upload size={14} />
            <span>Upload File</span>
            <input
              type="file"
              accept=".txt,.csv,.json"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
          {response && (
            <Button
              variant="secondary"
              size="sm"
              icon={<Download size={14} />}
              onClick={exportCsv}
            >
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Batch Input Form */}
      <Card padding="md" className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="label-base mb-0">Trace Stream (one per line)</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInputText(SAMPLE_BATCH)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
            >
              <Sparkles size={12} /> Load Diverse Sample Set
            </button>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <button
              type="button"
              onClick={() => setInputText('')}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1 font-medium"
            >
              <RotateCcw size={12} /> Clear
            </button>
          </div>
        </div>

        <textarea
          rows={7}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`ORD-001: CONFIRM_PAYMENT;PACK_ITEMS;SHIP_ITEMS;DELIVER_ITEMS\nCONFIRM_PAYMENT;SHIP_ITEMS;DELIVER_ITEMS`}
          className="textarea-base font-mono text-xs leading-relaxed"
        />

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Format: [ORDER_ID:] EVENT1;EVENT2;EVENT3...</span>
          <span>
            {inputText.split('\n').filter((l) => l.trim().length > 0 && !l.startsWith('#')).length} traces detected
          </span>
        </div>

        <Button
          variant="primary"
          size="md"
          isLoading={isPending}
          onClick={handleRunBatch}
          icon={<Layers size={16} />}
          className="w-full justify-center"
        >
          {isPending ? 'Executing Batch Analysis...' : 'Analyze Trace Batch'}
        </Button>
      </Card>

      {/* Batch Summary Metrics */}
      {response && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {response.summary.total_orders}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Total Traces</div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {response.summary.normal_count}
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">Normal</div>
            </div>

            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {response.summary.rule_violation_count}
              </div>
              <div className="text-xs text-red-700 dark:text-red-400 mt-0.5">Rule Violations</div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {response.summary.statistical_anomaly_count}
              </div>
              <div className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Statistical Anomalies</div>
            </div>

            <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-center">
              <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                {response.summary.valid_incomplete_count}
              </div>
              <div className="text-xs text-sky-700 dark:text-sky-400 mt-0.5">Incomplete</div>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatPercent(response.summary.anomaly_rate)}
              </div>
              <div className="text-xs text-purple-700 dark:text-purple-400 mt-0.5">Anomaly Rate</div>
            </div>
          </div>

          {/* Results Table */}
          <Card padding="none" className="overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                Batch Evaluation Records ({response.results.length})
              </h2>
              <span className="text-xs text-gray-400">Click row to inspect evaluation details</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Verdict</th>
                    <th className="px-4 py-3">Anomaly</th>
                    <th className="px-4 py-3">Final State</th>
                    <th className="px-4 py-3">Steps</th>
                    <th className="px-4 py-3">ML Score</th>
                    <th className="px-4 py-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {response.results.map((record) => {
                    const isExpanded = expandedRowId === record.id;
                    return (
                      <React.Fragment key={record.id}>
                        <tr
                          onClick={() => setExpandedRowId(isExpanded ? null : record.id)}
                          className={cn(
                            'hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer transition-colors',
                            isExpanded && 'bg-indigo-50/40 dark:bg-indigo-950/20'
                          )}
                        >
                          <td className="px-4 py-3 font-mono text-xs text-gray-400">#{record.id}</td>
                          <td className="px-4 py-3 font-mono text-xs font-medium text-gray-700 dark:text-gray-300">
                            {record.order_id || <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <VerdictBadge verdict={record.verdict} size="xs" />
                          </td>
                          <td className="px-4 py-3 text-xs font-bold">
                            <span className={record.is_anomaly ? 'text-red-500' : 'text-emerald-500'}>
                              {record.is_anomaly ? '⚠ Anomaly' : '✓ Normal'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">
                            {record.fsm_evaluation.final_state}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                            {record.fsm_evaluation.total_steps}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs">
                            {record.ml_evaluation?.anomaly_score !== undefined ? (
                              <span
                                className={
                                  record.ml_evaluation.is_ml_anomaly
                                    ? 'text-amber-600 dark:text-amber-400 font-bold'
                                    : 'text-emerald-600 dark:text-emerald-400'
                                }
                              >
                                {formatScore(record.ml_evaluation.anomaly_score)}
                              </span>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-400">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </td>
                        </tr>

                        {/* Inline Detail Expansion */}
                        {isExpanded && (
                          <tr className="bg-gray-50/80 dark:bg-gray-900/60">
                            <td colSpan={8} className="p-4">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4"
                              >
                                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-xs">
                                  <span className="text-gray-400 font-semibold uppercase mr-2">Input:</span>
                                  <code className="font-mono text-indigo-600 dark:text-indigo-400">
                                    {Array.isArray(record.raw_input_payload)
                                      ? record.raw_input_payload.join(';')
                                      : String(record.raw_input_payload)}
                                  </code>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <FsmResultCard fsmEvaluation={record.fsm_evaluation} />
                                  <MlResultCard
                                    mlEvaluation={record.ml_evaluation}
                                    skipReason={record.ml_skip_reason}
                                  />
                                  <DiagnosticsCard diagnostics={record.diagnostics} />
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

// React import helper
import React from 'react';
