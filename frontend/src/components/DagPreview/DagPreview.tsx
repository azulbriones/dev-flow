import './DagPreview.scss';

export interface DagStep {
  name: string;
  status: 'done' | 'in-progress' | 'waiting' | 'failed';
}

export interface DagPreviewProps {
  steps: DagStep[];
}

export type ReadonlyDagPreviewProps = Readonly<DagPreviewProps>;

/**
 * DagPreview - Visualize workflow DAG

 */
export const DagPreview = ({ steps }: Readonly<DagPreviewProps>) => {
  const getStatusClass = (status: DagStep['status']): string => {
    const map: Record<DagStep['status'], string> = {
      done: 'dag-node--done',
      'in-progress': 'dag-node--running',
      waiting: 'dag-node--waiting',
      failed: 'dag-node--failed',
    };
    return map[status];
  };

  const getStatusLabel = (status: DagStep['status']): string => {
    const map: Record<DagStep['status'], string> = {
      done: 'HECHO',
      'in-progress': 'EN PROGRESO',
      waiting: 'EN ESPERA',
      failed: 'FALLIDO',
    };
    return map[status];
  };

  if (steps.length === 0) {
    return <div className="dag-preview dag-preview--empty">No hay pasos definidos</div>;
  }

  return (
    <div className="dag-preview">
      <h4 className="dag-preview__title">Vista previa del DAG</h4>
      <div className="dag-preview__nodes">
        {steps.map((step, index) => (
          <div key={step.name} className="dag-preview__item">
            <div className={`dag-node ${getStatusClass(step.status)}`}>
              <span className="dag-node__name">{step.name}</span>
              <span className="dag-node__status">{getStatusLabel(step.status)}</span>
            </div>
            {index < steps.length - 1 && (
              <div className="dag-preview__connector">
                <div className="dag-preview__line" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
