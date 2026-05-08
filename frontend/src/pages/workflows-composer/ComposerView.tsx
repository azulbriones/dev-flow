import { Link } from 'react-router-dom';

import { Button } from '../../components/Button';
import { DagPreview } from '../../components/DagPreview';
import { LiveTerminal } from '../../components/LiveTerminal';
import { YamlEditor } from '../../components/YamlEditor';
import type {
  WorkflowStep,
} from '../../features/workflows/components/WorkflowDetailLayout';

export interface ComposerViewProps {
  workflowId: number | null;
  name: string;
  yamlContent: string;
  description: string;
  saveError: string;
  saveStatus: 'idle' | 'saving' | 'saved';
  isExecuting: boolean;
  isConnected: boolean;
  executionStatus: string | undefined;
  output: string;
  steps: WorkflowStep[];
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onYamlChange: (value: string) => void;
  onSave: () => void;
  onExecute: () => void;
}

export const ComposerView = ({
  workflowId,
  name,
  yamlContent,
  description,
  saveError,
  saveStatus,
  isExecuting,
  isConnected,
  executionStatus,
  output,
  steps,
  onNameChange,
  onDescriptionChange,
  onYamlChange,
  onSave,
  onExecute,
}: ComposerViewProps) => {
  return (
    <div className="workflows-composer">
      <div className="workflows-composer__header">
        <Link to="/workflows" className="workflows-composer__back">
          ← Volver
        </Link>
        <div className="workflows-composer__breadcrumb">
          Flujos de trabajo
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
          <span className={workflowId ? '' : 'text-accent'}>
            {workflowId ? `Editando: ${name}` : 'Nuevo flujo de trabajo'}
          </span>
        </div>
      </div>

      <div className="workflows-composer__form">
        <div className="workflows-composer__form-row">
          <div className="workflows-composer__field">
            <label htmlFor="workflow-name">Nombre del flujo de trabajo</label>
            <input
              id="workflow-name"
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className="workflows-composer__input mono"
            />
          </div>
          <div className="workflows-composer__field">
            <label htmlFor="workflow-description">Descripción</label>
            <input
              id="workflow-description"
              type="text"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="workflows-composer__input"
              placeholder="Descripción del flujo de trabajo..."
            />
          </div>
          <div className="workflows-composer__actions">
            <Button
              onClick={onSave}
              variant="secondary"
              disabled={saveStatus === 'saving'}
            >
              {saveStatus === 'saving'
                ? 'Guardando...'
                : workflowId
                  ? 'Guardar'
                  : 'Crear'}
            </Button>
            <Button onClick={onExecute} disabled={isExecuting}>
              {isExecuting
                ? isConnected
                  ? 'Ejecutando...'
                  : 'Iniciando...'
                : workflowId
                  ? 'Ejecutar'
                  : 'Crear y ejecutar'}
            </Button>
          </div>
        </div>
        {saveError ? <p className="workflows-composer__error">{saveError}</p> : null}
        {!saveError && saveStatus === 'saved' ? (
          <p className="workflows-composer__success">
            Flujo de trabajo guardado correctamente
          </p>
        ) : null}
      </div>

      <div className="workflows-composer__main">
        <div className="workflows-composer__editor">
          <YamlEditor value={yamlContent} onChange={onYamlChange} />
        </div>
        <div className="workflows-composer__terminal">
          <LiveTerminal output={output} executionStatus={executionStatus} />
        </div>
      </div>

      <div className="workflows-composer__dag">
        <DagPreview steps={steps} />
      </div>
    </div>
  );
};
