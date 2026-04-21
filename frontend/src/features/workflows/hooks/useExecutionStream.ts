import { useEffect, useRef, useState } from 'react';

import { connectStream } from '../api/client';

interface UseExecutionStreamOptions {
  executionId: number;
  enabled?: boolean;
}

interface ReconnectConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

function exponentialBackoff(attempt: number, config: ReconnectConfig): number {
  const { baseDelay, maxDelay } = config;
  return Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
}

export function useExecutionStream({
  executionId,
  enabled = true,
}: UseExecutionStreamOptions): {
  output: string;
  isConnected: boolean;
  isReconnecting: boolean;
} {
  const [output, setOutput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const reconnectConfig: ReconnectConfig = {
    maxRetries: 5,
    baseDelay: 1000,
    maxDelay: 30000,
  };

  const connect = (): void => {
    const onMessage = (data: string): void => {
      setOutput((prev) => prev + data);
    };

    const onError = (): void => {
      setIsConnected(false);
      attemptReconnect();
    };

    const onClose = (): void => {
      setIsConnected(false);
      attemptReconnect();
    };

    const ws = connectStream(executionId, onMessage, onError, onClose);
    wsRef.current = ws;
    setIsConnected(true);
  };

  const attemptReconnect = (): void => {
    if (reconnectAttemptsRef.current >= reconnectConfig.maxRetries) {
      setIsReconnecting(false);
      return;
    }

    setIsReconnecting(true);
    const waitTime = exponentialBackoff(
      reconnectAttemptsRef.current,
      reconnectConfig
    );
    reconnectAttemptsRef.current += 1;

    reconnectTimeoutRef.current = window.setTimeout(() => {
      connect();
      setIsReconnecting(false);
    }, waitTime);
  };

  useEffect(() => {
    if (!enabled || !executionId) return;

    reconnectAttemptsRef.current = 0;
    connect();

    return (): void => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      wsRef.current = null;
    };
  }, [executionId, enabled]);

  return { output, isConnected, isReconnecting };
}