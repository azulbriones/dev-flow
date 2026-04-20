import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { createWorkflow, deleteWorkflow } from '../api/client';
import type { WorkflowCreate, Workflow } from '../types';

interface UseMutateWorkflowReturn {
  create: UseMutationResult<Workflow, Error, WorkflowCreate>;
  remove: UseMutationResult<void, Error, number>;
}

export function useMutateWorkflow(): UseMutateWorkflowReturn {
  const queryClient = useQueryClient();

  const create = useMutation<Workflow, Error, WorkflowCreate>({
    mutationFn: (data: WorkflowCreate): Promise<Workflow> => createWorkflow(data),
    onSuccess: (): void => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });

  const remove = useMutation<void, Error, number>({
    mutationFn: (id: number): Promise<void> => deleteWorkflow(id),
    onSuccess: (): void => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });

  return { create, remove };
}