import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { FeatureBarChart } from './FeatureBarChart';
import { formatScore, normalizeAnomalyScore } from '../../lib/formatters';
import { cn } from '../ui/Card';
import type { MlEvaluation } from '../../types/analysis';

interface MlResultCardProps {
  mlEvaluation: MlEvaluation | null;
  skipReason?: string | null;
}

export function MlResultCard({ mlEvaluation, skipReason }: MlResultCardProps) {
  if (!mlEvaluation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card padding="md">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
            <span className="text-lg">🤖</span> ML Evaluation
          </h3>
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
              ⏭️
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">ML Skipped</p>
            {skipReason && (
              <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs">{skipReason}</p>
            )}
          </div>
        </Card>
      </motion.div>
    );
  }

  const scorePercent = normalizeAnomalyScore(mlEvaluation.anomaly_score);
  const isAnomaly = mlEvaluation.is_ml_anomaly;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card padding="md" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span className="text-lg">🤖</span> ML Evaluation
          </h3>
          <span
            className={cn(
              'text-xs font-bold px-2.5 py-1 rounded-full border',
              isAnomaly
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
            )}
          >
            {mlEvaluation.prediction}
          </span>
        </div>

        {/* Anomaly score gauge */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-gray-500 dark:text-gray-400">Anomaly Score</span>
            <span className={cn('text-sm font-bold font-mono', isAnomaly ? 'text-amber-500' : 'text-emerald-500')}>
              {formatScore(mlEvaluation.anomaly_score)}
            </span>
          </div>
          <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${scorePercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
              className={cn(
                'h-full rounded-full',
                isAnomaly
                  ? 'bg-gradient-to-r from-amber-400 to-red-500'
                  : 'bg-gradient-to-r from-emerald-400 to-teal-500'
              )}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
            <span>Normal</span>
            <span>Anomalous</span>
          </div>
        </div>

        {/* Raw decision score */}
        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/60 rounded-lg">
          <span className="text-xs text-gray-500 dark:text-gray-400">Raw Decision Score</span>
          <code className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300">
            {formatScore(mlEvaluation.raw_decision_score)}
          </code>
        </div>

        {/* Feature chart */}
        <FeatureBarChart mlEvaluation={mlEvaluation} />
      </Card>
    </motion.div>
  );
}
