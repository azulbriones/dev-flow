import { StatusBreakdownChart, TopWorkflowsChart } from '../../components/Charts';
import { formatNumber } from '../../lib/utils';
import type { ExecutionStatus } from '../../features/workflows/types';
import { DashboardActivitySection } from './DashboardActivitySection';

export interface DashboardStats {
  totalWorkflows: number;
  totalExecutions: number;
  successRate: number;
  avgDuration: number;
}

export interface DashboardActivityItem {
  id: number;
  workflow_id: number | null;
  status: ExecutionStatus;
  error_message: string | null;
  workflowName: string;
  started_at: string;
}

export interface DashboardViewProps {
  stats: DashboardStats;
  statusBreakdownData: Array<{ name: string; value: number }>;
  topWorkflowsData: Array<{ name: string; count: number }>;
  activity: DashboardActivityItem[];
  activeTab: 'recent' | 'failed';
  onTabChange: (tab: 'recent' | 'failed') => void;
  onWorkflowClick: (workflowId: number) => string;
}

const DASHBOARD_WORKFLOWS_ICON_PATH =
  'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2';
const DASHBOARD_WORKFLOWS_ICON_PATH_2 =
  'M9 5a2 2 0 012-2h2a2 2 0 012 2v0a2 2 0 01-2 2h-2a2 2 0 01-2-2z';
const DASHBOARD_EXECUTIONS_ICON_PATH = 'M13 2L3 14h9l-1 8 10-12h-9l1-8z';
const DASHBOARD_SUCCESS_ICON_PATH = 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z';
const DASHBOARD_TIME_ICON_PATH = 'M12 6v6l4 2';

const getSuccessRateColor = (successRate: number) => {
  if (successRate >= 90) return 'dashboard__stat-card-value--success';
  if (successRate >= 70) return 'dashboard__stat-card-value--warning';
  return 'dashboard__stat-card-value--error';
};

export const DashboardView = ({
  stats,
  statusBreakdownData,
  topWorkflowsData,
  activity,
  activeTab,
  onTabChange,
  onWorkflowClick,
}: DashboardViewProps) => {
  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1>Tablero</h1>
        <p>Resumen de tu actividad en DevFlow</p>
      </div>

      <div className="dashboard__stats">
        <div className="dashboard__stat-card">
          <div className="dashboard__stat-card-header">
            <svg
              className="dashboard__stat-card-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d={DASHBOARD_WORKFLOWS_ICON_PATH} />
              <path d={DASHBOARD_WORKFLOWS_ICON_PATH_2} />
            </svg>
            <span className="dashboard__stat-card-label">Flujos de trabajo</span>
          </div>
          <span className="dashboard__stat-card-value">
            {formatNumber(stats.totalWorkflows)}
          </span>
        </div>

        <div className="dashboard__stat-card">
          <div className="dashboard__stat-card-header">
            <svg
              className="dashboard__stat-card-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d={DASHBOARD_EXECUTIONS_ICON_PATH} />
            </svg>
            <span className="dashboard__stat-card-label">Total de ejecuciones</span>
          </div>
          <span className="dashboard__stat-card-value">
            {formatNumber(stats.totalExecutions)}
          </span>
        </div>

        <div className="dashboard__stat-card">
          <div className="dashboard__stat-card-header">
            <svg
              className="dashboard__stat-card-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d={DASHBOARD_SUCCESS_ICON_PATH} />
            </svg>
            <span className="dashboard__stat-card-label">Tasa de éxito</span>
          </div>
          <span
            className={`dashboard__stat-card-value ${getSuccessRateColor(
              stats.successRate
            )}`}
          >
            {stats.successRate}%
          </span>
        </div>

        <div className="dashboard__stat-card">
          <div className="dashboard__stat-card-header">
            <svg
              className="dashboard__stat-card-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d={DASHBOARD_TIME_ICON_PATH} />
            </svg>
            <span className="dashboard__stat-card-label">Duración media</span>
          </div>
          <span className="dashboard__stat-card-value">{stats.avgDuration}s</span>
        </div>
      </div>

      <div className="dashboard__charts">
        <div className="dashboard__chart">
          <h3 className="dashboard__chart-title">Desglose de estados</h3>
          <StatusBreakdownChart data={statusBreakdownData} />
        </div>

        <div className="dashboard__chart">
          <h3 className="dashboard__chart-title">Flujos de trabajo más ejecutados</h3>
          <TopWorkflowsChart data={topWorkflowsData} />
        </div>
      </div>

      <DashboardActivitySection
        activity={activity}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onWorkflowPath={onWorkflowClick}
      />
    </div>
  );
};
