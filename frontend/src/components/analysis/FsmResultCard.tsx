import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { Card } from '../ui/Card';
import type { FsmEvaluation } from '../../types/analysis';

interface FsmResultCardProps {
  fsmEvaluation: FsmEvaluation;
}

export function FsmResultCard({ fsmEvaluation }: FsmResultCardProps) {
  const { is_rule_valid, is_complete, final_state, total_steps, successful_transitions, error } =
    fsmEvaluation;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card padding="md" className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span className="text-lg">🔀</span> FSM Evaluation
          </h3>
          <div className="flex items-center gap-2">
            {is_rule_valid ? (
              <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full font-medium">
                <CheckCircle size={11} /> Valid
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-2 py-0.5 rounded-full font-medium">
                <XCircle size={11} /> Invalid
              </span>
            )}
            {is_complete ? (
              <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full font-medium">
                <CheckCircle size={11} /> Complete
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 px-2 py-0.5 rounded-full font-medium">
                <Info size={11} /> Incomplete
              </span>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Final State', value: final_state.replace(/_/g, ' '), mono: true },
            { label: 'Total Steps', value: total_steps },
            { label: 'Successful', value: `${successful_transitions}/${total_steps}` },
          ].map(({ label, value, mono }) => (
            <div
              key={label}
              className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 text-center"
            >
              <div
                className={`text-sm font-bold text-gray-900 dark:text-gray-100 ${mono ? 'font-mono text-xs' : ''}`}
              >
                {String(value)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Error detail */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 space-y-2">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-semibold text-sm">
              <AlertTriangle size={14} />
              {error.error_type.replace(/_/g, ' ')}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Failed Step:</span>{' '}
                <span className="font-mono font-bold text-red-700 dark:text-red-400">#{error.failed_step}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Failed Event:</span>{' '}
                <code className="font-mono text-red-700 dark:text-red-400 text-[11px] bg-red-100 dark:bg-red-900/40 px-1 rounded">
                  {error.failed_event}
                </code>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">State at Failure:</span>{' '}
                <code className="font-mono text-red-700 dark:text-red-400 text-[11px] bg-red-100 dark:bg-red-900/40 px-1 rounded">
                  {error.state_at_failure}
                </code>
              </div>
            </div>
            {error.allowed_events.length > 0 && (
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Allowed events from this state:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {error.allowed_events.map((e) => (
                    <code key={e} className="text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono text-gray-700 dark:text-gray-300">
                      {e}
                    </code>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
