import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import './Charts.scss';

export interface WorkflowStat {
  name: string;
  count: number;
}

export interface TopWorkflowsChartProps {
  data: WorkflowStat[];
}

export type ReadonlyTopWorkflowsChartProps = Readonly<TopWorkflowsChartProps>;

/**
 * Get gradient color based on ranking position
 * Top 1 = brightest, Top 5 = dimmest
 */
const getBarGradient = (index: number, total: number): string => {
  const intensity = 1 - (index / total) * 0.5; // 1.0 to 0.5

  // Adjust accent color intensity
  if (intensity > 0.8) {
    return 'linear-gradient(90deg, var(--accent-hover), var(--accent))';
  } else if (intensity > 0.6) {
    return 'linear-gradient(90deg, var(--accent), var(--accent))';
  } else if (intensity > 0.4) {
    return 'linear-gradient(90deg, var(--accent), var(--accent-muted))';
  } else {
    return 'linear-gradient(90deg, var(--accent-muted), var(--border-strong))';
  }
};

/**
 * TopWorkflowsChart - Horizontal bars with staggered animations
 * Top ranked items are more visually prominent
 */
export const TopWorkflowsChart = ({ data }: Readonly<TopWorkflowsChartProps>) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="chart">
      <p className="chart__eyebrow">Flujos de trabajo destacados</p>
      <h4 className="chart__title">Flujos de trabajo más ejecutados</h4>
      <div className="chart__content chart__content--bars">
        <div className="chart__bars">
          {data.slice(0, 5).map((item, index) => {
            const percentage = (item.count / maxCount) * 100;
            const delay = index * 100; // Staggered delay
            const rowStyle = {
              '--delay': `${delay}ms`,
            } as CSSProperties;
            const fillStyle = {
              '--delay': `${delay}ms`,
              '--bar-width': `${percentage}%`,
              '--bar-gradient': getBarGradient(index, data.length),
            } as CSSProperties;

            return (
              <div
                key={`${item.name}-${index}`}
                className={`chart__bar-row ${
                  isVisible ? 'chart__bar-row--visible' : ''
                }`}
                style={rowStyle}
              >
                <span className="chart__bar-label" title={item.name}>
                  {item.name}
                </span>
                <div className="chart__bar-container">
                  <div
                    className={`chart__bar-fill ${
                      isVisible ? 'chart__bar-fill--visible' : ''
                    }`}
                    style={fillStyle}
                  />
                </div>
                <span className="chart__bar-value">{item.count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
