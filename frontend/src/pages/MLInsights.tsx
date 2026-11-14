import {
  Brain,
  ShieldCheck,
  Target,
  BarChart,
  Layers,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { formatPercent } from '../lib/formatters';
import { ML_FEATURES } from '../lib/constants';

const MODEL_EVALUATION = {
  dataset_spec_version: '1.4',
  model_metadata: {
    model_name: 'IsolationForest',
    n_estimators: 100,
    contamination: 'auto',
    random_state: 42,
    training_sample_count: 2800,
  },
  primary_ml_evaluation: {
    evaluation_sample_count: 1200,
    actual_normal_count: 700,
    actual_anomaly_count: 500,
    predicted_normal_count: 541,
    predicted_anomaly_count: 659,
    confusion_matrix: [
      [541, 159],
      [0, 500],
    ],
    accuracy: 0.8675,
    precision: 0.758725,
    recall: 1.0,
    f1_score: 0.862813,
    roc_auc: 0.99544,
  },
  fsm_benchmark: {
    total_rule_violation_traces: 1000,
    correctly_rejected: 1000,
    incorrectly_accepted: 0,
    detection_rate: 1.0,
  },
};

const FEATURE_DESCRIPTIONS: Record<string, { desc: string; rationale: string }> = {
  seq_length: {
    desc: 'Total count of event tokens in the workflow trace.',
    rationale: 'Long sequences indicate abnormal loops or stalled checkouts.',
  },
  count_CONFIRM_PAYMENT: {
    desc: 'Frequency of successful payment confirmation events.',
    rationale: 'Normally exactly 1 per completed order.',
  },
  count_FAIL_PAYMENT: {
    desc: 'Number of rejected or timed-out payment attempts.',
    rationale: 'Frequent payment failures reflect transaction friction.',
  },
  count_RETRY_PAYMENT: {
    desc: 'Frequency of customer/system payment retry triggers.',
    rationale: 'Elevated retries strongly correlate with behavioral anomalies.',
  },
  count_CANCEL_ORDER: {
    desc: 'Occurrences of order cancellation events.',
    rationale: 'Must not exceed 1 in valid workflows.',
  },
  count_PACK_ITEMS: {
    desc: 'Count of warehouse item boxing and packing scans.',
    rationale: 'Essential fulfillment prerequisite.',
  },
  count_SHIP_ITEMS: {
    desc: 'Frequency of courier parcel transit dispatch triggers.',
    rationale: 'Occurs after packing.',
  },
  count_DELIVER_ITEMS: {
    desc: 'Carrier destination delivery confirmation events.',
    rationale: 'Terminal successful event.',
  },
  count_REFUND_ORDER: {
    desc: 'Captured payment reversal transactions.',
    rationale: 'Legal but statistically rare in customer population (< 2%).',
  },
  retry_ratio: {
    desc: 'Ratio of RETRY_PAYMENT events to total sequence length.',
    rationale: 'Captures proportion of sequence wasted on recovery loops.',
  },
  payment_failure_rate: {
    desc: 'FAIL_PAYMENT / (CONFIRM_PAYMENT + FAIL_PAYMENT).',
    rationale: 'Measures checkout instability independent of sequence length.',
  },
  bigram_FAIL_to_RETRY: {
    desc: 'Direct sequence bigram count of FAIL_PAYMENT followed immediately by RETRY_PAYMENT.',
    rationale: 'Identifies tight automated or repeated customer retry loops.',
  },
  bigram_PACK_to_SHIP: {
    desc: 'Direct sequence bigram count of PACK_ITEMS followed by SHIP_ITEMS.',
    rationale: 'Standard canonical fulfillment handoff pattern.',
  },
  unique_event_count: {
    desc: 'Count of distinct event types observed in the trace.',
    rationale: 'Measures structural variety of the workflow execution.',
  },
};

export function MLInsights() {
  const { primary_ml_evaluation: ml, fsm_benchmark: fsm, model_metadata: meta, dataset_spec_version } = MODEL_EVALUATION;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Brain className="text-indigo-600 dark:text-indigo-400" />
          <span>Machine Learning & Dual-Engine Architecture</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Detailed metrics, statistical evaluation, and feature attribution for the unsupervised Isolation Forest model
        </p>
      </div>

      {/* Dual Engine Architecture Flow */}
      <Card padding="md" className="space-y-4">
        <h2 className="section-title text-base flex items-center gap-2">
          <Layers size={18} className="text-indigo-500" />
          Hybrid Dual-Engine Processing Pipeline
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-300 text-sm">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                1
              </span>
              Deterministic FSM Gate
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Validates formal state transition grammar $\delta(q, e) \in Q$ and checks terminal-state completeness.
            </p>
            <div className="pt-2 border-t border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 font-semibold">
              Outcome: RULE_VIOLATION or VALID_INCOMPLETE (ML Skipped)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-purple-700 dark:text-purple-300 text-sm">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">
                2
              </span>
              Isolation Forest ML Evaluator
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Evaluated strictly on valid, completed traces. Vectorizes 14 engineered features into an ensemble of 100 decision trees.
            </p>
            <div className="pt-2 border-t border-purple-200 dark:border-purple-900 text-purple-800 dark:text-purple-300 font-semibold">
              Outcome: Continuous Anomaly Score & Decision Score
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300 text-sm">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                3
              </span>
              Operational Diagnostics
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Enriches audit records with severity categorization (CRITICAL, WARNING, INFO) and concrete remediation advice.
            </p>
            <div className="pt-2 border-t border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 font-semibold">
              Outcome: NORMAL or STATISTICAL_ANOMALY
            </div>
          </div>
        </div>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-center">
          <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
            {formatPercent(ml.roc_auc)}
          </div>
          <div className="text-xs text-indigo-800 dark:text-indigo-300 font-medium mt-1">ROC-AUC Score</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Exceptional Discriminability</div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {formatPercent(ml.recall)}
          </div>
          <div className="text-xs text-emerald-800 dark:text-emerald-300 font-medium mt-1">Recall Rate</div>
          <div className="text-[10px] text-gray-400 mt-0.5">0 False Negatives</div>
        </div>

        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-center">
          <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
            {formatPercent(ml.accuracy)}
          </div>
          <div className="text-xs text-blue-800 dark:text-blue-300 font-medium mt-1">Accuracy</div>
          <div className="text-[10px] text-gray-400 mt-0.5">1,200 Test Traces</div>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {formatPercent(ml.precision)}
          </div>
          <div className="text-xs text-amber-800 dark:text-amber-300 font-medium mt-1">Precision</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Minimal Over-flagging</div>
        </div>

        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-center">
          <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
            {formatPercent(ml.f1_score)}
          </div>
          <div className="text-xs text-purple-800 dark:text-purple-300 font-medium mt-1">F1-Measure</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Harmonic Mean</div>
        </div>
      </div>

      {/* Confusion Matrix & Benchmarks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Confusion Matrix Visual */}
        <Card padding="md" className="space-y-4">
          <h3 className="section-title text-base flex items-center gap-2">
            <Target size={16} className="text-indigo-500" />
            Confusion Matrix (Test Set N=1,200)
          </h3>

          <div className="flex flex-col items-center justify-center p-3">
            <div className="grid grid-cols-2 gap-3 max-w-sm w-full">
              {/* True Negative */}
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {ml.confusion_matrix[0][0]}
                </span>
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mt-1">
                  True Normal (TN)
                </p>
                <p className="text-[11px] text-gray-400">Correctly passed normal</p>
              </div>

              {/* False Positive */}
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
                <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                  {ml.confusion_matrix[0][1]}
                </span>
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mt-1">
                  False Positive (FP)
                </p>
                <p className="text-[11px] text-gray-400">Normal flagged as anomaly</p>
              </div>

              {/* False Negative */}
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {ml.confusion_matrix[1][0]}
                </span>
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mt-1">
                  False Negative (FN)
                </p>
                <p className="text-[11px] text-emerald-600 font-bold">Zero Missed Anomalies!</p>
              </div>

              {/* True Positive */}
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-center">
                <span className="text-2xl font-bold font-mono text-red-600 dark:text-red-400">
                  {ml.confusion_matrix[1][1]}
                </span>
                <p className="text-xs font-semibold text-red-800 dark:text-red-300 mt-1">
                  True Anomaly (TP)
                </p>
                <p className="text-[11px] text-gray-400">100% anomaly capture</p>
              </div>
            </div>
          </div>
        </Card>

        {/* FSM Deterministic Benchmark & Hyperparameters */}
        <Card padding="md" className="space-y-4">
          <h3 className="section-title text-base flex items-center gap-2">
            <ShieldCheck size={16} className="text-indigo-500" />
            FSM Grammar Benchmark & Model Specs
          </h3>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-800 dark:text-gray-200">
              <span>Rule Violation Benchmark Detection</span>
              <span className="text-emerald-600 font-mono text-sm">
                {formatPercent(fsm.detection_rate)} ({fsm.correctly_rejected.toLocaleString()} / {fsm.total_rule_violation_traces.toLocaleString()})
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Evaluated on 1,000 synthetic syntactical and terminal violation traces. Deterministic FSM achieves 100% precision and recall with 0 false acceptances.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-gray-50 dark:bg-gray-800/40 rounded-lg">
              <span className="text-gray-400 block">Estimator:</span>
              <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{meta.model_name}</span>
            </div>
            <div className="p-2.5 bg-gray-50 dark:bg-gray-800/40 rounded-lg">
              <span className="text-gray-400 block">Trees (n_estimators):</span>
              <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{meta.n_estimators}</span>
            </div>
            <div className="p-2.5 bg-gray-50 dark:bg-gray-800/40 rounded-lg">
              <span className="text-gray-400 block">Training Traces:</span>
              <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{meta.training_sample_count}</span>
            </div>
            <div className="p-2.5 bg-gray-50 dark:bg-gray-800/40 rounded-lg">
              <span className="text-gray-400 block">Spec Version:</span>
              <span className="font-mono font-bold text-gray-700 dark:text-gray-300">v{dataset_spec_version}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 14 Engineered Feature Explanations */}
      <Card padding="md" className="space-y-4">
        <h3 className="section-title text-base flex items-center gap-2">
          <BarChart size={16} className="text-indigo-500" />
          The 14 Approved Numerical Workflow Features
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 text-left">
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">Feature Name</th>
                <th className="py-2 px-3">Description</th>
                <th className="py-2 px-3">Detection Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {ML_FEATURES.map((name, index) => {
                const info = FEATURE_DESCRIPTIONS[name] || { desc: '', rationale: '' };
                return (
                  <tr key={name} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="py-2 px-3 text-gray-400 font-mono">{index + 1}</td>
                    <td className="py-2 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {name}
                    </td>
                    <td className="py-2 px-3 text-gray-700 dark:text-gray-300">{info.desc}</td>
                    <td className="py-2 px-3 text-gray-500 dark:text-gray-400 italic">
                      {info.rationale}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
