import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Zap, ChevronRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EventSequenceBuilder } from '../components/trace/EventSequenceBuilder';
import { FsmResultCard } from '../components/analysis/FsmResultCard';
import { MlResultCard } from '../components/analysis/MlResultCard';
import { DiagnosticsCard } from '../components/analysis/DiagnosticsCard';
import { VerdictBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAnalyze } from '../hooks/useAnalyze';
import type { AnalysisRecord } from '../types/analysis';
import { cn } from '../components/ui/Card';
import { verdictConfig } from '../lib/verdictColors';

interface FormValues {
  order_id: string;
  raw_sequence: string;
  mode: 'builder' | 'raw';
}

export function Analyze() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<string[]>([]);
  const [inputMode, setInputMode] = useState<'builder' | 'raw'>('builder');
  const [result, setResult] = useState<AnalysisRecord | null>(null);
  const { mutateAsync, isPending } = useAnalyze();
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: { order_id: '', raw_sequence: '', mode: 'builder' },
  });

  const onSubmit = async (data: FormValues) => {
    const sequence =
      inputMode === 'builder'
        ? events.join(';')
        : data.raw_sequence.trim();

    if (!sequence) {
      toast.error('Please add at least one event');
      return;
    }

    try {
      const res = await mutateAsync({
        order_id: data.order_id.trim() || null,
        event_sequence: sequence,
      });
      setResult(res);
      toast.success('Analysis complete!');
    } catch (e: any) {
      toast.error(e.message || 'Analysis failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Analyze Trace</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Submit a workflow trace for FSM validation and ML anomaly scoring
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Input panel */}
        <div>
          <Card padding="md">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Order ID */}
              <div>
                <label className="label-base">Order ID <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  {...register('order_id')}
                  className="input-base"
                  placeholder="e.g. ORD-20241114-001"
                  maxLength={64}
                />
              </div>

              {/* Input mode toggle */}
              <div>
                <label className="label-base">Input Mode</label>
                <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {(['builder', 'raw'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setInputMode(m)}
                      className={cn(
                        'flex-1 py-2 text-xs font-semibold transition-all',
                        inputMode === m
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      )}
                    >
                      {m === 'builder' ? '🧩 Visual Builder' : '⌨️ Raw Text'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Event input */}
              {inputMode === 'builder' ? (
                <EventSequenceBuilder value={events} onChange={setEvents} />
              ) : (
                <div>
                  <label className="label-base">Event Sequence</label>
                  <textarea
                    {...register('raw_sequence')}
                    className="textarea-base h-24"
                    placeholder="CONFIRM_PAYMENT;PACK_ITEMS;SHIP_ITEMS;DELIVER_ITEMS"
                  />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Semicolon-delimited string
                  </p>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isPending}
                icon={<Zap size={15} />}
                className="w-full justify-center"
              >
                {isPending ? 'Analyzing...' : 'Analyze Trace'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Result panel */}
        <div className="space-y-4">
          {result ? (
            <>
              {/* Verdict header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'p-4 rounded-xl border',
                  verdictConfig[result.verdict].bg,
                  verdictConfig[result.verdict].border
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <VerdictBadge verdict={result.verdict} size="md" />
                    <p className={cn('mt-2 text-sm leading-relaxed', verdictConfig[result.verdict].text)}>
                      {result.summary}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="xs"
                      icon={<ExternalLink size={12} />}
                      onClick={() => navigate(`/analyses/${result.id}`)}
                    >
                      Full View
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      icon={<ChevronRight size={12} />}
                      onClick={() => navigate('/dfa')}
                    >
                      View DFA
                    </Button>
                  </div>
                </div>
              </motion.div>

              <FsmResultCard fsmEvaluation={result.fsm_evaluation} />
              <MlResultCard mlEvaluation={result.ml_evaluation} skipReason={result.ml_skip_reason} />
              <DiagnosticsCard diagnostics={result.diagnostics} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 text-center">
              <div className="w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mb-4">
                <Zap size={36} className="text-indigo-400" />
              </div>
              <p className="font-semibold text-gray-700 dark:text-gray-300">Ready to Analyze</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                Build your event sequence using the visual builder or paste a raw string, then hit Analyze.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
