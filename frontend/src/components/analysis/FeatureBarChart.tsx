import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { MlEvaluation } from '../../types/analysis';
import { formatFeatureName } from '../../lib/formatters';
import { ML_FEATURES } from '../../lib/constants';

interface FeatureBarChartProps {
  mlEvaluation: MlEvaluation;
}

export function FeatureBarChart({ mlEvaluation }: FeatureBarChartProps) {
  const data = ML_FEATURES.map((name) => ({
    name: formatFeatureName(name),
    fullName: name,
    value: Number((mlEvaluation.features[name] ?? 0).toFixed(4)),
  }));

  const maxVal = Math.max(...data.map((d) => Math.abs(d.value)), 1);

  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">14 Engineered ML Features</p>
      <ResponsiveContainer width="100%" height={340}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 20, bottom: 0, left: 10 }}
        >
          <XAxis
            type="number"
            domain={[0, maxVal]}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={130}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f9fafb',
              fontSize: '11px',
            }}
            formatter={(value: any, _: any, props: any) => [
              value,
              props?.payload?.fullName,
            ]}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={16}>
            {data.map((entry) => (
              <Cell
                key={entry.fullName}
                fill={entry.value > 1 ? '#f59e0b' : entry.value > 0 ? '#6366f1' : '#374151'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
