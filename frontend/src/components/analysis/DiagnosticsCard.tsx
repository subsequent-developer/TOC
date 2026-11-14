import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { SeverityBadge } from '../ui/Badge';
import type { Diagnostics } from '../../types/analysis';

interface DiagnosticsCardProps {
  diagnostics: Diagnostics;
}

const SeverityIcon = ({ severity }: { severity: string }) => {
  if (severity === 'CRITICAL') return <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />;
  if (severity === 'WARNING') return <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />;
  return <Info size={16} className="text-sky-500 flex-shrink-0" />;
};

export function DiagnosticsCard({ diagnostics }: DiagnosticsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <Card padding="md" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span className="text-lg">🩺</span> Diagnostics
          </h3>
          <SeverityBadge severity={diagnostics.severity} />
        </div>

        {/* Root cause */}
        <div>
          <div className="flex items-start gap-2 mb-2">
            <SeverityIcon severity={diagnostics.severity} />
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {diagnostics.root_cause}
            </p>
          </div>
        </div>

        {/* Key factors */}
        {diagnostics.key_factors.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Key Factors
            </p>
            <ul className="space-y-1.5">
              {diagnostics.key_factors.map((factor, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <ChevronRight size={14} className="flex-shrink-0 mt-0.5 text-gray-400" />
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommended action */}
        <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            💡 Recommended Action
          </p>
          <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">
            {diagnostics.recommended_action}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
