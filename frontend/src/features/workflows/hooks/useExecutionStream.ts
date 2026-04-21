import { useEffect, useRef, useState, useCallback } from 'react';

import { connectStream } from '../api/client';

interface UseExecutionStreamOptions {
  executionId: number;
  enabled?: boolean;
  bufferSize?: number;
  flushInterval?: number;
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
  bufferSize = 100,
  flushInterval = 50,
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

  // Buffer for batching updates
  const bufferRef = useRef<string[]>([]);
  const flushTimeoutRef = useRef<number | null>(null);

  const reconnectConfig: ReconnectConfig = {
    maxRetries: 5,
    baseDelay: 1000,
    maxDelay: 30000,
  };

  const flushBuffer = useCallback((): void => {
    if (bufferRef.current.length === 0) return;

    const chunk = bufferRef.current.join('');
    bufferRef.current = [];

    setOutput((prev) => prev + chunk);
  }, []);

  const scheduleFlush = useCallback((): void => {
    if (flushTimeoutRef.current) return;

    flushTimeoutRef.current = window.setTimeout(() => {
      flushTimeoutRef.current = null;
      flushBuffer();
    }, flushInterval);
  }, [flushInterval, flushBuffer]);

  const onMessage = useCallback(
    (data: string): void => {
      bufferRef.current.push(data);

      if (bufferRef.current.length >= bufferSize) {
        flushBuffer();
      } else {
        scheduleFlush();
      }
    },
    [bufferSize, flushBuffer, scheduleFlush]
  );

  const onError = useCallback((): void => {
    setIsConnected(false);
    attemptReconnect();
  }, []);

  const onClose = useCallback((): void => {
    setIsConnected(false);
    attemptReconnect();
  }, []);

  const attemptReconnect = (): void => {
    // Don't reconnect if executionId is invalid
    if (!executionId || executionId <= 0) {
      setIsReconnecting(false);
      return;
    }

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
      // Check again before reconnecting
      if (executionId && executionId > 0) {
        connect();
        setIsReconnecting(false);
      }
    }, waitTime);
  };

  const connect = (): void => {
    // Don't connect if executionId is invalid
    if (!executionId || executionId <= 0) {
      return;
    }

    const ws = connectStream(executionId, onMessage, onError, onClose);
    wsRef.current = ws;
    setIsConnected(true);
  };

  useEffect(() => {
    // Skip if no valid execution ID
    if (!enabled || !executionId || executionId <= 0) {
      // Cleanup if we have an open connection
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsConnected(false);
      setIsReconnecting(false);
      return;
    }

    reconnectAttemptsRef.current = 0;
    bufferRef.current = [];
    connect();

    return (): void => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      wsRef.current = null;
    };
  }, [executionId, enabled]);

  return { output, isConnected, isReconnecting };
}