import { useState, useEffect, useMemo, useRef } from 'react';
import type { ConnectionStatus } from '../types/stream';
import { WS_URL } from '../../../lib/apiConfig';

interface UseExecutionOutputResult {
  output: string;
  isConnected: boolean;
  isReconnecting: boolean;
  executionStatus: ConnectionStatus;
  executedSteps: Set<string>;
  currentStepName: string | null;
}

/** Real WebSocket stream for execution output.
 * Tracks ALL executed steps for proper DAG progress. */
export function useExecutionOutput(
  executionId: number | null
): UseExecutionOutputResult {
  // All state in a single object to batch resets
  type ExecutionState = {
    output: string;
    isConnected: boolean;
    isReconnecting: boolean;
    executionStatus: ConnectionStatus;
  };
  const [state, setState] = useState<ExecutionState>({
    output: '',
    isConnected: false,
    isReconnecting: false,
    executionStatus: 'idle',
  });
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket lifecycle
  useEffect(() => {
    if (!executionId) {
      wsRef.current?.close();
      wsRef.current = null;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({
        output: '',
        isConnected: false,
        isReconnecting: false,
        executionStatus: 'idle',
      });
      return;
    }

    setState((prev) => ({ ...prev, executionStatus: 'connecting' }));

    const ws = new WebSocket(`${WS_URL}/execute/${executionId}/stream`);

    ws.onopen = () => {
      setState({
        output: '',
        isConnected: true,
        isReconnecting: false,
        executionStatus: 'connected',
      });
    };

    ws.onmessage = (event) => {
      setState((prev) => ({
        ...prev,
        output: prev.output + event.data,
      }));
    };

    ws.onclose = () => {
      setState((prev) => ({
        ...prev,
        isConnected: false,
        isReconnecting: false,
        executionStatus: 'completed',
      }));
    };

    ws.onerror = () => {
      setState((prev) => ({
        ...prev,
        isConnected: false,
        isReconnecting: false,
        executionStatus: 'failed',
      }));
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [executionId]);

  // Parse ALL executed steps and current step from output using RegExp.exec()
  const { executedSteps, currentStepName } = useMemo(() => {
    const lines = state.output.split('\n');
    const executed = new Set<string>();
    const current = { value: null as string | null };
    const STEP_REGEX = /^\[(\d+)\/(\d+)\]\s+(.+)$/;

    for (const line of lines) {
      const match = STEP_REGEX.exec(line);
      if (match) {
        const stepName = match[3];
        executed.add(stepName);
        current.value = stepName;
      }
    }

    return { executedSteps: executed, currentStepName: current.value };
  }, [state.output]);

  return { ...state, executedSteps, currentStepName };
}
