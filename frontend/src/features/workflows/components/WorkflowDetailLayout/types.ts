/** Workflow Detail Layout Types */

import type { ReactNode } from 'react';

export interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  dependsOn: string[];
}

export interface WorkflowDetailLayoutProps {
  children: ReactNode;
  leftPanel: ReactNode;
  rightPanel: ReactNode;
}

export interface StepGraphProps {
  steps: WorkflowStep[];
  currentStepId?: string;
}

export interface TerminalPanelProps {
  output: string;
  isConnected: boolean;
  isReconnecting?: boolean;
  executionStatus?: string;
  onStickyToggle?: (enabled: boolean) => void;
  stickyEnabled?: boolean;
  onFilter?: (query: string) => void;
  filterQuery?: string;
}

export type ReadonlyWorkflowDetailLayoutProps = Readonly<WorkflowDetailLayoutProps>;
export type ReadonlyStepGraphProps = Readonly<StepGraphProps>;
export type ReadonlyTerminalPanelProps = Readonly<TerminalPanelProps>;
