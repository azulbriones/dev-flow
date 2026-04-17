// Vite proxy: /api -> http://localhost:8000
export const API_URL = '/api';
export const WS_URL = 'ws://localhost:8000';
export const API_ENDPOINTS = {
  workflows: '/workflows',
  executions: '/executions',
  execute: '/execute',
} as const;
