import type { WorkflowStep } from './types';
import { StepGraph } from '../StepGraph/StepGraph';

interface LeftPanelProps {
  yamlContent?: string;
  steps?: WorkflowStep[];
  currentStepId?: string;
}

export type ReadonlyLeftPanelProps = Readonly<LeftPanelProps>;

export const LeftPanel = ({
  yamlContent,
  steps = [],
  currentStepId,
}: ReadonlyLeftPanelProps) => {
  return (
    <div className="workflow-detail__left">
      {/* YAML Viewer - Simulated */}
      <div className="yaml-viewer">
        <div className="yaml-viewer__header">
          <span className="yaml-viewer__title">YAML</span>
          <span className="yaml-viewer__filename">workflow.yaml</span>
        </div>
        <div className="yaml-viewer__content">
          <pre>
            <code>
              {yamlContent ||
                `# YAML no disponible
name: Flujo de trabajo de ejemplo
version: 1.0.0

steps:
  - name: Compilar
    run: npm run build
  - name: Probar
    run: npm test
    depends_on: [Compilar]
  - name: Desplegar
    run: npm run deploy
    depends_on: [Probar]`}
            </code>
          </pre>
        </div>
      </div>

      {/* Step Graph */}
      <StepGraph steps={steps} currentStepId={currentStepId} />
    </div>
  );
};
