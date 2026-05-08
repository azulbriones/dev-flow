import { useQuery } from '@tanstack/react-query';

import type { UseQueryResult } from '@tanstack/react-query';
import { getWorkflows } from '../api/client';
import type { WorkflowListItem } from '../types';

export function useWorkflows(): UseQueryResult<WorkflowListItem[], Error> {
  return useQuery<WorkflowListItem[], Error>({
    queryKey: ['workflows'],
    queryFn: getWorkflows,
    staleTime: 1000 * 60 * 5, // 5 min cache
    gcTime: 1000 * 60 * 30, // 30 min garbage collection
  });
}
