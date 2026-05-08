/** Workflow Card types */

import type { ExecutionStatus, WorkflowListItem } from '../types';

// Re-export ExecutionStatus instead of duplicating
export type { ExecutionStatus } from '../types';
export type { Execution } from '../types';

export interface WorkflowCardProps {
  workflow: WorkflowListItem;
  lastExecutionStatus?: ExecutionStatus;
  onDelete?: (id: number, name: string) => void;
  onDeleteConfirm?: (id: number) => void;
  onEdit?: (workflow: WorkflowListItem) => void;
}

export interface WorkflowBadgeProps {
  status: ExecutionStatus;
}

export interface WorkflowMeta {
  createdAt: Date;
  lastExecution?: Date;
  stepCount: number;
}

export type ReadonlyWorkflowCardProps = Readonly<WorkflowCardProps>;
export type ReadonlyWorkflowBadgeProps = Readonly<WorkflowBadgeProps>;
