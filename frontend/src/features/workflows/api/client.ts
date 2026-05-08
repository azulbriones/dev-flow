import { API_ENDPOINTS, API_URL, WS_URL } from '../../../lib/apiConfig';
import type {
  Execution,
  ExecutionCreate,
  WorkflowDetail,
  WorkflowListItem,
  WorkflowCreate,
} from '../types';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    // 204 has no body — safely cast undefined for void returns
    return undefined as unknown as T;
  }

  return response.json();
}

// Workflows
export async function getWorkflows(): Promise<WorkflowListItem[]> {
  return fetchJson<WorkflowListItem[]>(API_ENDPOINTS.workflows);
}

export async function getWorkflow(id: number): Promise<WorkflowDetail> {
  return fetchJson<WorkflowDetail>(`${API_ENDPOINTS.workflows}/${id}`);
}

export async function createWorkflow(data: WorkflowCreate): Promise<WorkflowDetail> {
  return fetchJson<WorkflowDetail>(API_ENDPOINTS.workflows, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteWorkflow(id: number): Promise<void> {
  return fetchJson<void>(`${API_ENDPOINTS.workflows}/${id}`, {
    method: 'DELETE',
  });
}

export async function updateWorkflow(
  id: number,
  data: WorkflowCreate
): Promise<WorkflowDetail> {
  return fetchJson<WorkflowDetail>(`${API_ENDPOINTS.workflows}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Executions
export async function getExecutions(params?: {
  workflowId?: number;
}): Promise<Execution[]> {
  const query = params?.workflowId ? `?workflow_id=${params.workflowId}` : '';
  return fetchJson<Execution[]>(`${API_ENDPOINTS.executions}${query}`);
}

export async function getExecution(id: number): Promise<Execution> {
  return fetchJson<Execution>(`${API_ENDPOINTS.executions}/${id}`);
}

export async function createExecution(data: ExecutionCreate): Promise<Execution> {
  return fetchJson<Execution>(API_ENDPOINTS.execute, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// WebSocket
export function connectStream(
  executionId: number,
  onMessage: (data: string) => void,
  onError?: () => void,
  onClose?: () => void
): WebSocket {
  const ws = new WebSocket(`${WS_URL}/execute/${executionId}/stream`);

  ws.onmessage = (event) => {
    onMessage(event.data);
  };

  ws.onerror = () => {
    onError?.();
  };

  ws.onclose = () => {
    onClose?.();
  };

  return ws;
}
