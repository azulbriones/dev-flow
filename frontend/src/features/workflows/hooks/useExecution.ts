import { useQuery, type QueryObserverResult } from '@tanstack/react-query';

import { getExecution } from '../api/client';
import type { Execution } from '../types';

function shouldRefetch(query: QueryObserverResult<Execution>): number | false {
  const data = query.state.data;
  if (!data) return false;
  if (data.status === 'completed' || data.status === 'failed') return false;
  return 2000;
}

export function useExecution(executionId: number): ReturnType<typeof useQuery> {
  return useQuery({
    queryKey: ['execution', executionId],
    queryFn: (): Promise<Execution> => getExecution(executionId),
    enabled: !!executionId,
    refetchInterval: shouldRefetch,
  });
}