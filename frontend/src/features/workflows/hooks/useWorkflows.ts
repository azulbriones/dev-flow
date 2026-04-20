import { useQuery } from '@tanstack/react-query';

import { getWorkflows } from '../api/client';
import type { Workflow } from '../types';
import type { UseQueryResult } from '@tanstack/react-query';

export function useWorkflows(): UseQueryResult<Workflow[], Error> {
  return useQuery<Workflow[], Error>({
    queryKey: ['workflows'],
    queryFn: (): Promise<Workflow[]> => getWorkflows(),
  });
}