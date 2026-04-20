import { useEffect, useRef, useState } from 'react';

import { connectStream } from '../api/client';

interface UseExecutionStreamOptions {
  executionId: number;
  enabled?: boolean;
}

export function useExecutionStream({
  executionId,
  enabled = true,
}: UseExecutionStreamOptions): { output: string; isConnected: boolean } {
  const [output, setOutput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled || !executionId) return;

    const onMessage = (data: string): void => {
      setOutput((prev) => prev + data);
    };

    const onError = (): void => {
      setIsConnected(false);
    };

    const ws = connectStream(executionId, onMessage, onError);
    wsRef.current = ws;
    setIsConnected(true);

    ws.addEventListener('close', (): void => {
      setIsConnected(false);
    });

    return (): void => {
      ws.close();
      wsRef.current = null;
    };
  }, [executionId, enabled]);

  return { output, isConnected };
}