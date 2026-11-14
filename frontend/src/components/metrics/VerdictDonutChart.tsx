import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { DatabaseSummaryMetrics } from '../../types/analysis';

interface VerdictDonutChartProps {
  metrics: DatabaseSummaryMetrics;
}

const COLORS = {
  Normal: '#10b981',
  'Rule Violation': '#ef4444',
  'Statistical Anomaly': '#f59e0b',
  'Valid Incomplete': '#3b82f6',
};

export function VerdictDonutChart({ metrics }: VerdictDonutChartProps) {
  const data = [
    { name: 'Normal', value: metrics.normal_count },
    { name: 'Rule Violation', value: metrics.rule_violation_count },
    { name: 'Statistical Anomaly', value: metrics.statistical_anomaly_count },
    { name: 'Valid Incomplete', value: metrics.valid_incomplete_count },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-600 text-sm">
        No data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={COLORS[entry.name as keyof typeof COLORS]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#f9fafb',
            fontSize: '12px',
          }}
          formatter={(value: any, name: any) => [
            `${value} (${metrics.total_analyses > 0 ? ((Number(value) / metrics.total_analyses) * 100).toFixed(1) : 0}%)`,
            name,
          ]}
        />
        <Legend
          formatter={(value) => (
            <span style={{ color: '#9ca3af', fontSize: '11px', fontWeight: 500 }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
