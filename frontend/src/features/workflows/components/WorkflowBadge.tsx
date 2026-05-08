import type { WorkflowBadgeProps } from '../types/workflowCard';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  running: 'Ejecutando',
  completed: 'Completado',
  failed: 'Error',
};

export const WorkflowBadge = ({ status }: Readonly<WorkflowBadgeProps>) => {
  return (
    <span className={`workflow-badge workflow-badge--${status}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
};
