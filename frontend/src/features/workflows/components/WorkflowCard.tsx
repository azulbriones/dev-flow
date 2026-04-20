import { Link } from 'react-router-dom';

import type { Workflow } from '../types';

interface WorkflowCardProps {
  workflow: Workflow;
  onDelete?: (id: number) => void;
}

export const WorkflowCard = ({ workflow, onDelete }: WorkflowCardProps) => {
  return (
    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
      <Link to={`/workflows/${workflow.id}`} className="block">
        <h3 className="text-lg font-medium text-blue-600 hover:underline">
          {workflow.name}
        </h3>
        {workflow.description && (
          <p className="text-gray-600 mt-1">{workflow.description}</p>
        )}
        <p className="text-sm text-gray-400 mt-2">
          Creado: {new Date(workflow.created_at).toLocaleDateString()}
        </p>
      </Link>
      {onDelete && (
        <button
          onClick={() => onDelete(workflow.id)}
          className="mt-2 text-sm text-red-600 hover:text-red-700"
        >
          Eliminar
        </button>
      )}
    </div>
  );
};