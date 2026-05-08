import {
  useMutation,
  useQueryClient,
  type QueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';

import { createWorkflow, deleteWorkflow, updateWorkflow } from '../api/client';
import type { WorkflowCreate, WorkflowDetail, WorkflowListItem } from '../types';

function updateWorkflowCaches(queryClient: QueryClient, workflow: WorkflowDetail) {
  queryClient.setQueryData<WorkflowDetail>(['workflow', workflow.id], workflow);
  queryClient.setQueryData<WorkflowListItem[]>(['workflows'], (current) => {
    if (!current)
      return [
        {
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          created_at: workflow.created_at,
          updated_at: workflow.updated_at,
        },
      ];

    return current.map((item) =>
      item.id === workflow.id
        ? {
            ...item,
            name: workflow.name,
            description: workflow.description,
            updated_at: workflow.updated_at,
          }
        : item
    );
  });
  queryClient.invalidateQueries({ queryKey: ['workflows'] });
}

function insertWorkflowCaches(queryClient: QueryClient, workflow: WorkflowDetail) {
  queryClient.setQueryData<WorkflowDetail>(['workflow', workflow.id], workflow);
  queryClient.setQueryData<WorkflowListItem[]>(['workflows'], (current) => {
    const nextItem: WorkflowListItem = {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      created_at: workflow.created_at,
      updated_at: workflow.updated_at,
    };

    if (!current) return [nextItem];

    return [nextItem, ...current.filter((item) => item.id !== workflow.id)];
  });
  queryClient.invalidateQueries({ queryKey: ['workflows'] });
}

interface UseMutateWorkflowReturn {
  create: UseMutationResult<WorkflowDetail, Error, WorkflowCreate>;
  remove: UseMutationResult<void, Error, number>;
  update: UseMutationResult<
    WorkflowDetail,
    Error,
    { id: number; data: WorkflowCreate }
  >;
}

export function useMutateWorkflow(): UseMutateWorkflowReturn {
  const queryClient = useQueryClient();

  const create = useMutation<WorkflowDetail, Error, WorkflowCreate>({
    mutationFn: (data: WorkflowCreate): Promise<WorkflowDetail> => createWorkflow(data),
    onSuccess: (workflow: WorkflowDetail): void => {
      insertWorkflowCaches(queryClient, workflow);
    },
  });

  const remove = useMutation<void, Error, number>({
    mutationFn: (id: number): Promise<void> => deleteWorkflow(id),
    onSuccess: (): void => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });

  const update = useMutation<
    WorkflowDetail,
    Error,
    { id: number; data: WorkflowCreate }
  >({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: WorkflowCreate;
    }): Promise<WorkflowDetail> => updateWorkflow(id, data),
    onSuccess: (workflow: WorkflowDetail): void => {
      updateWorkflowCaches(queryClient, workflow);
    },
  });

  return { create, remove, update };
}
