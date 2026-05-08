import type { ExecutionStatus } from '../../features/workflows/types';
import { ExecutionsTable } from './ExecutionsTable';
import { ExecutionsSummary } from './ExecutionsSummary';

export interface ExecutionsStats {
  total: number;
  completed: number;
  failed: number;
  running: number;
  successRate: number;
}

export interface ExecutionRow {
  id: number;
  workflow_id: number | null;
  status: ExecutionStatus;
  started_at: string;
  finished_at: string | null;
  workflowName: string;
}

export interface ExecutionsViewProps {
  stats: ExecutionsStats;
  trend: { direction: 'up' | 'down' | 'neutral'; value: number } | null;
  filteredExecutions: ExecutionRow[];
  workflowMap: Record<number, string>;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'all' | 'pending' | 'running' | 'completed' | 'failed';
  onStatusFilterChange: (
    value: 'all' | 'pending' | 'running' | 'completed' | 'failed'
  ) => void;
  sortBy: 'date' | 'workflow' | 'status';
  onSortChange: (value: 'date' | 'workflow' | 'status') => void;
}

export const ExecutionsView = ({
  stats,
  trend,
  filteredExecutions,
  workflowMap,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
}: ExecutionsViewProps) => {
  return (
    <div className="executions-page">
      <ExecutionsSummary
        stats={stats}
        trend={trend}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
        sortBy={sortBy}
        onSortChange={onSortChange}
        resultCount={filteredExecutions.length}
      />

      <ExecutionsTable
        rows={filteredExecutions}
        workflowMap={workflowMap}
        searchQuery={searchQuery}
      />
    </div>
  );
};
