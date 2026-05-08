import { formatNumber } from '../../lib/utils';

interface ExecutionsStats {
  total: number;
  completed: number;
  failed: number;
  running: number;
  successRate: number;
}

interface ExecutionsStatsCardsProps {
  stats: ExecutionsStats;
  trend: { direction: 'up' | 'down' | 'neutral'; value: number } | null;
}

const EXECUTIONS_SUCCESS_ICON_PATH = 'M22 11.08V12a10 10 0 11-5.93-9.14';
const EXECUTIONS_SUCCESS_ICON_PATH_2 = 'M22 4L12 14.01l-3-3';
const EXECUTIONS_ERROR_ICON_PATH = 'M15 9l-6 6M9 9l6 6';

const getTrendClass = (direction: 'up' | 'down' | 'neutral') =>
  `executions-page__trend executions-page__trend--${direction}`;

const getSuccessRateColor = (successRate: number) => {
  if (successRate >= 90) return 'executions-page__stat-value--success';
  if (successRate >= 70) return 'executions-page__stat-value--warning';
  return 'executions-page__stat-value--error';
};

export const ExecutionsStatsCards = ({ stats, trend }: ExecutionsStatsCardsProps) => {
  return (
    <div className="executions-page__stats">
      <div className="executions-page__stat-card">
        <div className="executions-page__stat-card-header">
          <svg
            className="executions-page__stat-card-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <span className="executions-page__stat-card-label">Total de ejecuciones</span>
        </div>
        <span className="executions-page__stat-card-value">
          {formatNumber(stats.total)}
        </span>
      </div>

      <div className="executions-page__stat-card">
        <div className="executions-page__stat-card-header">
          <svg
            className={
              'executions-page__stat-card-icon ' +
              'executions-page__stat-card-icon--success'
            }
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d={EXECUTIONS_SUCCESS_ICON_PATH} />
            <path d={EXECUTIONS_SUCCESS_ICON_PATH_2} />
          </svg>
          <span className="executions-page__stat-card-label">Exitosas</span>
        </div>
        <span
          className={
            'executions-page__stat-card-value ' +
            'executions-page__stat-card-value--success'
          }
        >
          {formatNumber(stats.completed)}
        </span>
      </div>

      <div className="executions-page__stat-card">
        <div className="executions-page__stat-card-tooltip">
          <div className="executions-page__stat-card-header">
            <svg
              className="executions-page__stat-card-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="executions-page__stat-card-label">Tasa de éxito</span>
          </div>
          <span
            className={`executions-page__stat-card-value ${getSuccessRateColor(
              stats.successRate
            )}`}
          >
            {stats.successRate}%
            {trend && (
              <span className={getTrendClass(trend.direction)}>
                {trend.direction === 'up' && (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 14l5-5 5 5H7z" />
                  </svg>
                )}
                {trend.direction === 'down' && (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 10l5 5 5-5H7z" />
                  </svg>
                )}
                {trend.value}%
              </span>
            )}
          </span>
          <div className="executions-page__stat-card-tooltip-content">
            {stats.completed} exitosas de {stats.total} ejecuciones totales
          </div>
        </div>
      </div>

      <div className="executions-page__stat-card">
        <div className="executions-page__stat-card-header">
          <svg
            className={
              'executions-page__stat-card-icon ' +
              'executions-page__stat-card-icon--error'
            }
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d={EXECUTIONS_ERROR_ICON_PATH} />
          </svg>
          <span className="executions-page__stat-card-label">Fallidas</span>
        </div>
        <span
          className={
            'executions-page__stat-card-value ' +
            'executions-page__stat-card-value--error'
          }
        >
          {formatNumber(stats.failed)}
        </span>
      </div>
    </div>
  );
};
