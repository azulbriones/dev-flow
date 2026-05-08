import { Link } from 'react-router-dom';

import { EmptyState } from '../../components/EmptyState';
import type { DashboardActivityItem } from './DashboardView';

type ActivityTab = 'recent' | 'failed';

interface DashboardActivitySectionProps {
  activity: DashboardActivityItem[];
  activeTab: ActivityTab;
  onTabChange: (tab: ActivityTab) => void;
  onWorkflowPath: (workflowId: number) => string;
}

const getActivityTabClass = (tab: ActivityTab, activeTab: ActivityTab) =>
  [
    'dashboard__activity-tab',
    activeTab === tab ? 'dashboard__activity-tab--active' : '',
  ]
    .filter(Boolean)
    .join(' ');

const getActivityStatusClass = (status: DashboardActivityItem['status']) =>
  `dashboard__activity-status dashboard__activity-status--${status}`;

const getStatusLabel = (status: DashboardActivityItem['status']) => {
  if (status === 'completed') return 'Completada';
  if (status === 'failed') return 'Fallida';
  if (status === 'running') return 'En ejecución';
  return 'Pendiente';
};

const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('es-AR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const DashboardActivitySection = ({
  activity,
  activeTab,
  onTabChange,
  onWorkflowPath,
}: DashboardActivitySectionProps) => {
  return (
    <div className="dashboard__activity">
      <div className="dashboard__activity-header">
        <div className="dashboard__activity-heading">
          <h3 className="dashboard__activity-title">Actividad reciente</h3>
          <p className="dashboard__activity-meta">
            Últimas ejecuciones y fallas en un solo lugar
          </p>
        </div>
        <div className="dashboard__activity-tabs">
          <button
            type="button"
            className={getActivityTabClass('recent', activeTab)}
            aria-pressed={activeTab === 'recent'}
            onClick={() => onTabChange('recent')}
          >
            Recientes
          </button>
          <button
            type="button"
            className={getActivityTabClass('failed', activeTab)}
            aria-pressed={activeTab === 'failed'}
            onClick={() => onTabChange('failed')}
          >
            Fallidas
          </button>
        </div>
      </div>

      {activity.length === 0 ? (
        <div className="dashboard__empty">
          <EmptyState
            icon="info"
            title="Todavía no hay actividad"
            description="Ejecutá un flujo de trabajo para ver la actividad acá"
          />
        </div>
      ) : (
        <div className="dashboard__activity-table">
          <div className="dashboard__activity-table-header">
            <span>Estado</span>
            <span>Flujo de trabajo</span>
            <span>Inicio</span>
            <span>Error</span>
          </div>
          <div className="dashboard__activity-table-body">
            {activity.map((item) => (
              <div key={item.id} className="dashboard__activity-row">
                <span className={getActivityStatusClass(item.status)}>
                  {getStatusLabel(item.status)}
                </span>
                <span className="dashboard__activity-workflow">
                  {item.workflow_id ? (
                    <Link to={onWorkflowPath(item.workflow_id)}>
                      {item.workflowName}
                    </Link>
                  ) : (
                    <span>{item.workflowName}</span>
                  )}
                </span>
                <span className="dashboard__activity-time">
                  {formatTime(item.started_at)}
                </span>
                <span className="dashboard__activity-error">
                  {item.error_message ? item.error_message.slice(0, 50) : '-'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
