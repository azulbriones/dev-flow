import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { getWorkflow, getExecutions, createExecution } from '../features/workflows/api/client';
import { useExecutionStream } from '../features/workflows/hooks/useExecutionStream';
import { ExecutionStream } from '../features/workflows/components/ExecutionStream';
import { Button } from '../components/Button';
import { ErrorMessage } from '../components/ErrorMessage';
import { Spinner } from '../components/Spinner';
import type { Execution } from '../features/workflows/types';

export const WorkflowDetail = () => {
  const { id } = useParams<{ id: string }>();
  const workflowId = Number(id);

  const { data: workflow, isLoading: loadingWorkflow } = useQuery({
    queryKey: ['workflow', workflowId],
    queryFn: () => getWorkflow(workflowId),
    enabled: !!workflowId,
  });

  const { data: executions, isLoading: loadingExecutions } = useQuery({
    queryKey: ['executions', workflowId],
    queryFn: () => getExecutions(),
  });

  const [executionId, setExecutionId] = useState<number | null>(null);

  const handleExecute = async (): Promise<void> => {
    const execution = await createExecution({ workflow_id: workflowId });
    setExecutionId(execution.id);
  };

  const { output, isConnected, isReconnecting } = useExecutionStream({
    executionId: executionId,
    enabled: !!executionId,
  });

  if (loadingWorkflow || loadingExecutions) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!workflow) {
    return <ErrorMessage message="Workflow no encontrado" />;
  }

  const workflowExecutions = executions?.filter((e) => e.workflow_id === workflowId) || [];

  return (
    <div className="flex flex-col gap-6">
      <Link to="/" className="text-blue-600 hover:underline">
        Volver
      </Link>

      <div>
        <h1 className="text-2xl font-bold">{workflow.name}</h1>
        {workflow.description && (
          <p className="text-gray-600 mt-1">{workflow.description}</p>
        )}
      </div>

      <Button onClick={handleExecute}>Ejecutar</Button>

      {executionId && (
        <ExecutionStream
          output={output}
          isConnected={isConnected}
          isReconnecting={isReconnecting}
        />
      )}

      <div className="border-t pt-6">
        <h2 className="text-xl font-bold mb-4">Ejecuciones</h2>
        {workflowExecutions.length === 0 ? (
          <p className="text-gray-500">No hay ejecuciones</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {workflowExecutions.map((exec: Execution) => (
              <li
                key={exec.id}
                className="p-3 border rounded flex justify-between items-center"
              >
                <span>Ejecución #{exec.id}</span>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    exec.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : exec.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {exec.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};