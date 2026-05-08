import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';

import { createExecution } from '../api/client';
import type { ExecutionCreate, Execution } from '../types';

export function useExecute(): UseMutationResult<Execution, Error, ExecutionCreate> {
  const queryClient = useQueryClient();

  return useMutation<Execution, Error, ExecutionCreate>({
    mutationFn: (data: ExecutionCreate): Promise<Execution> => createExecution(data),
    onSuccess: (): void => {
      queryClient.invalidateQueries({ queryKey: ['executions'] });
    },
  });
}
