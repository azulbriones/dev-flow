import type { QueryClient } from '@tanstack/react-query';

import type { Workflow, WorkflowListItem } from '../types';

export const syncWorkflowCaches = (queryClient: QueryClient, workflow: Workflow) => {
  queryClient.setQueryData(['workflow', workflow.id], workflow);
  queryClient.setQueryData<WorkflowListItem[]>(['workflows'], (current) => {
    if (!current) {
      return [
        {
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          created_at: workflow.created_at,
          updated_at: workflow.updated_at,
        },
      ];
    }

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
};

export const insertWorkflowCaches = (queryClient: QueryClient, workflow: Workflow) => {
  queryClient.setQueryData(['workflow', workflow.id], workflow);
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
};
