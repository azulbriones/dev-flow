import { useMemo, useState } from 'react';
import { EmptyState } from '../../../components/EmptyState';
import type { WorkflowListItem } from '../types';
import { WorkflowCard } from './WorkflowCard';

import './workflowList.scss';

interface WorkflowListProps {
  workflows: WorkflowListItem[];
  onDelete?: (id: number, name: string) => void;
  onEdit?: (workflow: WorkflowListItem) => void;
}

type SortOption = 'date' | 'name';

export type ReadonlyWorkflowListProps = Readonly<WorkflowListProps>;

export const WorkflowList = ({
  workflows,
  onDelete,
  onEdit,
}: ReadonlyWorkflowListProps) => {
  const [sortBy, setSortBy] = useState<SortOption>('date');

  const sortedWorkflows = useMemo(() => {
    return [...workflows].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      // date - newest first
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [workflows, sortBy]);

  // Empty state when no workflows
  if (workflows.length === 0) {
    return (
      <div className="workflow-list">
        <EmptyState
          icon="info"
          title="No hay workflows"
          description="Creá tu primer workflow para empezar"
        />
      </div>
    );
  }

  return (
    <div className="workflow-list">
      {/* Sort Controls - Explicit labels */}
      <div className="workflow-list__controls">
        <div className="workflow-list__controls-copy">
          <span className="workflow-list__controls-label">Ordenar por</span>
          <span className="workflow-list__controls-meta">
            {sortedWorkflows.length} visibles
          </span>
        </div>
        <div className="workflow-list__sort">
          <button
            type="button"
            className={`workflow-list__sort-btn ${
              sortBy === 'date' ? 'workflow-list__sort-btn--active' : ''
            }`}
            onClick={() => setSortBy('date')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Fecha (más nueva)
          </button>
          <button
            type="button"
            className={`workflow-list__sort-btn ${
              sortBy === 'name' ? 'workflow-list__sort-btn--active' : ''
            }`}
            onClick={() => setSortBy('name')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7V4h16v3" />
              <path d="M9 20h6" />
              <path d="M12 4v16" />
            </svg>
            Nombre (A-Z)
          </button>
        </div>
      </div>

      {/* Workflows Grid */}
      <div className="workflow-list__grid">
        {sortedWorkflows.map((workflow) => (
          <WorkflowCard
            key={workflow.id}
            workflow={workflow}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
};
