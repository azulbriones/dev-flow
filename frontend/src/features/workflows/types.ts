export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface WorkflowListItem {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface WorkflowDetail extends WorkflowListItem {
  yaml_content: string;
}

export type Workflow = WorkflowDetail;

export interface WorkflowCreate {
  name: string;
  yaml_content: string;
  description?: string;
}

export interface Execution {
  id: number;
  workflow_id: number | null;
  status: ExecutionStatus;
  output: string | null;
  started_at: string;
  finished_at: string | null;
  error_message: string | null;
}

export interface ExecutionCreate {
  workflow_id?: number;
  yaml?: string;
}
