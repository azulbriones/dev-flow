// Direct backend URL (no proxy needed)
export const API_URL = "http://localhost:8000";
export const WS_URL = "ws://localhost:8000";
export const API_ENDPOINTS = {
  workflows: "/api/v1/workflows",
  executions: "/api/v1/executions",
  execute: "/api/v1/execute",
} as const;