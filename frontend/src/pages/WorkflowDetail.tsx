import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import {
  getWorkflow,
  getExecutions,
  createExecution,
} from '../features/workflows/api/client';
import { useExecutionOutput } from '../features/workflows/hooks/useExecutionOutput';
import {
  WorkflowDetailLayout,
  LeftPanel,
  TerminalPanel,
} from '../features/workflows/components/WorkflowDetailLayout';
import {
  generateSampleYaml,
  parseStepsFromYaml,
} from '../features/workflows/utils/parsers';
import { Button } from '../components/Button';
import { ErrorMessage } from '../components/ErrorMessage';
import { Spinner } from '../components/Spinner';
import type { Execution } from '../features/workflows/types';

export const WorkflowDetail = () => {
  const { id } = useParams<{ id: string }>();
  const workflowId = Number(id);

  const [executionId, setExecutionId] = useState<number | null>(null);
  const [stickyEnabled, setStickyEnabled] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');

  const { data: workflow, isLoading: loadingWorkflow } = useQuery({
    queryKey: ['workflow', workflowId],
    queryFn: () => getWorkflow(workflowId),
    enabled: !!workflowId,
  });

  const { data: executions, isLoading: loadingExecutions } = useQuery({
    queryKey: ['executions', workflowId],
    queryFn: () => getExecutions({ workflowId }),
    staleTime: 1000 * 60 * 2,
    enabled: !!workflowId,
  });

  const handleExecute = async (): Promise<void> => {
    const execution = await createExecution({
      workflow_id: workflowId,
    });
    setExecutionId(execution.id);
  };

  const { output, isConnected, isReconnecting, executionStatus } =
    useExecutionOutput(executionId);

  // Use real YAML content from workflow, fallback to sample if not available
  const yamlContent = useMemo(() => {
    return (
      workflow?.yaml_content || generateSampleYaml(workflow?.name || 'Flujo de trabajo')
    );
  }, [workflow?.yaml_content, workflow?.name]);

  const steps = useMemo(() => {
    return parseStepsFromYaml(yamlContent);
  }, [yamlContent]);

  // Find current running step for highlighting
  const currentStepId = useMemo(() => {
    if (executionStatus === 'completed') return undefined;
    const runningStep = steps.find((s) => s.status === 'running');
    return runningStep?.id;
  }, [steps, executionStatus]);

  if (loadingWorkflow || loadingExecutions) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!workflow) {
    return <ErrorMessage message="Flujo de trabajo no encontrado" />;
  }

  const workflowExecutions = executions || [];

  // Determine execution status for the terminal
  const terminalStatus = executionStatus === 'connected' ? 'running' : executionStatus;

  return (
    <div className="workflow-detail-page">
      {/* Header */}
      <div className="workflow-detail-page__header">
        <Link to="/" className="workflow-detail-page__back">
          ← Volver
        </Link>

        <div className="workflow-detail-page__title">
          <h1>{workflow.name}</h1>
          <p className="workflow-detail-page__subtitle">
            Editor, terminal y historial reciente en una sola vista
          </p>
          {workflow.description && <p>{workflow.description}</p>}
        </div>

        <div className="workflow-detail-page__actions">
          <Button
            onClick={handleExecute}
            disabled={!!executionId && executionStatus === 'connected'}
          >
            {executionStatus === 'connected' ? 'Ejecutando...' : 'Ejecutar'}
          </Button>
        </div>
      </div>

      {/* 2-Column Layout */}
      <WorkflowDetailLayout
        leftPanel={
          <LeftPanel
            yamlContent={yamlContent}
            steps={steps}
            currentStepId={currentStepId}
          />
        }
        rightPanel={
          <TerminalPanel
            output={output}
            isConnected={isConnected}
            isReconnecting={isReconnecting}
            executionStatus={terminalStatus}
            stickyEnabled={stickyEnabled}
            onStickyToggle={setStickyEnabled}
            filterQuery={filterQuery}
            onFilter={setFilterQuery}
          />
        }
      />

      {/* Executions History */}
      <div className="workflow-detail-page__executions">
        <div className="workflow-detail-page__executions-header">
          <h2>Ejecuciones Recientes</h2>
          <span className="workflow-detail-page__executions-count">
            {workflowExecutions.length} ejecuciones
          </span>
        </div>
        {workflowExecutions.length === 0 ? (
          <p className="text-muted">No hay ejecuciones</p>
        ) : (
          <ul>
            {workflowExecutions.slice(0, 5).map((exec: Execution) => (
              <li key={exec.id}>
                <span className="workflow-detail-page__execution-id">#{exec.id}</span>
                <span className={`led led--${exec.status}`} />
                <span className="workflow-detail-page__execution-status">
                  {exec.status}
                </span>
                <span className="workflow-detail-page__execution-time text-muted">
                  {new Date(exec.started_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
