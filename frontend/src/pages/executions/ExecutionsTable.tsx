import { Link } from 'react-router-dom';

import { EmptyState } from '../../components/EmptyState';
import { formatRelativeTime } from '../../lib/utils';
import type { ExecutionStatus } from '../../features/workflows/types';
import type { ExecutionRow } from './ExecutionsView';

interface ExecutionsTableProps {
  rows: ExecutionRow[];
  workflowMap: Record<number, string>;
  searchQuery: string;
}

const getExecutionStatusClass = (status: ExecutionStatus) =>
  `executions-table__status executions-table__status--${status}`;

const getStatusLabel = (status: ExecutionStatus) => {
  if (status === 'pending') return 'Pendiente';
  if (status === 'running') return 'En ejecución';
  if (status === 'completed') return 'Completada';
  return 'Fallida';
};

const formatExecutionDuration = (
  startedAt: string,
  finishedAt?: string | null
): string => {
  if (!finishedAt) return '-';

  return `${Math.round(
    (new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 1000
  )}s`;
};

export const ExecutionsTable = ({
  rows,
  workflowMap,
  searchQuery,
}: ExecutionsTableProps) => {
  return (
    <div className="executions-table">
      <div className="executions-table__meta-row">
        <span>Ejecuciones recientes</span>
        <span>{rows.length} resultados</span>
      </div>
      <div className="executions-table__header">
        <span className="executions-table__col">ID</span>
        <span className="executions-table__col">Flujo de trabajo</span>
        <span className="executions-table__col">Estado</span>
        <span className="executions-table__col">Inicio</span>
        <span className="executions-table__col">Duración</span>
      </div>
      <div className="executions-table__body">
        {rows.length === 0 ? (
          <div className="executions-table__empty">
            <EmptyState
              icon="search"
              title="No se encontraron ejecuciones"
              description={
                searchQuery
                  ? `No hay resultados para "${searchQuery}"`
                  : 'No hay ejecuciones que coincidan con los filtros actuales'
              }
            />
          </div>
        ) : (
          rows.slice(0, 50).map((exec) => (
            <div key={exec.id} className="executions-table__row">
              <span className="executions-table__col">#{exec.id}</span>
              <span className="executions-table__col">
                {exec.workflow_id ? (
                  <Link to={`/workflows/${exec.workflow_id}`}>
                    {workflowMap[exec.workflow_id] || 'Desconocido'}
                  </Link>
                ) : (
                  <span>Ad hoc</span>
                )}
              </span>
              <span className="executions-table__col">
                <span className={getExecutionStatusClass(exec.status)}>
                  {getStatusLabel(exec.status)}
                </span>
              </span>
              <span className="executions-table__col">
                {formatRelativeTime(exec.started_at)}
              </span>
              <span className="executions-table__col">
                {formatExecutionDuration(exec.started_at, exec.finished_at)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
