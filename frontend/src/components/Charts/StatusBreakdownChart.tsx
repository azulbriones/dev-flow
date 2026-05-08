import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

import './Charts.scss';

export interface StatusData {
  name: string;
  value: number;
}

export interface StatusBreakdownChartProps {
  data: StatusData[];
}

export type ReadonlyStatusBreakdownChartProps = Readonly<StatusBreakdownChartProps>;

// Map status names to theme colors
const STATUS_COLORS: Record<string, string> = {
  Completed: 'var(--success)',
  Failed: 'var(--error)',
  Running: 'var(--warning)',
  Pending: 'var(--text-muted)',
};

// Fallback for unknown statuses
const DEFAULT_COLOR = 'var(--border-strong)';

const getStatusColor = (name: string): string => {
  return STATUS_COLORS[name] || DEFAULT_COLOR;
};

const getTotal = (data: StatusData[]): number => {
  return data.reduce((sum, item) => sum + item.value, 0);
};

/**
 * StatusBreakdownChart - Donut chart with center total
 * Uses theme variables for colors
 */
export const StatusBreakdownChart = ({
  data,
}: Readonly<StatusBreakdownChartProps>) => {
  const total = getTotal(data);

  return (
    <div className="chart">
      <p className="chart__eyebrow">Mezcla de ejecuciones</p>
      <h4 className="chart__title">Estados de workflow</h4>
      <p className="chart__meta">Proporción de ejecuciones en la vista actual</p>
      <div className="chart__donut-container">
        {/* Total centered on donut */}
        <div className="chart__donut-center">
          <span className="chart__donut-value">{total}</span>
          <span className="chart__donut-label">ejecuciones</span>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`${entry.name}-${index}`}
                  fill={getStatusColor(entry.name)}
                />
              ))}
            </Pie>
            <Tooltip
              cursor={false}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;

                const value = Number(payload[0].value || 0);
                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

                return (
                  <div className="chart__tooltip">
                    <div className="chart__tooltip-label">{label}</div>
                    <div className="chart__tooltip-item">
                      {payload[0].name}: {value} ({percentage}%)
                    </div>
                  </div>
                );
              }}
              wrapperClassName="chart__tooltip-wrapper"
              formatter={(value: number, name: string) => [value, name]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value) => value}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
