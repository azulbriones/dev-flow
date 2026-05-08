import type { ReactNode } from 'react';
import './workflowDetailLayout.scss';

export interface WorkflowDetailLayoutProps {
  /** Left panel content: YAML Viewer + Step Graph */
  leftPanel: ReactNode;
  /** Right panel content: Terminal Output */
  rightPanel: ReactNode;
}

export type ReadonlyWorkflowDetailLayoutProps = Readonly<WorkflowDetailLayoutProps>;

/**
 * WorkflowDetailLayout - 2 Column Grid
 *
 * Left: YAML Viewer + Step Graph (fixed width 420px)
 * Right: Terminal Output (fluid)
 */
export const WorkflowDetailLayout = ({
  leftPanel,
  rightPanel,
}: Readonly<WorkflowDetailLayoutProps>) => {
  return (
    <div className="workflow-detail-layout">
      <div className="workflow-detail-layout__left">{leftPanel}</div>
      <div className="workflow-detail-layout__right">{rightPanel}</div>
    </div>
  );
};
