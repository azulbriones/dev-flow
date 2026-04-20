// Direct backend URL (no proxy needed with /api prefix)
export const API_URL = 'http://localhost:8000';
export const WS_URL = 'ws://localhost:8000';
export const API_ENDPOINTS = {
  workflows: '/api/workflows',
  executions: '/api/executions',
  execute: '/api/execute',
} as const;
