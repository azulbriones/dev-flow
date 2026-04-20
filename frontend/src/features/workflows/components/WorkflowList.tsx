import type { Workflow } from '../types';
import { WorkflowCard } from './WorkflowCard';

interface WorkflowListProps {
  workflows: Workflow[];
  onDelete?: (id: number) => void;
}

export const WorkflowList = ({ workflows, onDelete }: WorkflowListProps) => {
  if (workflows.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay workflows. Crea uno nuevo.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {workflows.map((workflow) => (
        <WorkflowCard key={workflow.id} workflow={workflow} onDelete={onDelete} />
      ))}
    </div>
  );
};