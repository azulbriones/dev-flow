import { ExecutionsStatsCards } from './ExecutionsStatsCards';

interface ExecutionsSummaryProps {
  stats: {
    total: number;
    completed: number;
    failed: number;
    running: number;
    successRate: number;
  };
  trend: { direction: 'up' | 'down' | 'neutral'; value: number } | null;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'all' | 'pending' | 'running' | 'completed' | 'failed';
  onStatusFilterChange: (
    value: 'all' | 'pending' | 'running' | 'completed' | 'failed'
  ) => void;
  sortBy: 'date' | 'workflow' | 'status';
  onSortChange: (value: 'date' | 'workflow' | 'status') => void;
  resultCount: number;
}

export const ExecutionsSummary = ({
  stats,
  trend,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  resultCount,
}: ExecutionsSummaryProps) => {
  return (
    <>
      <div className="executions-page__header">
        <div className="executions-page__title">
          <h1>Ejecuciones</h1>
          <p className="executions-page__subtitle">
            Ver todo el historial de ejecuciones
          </p>
          <p className="executions-page__meta">
            Filtrá por estado, ordená por workflow e inspeccioná las ejecuciones
            recientes
          </p>
        </div>
        <div className="executions-page__header-actions">
          <div className="executions-page__search-wrapper">
            <span className="executions-page__search-label">Buscar</span>
            <div className="executions-page__search">
              <svg
                className="executions-page__search-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Filtrar por nombre de workflow..."
                className="executions-page__search-input"
              />
            </div>
          </div>
        </div>
      </div>

      <ExecutionsStatsCards stats={stats} trend={trend} />

      <div className="executions-page__filters">
        <div className="executions-page__filter-group">
          <span className="executions-page__filters-label">Filtrar por</span>
          <div className="executions-page__filter">
            <select
              id="exec-status-filter"
              value={statusFilter}
              onChange={(e) =>
                onStatusFilterChange(
                  e.target.value as ExecutionsSummaryProps['statusFilter']
                )
              }
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="running">En ejecución</option>
              <option value="completed">Completada</option>
              <option value="failed">Fallida</option>
            </select>
          </div>
        </div>
        <div className="executions-page__filter-group">
          <span className="executions-page__filters-label">Ordenar por</span>
          <div className="executions-page__filter">
            <select
              id="exec-sort-by"
              value={sortBy}
              onChange={(e) =>
                onSortChange(e.target.value as ExecutionsSummaryProps['sortBy'])
              }
            >
              <option value="date">Fecha (más nueva)</option>
              <option value="workflow">Flujo de trabajo (A-Z)</option>
              <option value="status">Estado</option>
            </select>
          </div>
        </div>
        <span className="executions-page__count">{resultCount} resultados</span>
      </div>
    </>
  );
};
