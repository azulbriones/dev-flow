import { Link } from 'react-router-dom';

import type { WorkflowCardProps } from '../types/workflowCard';
import { WorkflowBadge } from './WorkflowBadge';

import '../styles/workflowCard.scss';

export const WorkflowCard = ({
  workflow,
  lastExecutionStatus = 'pending',
  onDelete,
  onEdit,
}: Readonly<WorkflowCardProps>) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(workflow.id, workflow.name);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="workflow-card">
      <Link to={`/workflows/${workflow.id}`} className="workflow-card__link">
        <div className="workflow-card__header">
          <h3 className="workflow-card__title">{workflow.name}</h3>
          <WorkflowBadge status={lastExecutionStatus} />
        </div>
        {workflow.description && (
          <p className="workflow-card__description">{workflow.description}</p>
        )}
        <div className="workflow-card__meta">
          <span>Creado: {formatDate(workflow.created_at)}</span>
        </div>
      </Link>
      {onDelete && (
        <div className="workflow-card__actions">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(workflow);
              }}
              className="edit-button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Editar
            </button>
          )}
          <button type="button" onClick={handleDelete} className="delete-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
};
