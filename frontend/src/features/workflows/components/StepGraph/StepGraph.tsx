import type { WorkflowStep, StepGraphProps } from '../WorkflowDetailLayout/types';
import './stepGraph.scss';

export const StepGraph = ({ steps, currentStepId }: StepGraphProps) => {
  const rootSteps = steps.filter((s) => s.dependsOn.length === 0);

  const getDownstream = (stepId: string): WorkflowStep[] => {
    return steps.filter((s) => s.dependsOn.includes(stepId));
  };

  const renderStep = (step: WorkflowStep, level: number = 0): React.ReactNode => {
    const downstream = getDownstream(step.id);
    const isCurrent = currentStepId === step.id;

    const nodeClasses = [
      'step-graph__node',
      `step-graph__node--${step.status}`,
      isCurrent ? 'step-graph__node--current' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div key={step.id} className="step-graph__node-wrapper">
        <div className={nodeClasses}>
          <span className={`led led--${step.status}`} />
          <span className="step-graph__node-name">{step.name}</span>
          <span
            className={`step-graph__node-badge step-graph__node-badge--${step.status}`}
          >
            {step.status}
          </span>
        </div>

        {downstream.length > 0 && (
          <>
            <div className="step-graph__connector">
              <div className="step-graph__line" />
            </div>
            <div className="step-graph__downstream">
              {downstream.map((child) => renderStep(child, level + 1))}
            </div>
          </>
        )}
      </div>
    );
  };

  if (steps.length === 0) {
    return (
      <div className="step-graph step-graph--empty">
        <p>No hay pasos definidos</p>
      </div>
    );
  }

  return (
    <div className="step-graph">
      <div className="step-graph__title">Dependencias</div>
      <div className="step-graph__content">
        {rootSteps.map((step) => renderStep(step))}
      </div>
    </div>
  );
};
