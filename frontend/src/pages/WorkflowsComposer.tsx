import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  createExecution,
  createWorkflow,
  getWorkflow,
  updateWorkflow,
} from '../features/workflows/api/client';
import { useExecutionOutput } from '../features/workflows/hooks/useExecutionOutput';
import {
  insertWorkflowCaches,
  syncWorkflowCaches,
} from '../features/workflows/utils/cache';
import { defaultYaml, parseYamlSteps } from '../features/workflows/utils/parsers';
import type { Workflow } from '../features/workflows/types';
import { ComposerView } from './workflows-composer/ComposerView';
import './WorkflowsComposer.scss';

export const WorkflowsComposer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const workflowId = id ? Number(id) : null;

  const { data: existingWorkflow, isLoading } = useQuery({
    queryKey: ['workflow', workflowId],
    queryFn: () => getWorkflow(workflowId!),
    enabled: !!workflowId,
  });

  const [yamlContent, setYamlContent] = useState(defaultYaml);
  const [name, setName] = useState('new-workflow.yaml');
  const [description, setDescription] = useState('');
  const [executionId, setExecutionId] = useState<number | null>(null);
  const [saveError, setSaveError] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [hasUserEdited, setHasUserEdited] = useState({
    yamlContent: false,
    name: false,
    description: false,
  });

  useEffect(() => {
    if (!existingWorkflow) return;

    if (!hasUserEdited.yamlContent)
      setYamlContent(existingWorkflow.yaml_content ?? defaultYaml);
    if (!hasUserEdited.name) setName(existingWorkflow.name ?? 'new-workflow.yaml');
    if (!hasUserEdited.description) setDescription(existingWorkflow.description ?? '');
  }, [existingWorkflow, hasUserEdited]);

  useEffect(() => {
    const hasChanges =
      hasUserEdited.yamlContent || hasUserEdited.name || hasUserEdited.description;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasChanges) return;
      e.preventDefault();
      return 'Tienes cambios sin guardar. ¿Seguro que quieres salir?';
    };

    if (hasChanges) window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUserEdited]);

  const { output, isConnected, executionStatus, executedSteps, currentStepName } =
    useExecutionOutput(executionId);

  const steps = useMemo(() => {
    const parsed = parseYamlSteps(yamlContent);
    if (!currentStepName && executedSteps.size === 0) return parsed;

    return parsed.map((step) => {
      const isExecuted = executedSteps.has(step.name);
      const isCurrent = step.name === currentStepName;
      const isFinished =
        executionStatus === 'completed' || executionStatus === 'failed';

      if (isExecuted && isCurrent && !isFinished) {
        return { ...step, status: 'in-progress' as const };
      }
      if (isExecuted) {
        return { ...step, status: 'done' as const };
      }
      return step;
    });
  }, [yamlContent, executedSteps, currentStepName, executionStatus]);

  const handleSave = async () => {
    const workflowData = { name, description, yaml_content: yamlContent };
    setSaveError('');
    setSaveStatus('saving');

    try {
      const savedWorkflow: Workflow = existingWorkflow?.id
        ? await updateWorkflow(existingWorkflow.id, workflowData)
        : await createWorkflow(workflowData);

      if (existingWorkflow?.id) syncWorkflowCaches(queryClient, savedWorkflow);
      else {
        insertWorkflowCaches(queryClient, savedWorkflow);
        navigate(`/workflows/${savedWorkflow.id}`, { replace: true });
      }

      setHasUserEdited({ yamlContent: false, name: false, description: false });
      setSaveStatus('saved');
      toast.success('Flujo de trabajo guardado correctamente');
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : 'No se pudo guardar el flujo de trabajo'
      );
      setSaveStatus('idle');
      toast.error('No se pudo guardar el flujo de trabajo');
      console.error('Failed to save workflow:', err);
    }
  };

  const handleExecute = async () => {
    if (executionStatus === 'connecting' || executionStatus === 'connected') return;

    const workflowData = { name, description, yaml_content: yamlContent };
    setSaveError('');

    try {
      const savedWorkflow: Workflow = existingWorkflow?.id
        ? await updateWorkflow(existingWorkflow.id, workflowData)
        : await createWorkflow(workflowData);

      if (existingWorkflow?.id) syncWorkflowCaches(queryClient, savedWorkflow);
      else {
        insertWorkflowCaches(queryClient, savedWorkflow);
        navigate(`/workflows/${savedWorkflow.id}`, { replace: true });
      }

      setHasUserEdited({ yamlContent: false, name: false, description: false });

      const execution = await createExecution({ workflow_id: savedWorkflow.id });
      setExecutionId(execution.id);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : 'No se pudo ejecutar el flujo de trabajo'
      );
      console.error('Failed to execute workflow:', err);
    }
  };

  const isExecuting =
    executionStatus === 'connecting' || executionStatus === 'connected';

  if (isLoading) {
    return <div className="flex justify-center py-8">Cargando...</div>;
  }

  return (
    <ComposerView
      workflowId={workflowId}
      name={name}
      yamlContent={yamlContent}
      description={description}
      saveError={saveError}
      saveStatus={saveStatus}
      isExecuting={isExecuting}
      isConnected={isConnected}
      executionStatus={
        isExecuting
          ? 'running'
          : executionStatus === 'completed'
            ? 'completed'
            : executionStatus === 'failed'
              ? 'failed'
              : undefined
      }
      output={output}
      steps={steps}
      onNameChange={setName}
      onDescriptionChange={setDescription}
      onYamlChange={setYamlContent}
      onSave={handleSave}
      onExecute={handleExecute}
    />
  );
};
