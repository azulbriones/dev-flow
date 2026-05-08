import './YamlEditor.scss';

export interface YamlEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

export type ReadonlyYamlEditorProps = Readonly<YamlEditorProps>;

/**
 * YamlEditor - Code editor with line numbers

 */
export const YamlEditor = ({
  value,
  onChange,
  readOnly = false,
}: Readonly<YamlEditorProps>) => {
  const lines = value.split('\n');

  return (
    <div className="yaml-editor">
      <div className="yaml-editor__header">
        <span className="yaml-editor__title">Definición YAML</span>
        <div className="yaml-editor__dots">
          <span className="yaml-editor__dot yaml-editor__dot--close" />
          <span className="yaml-editor__dot yaml-editor__dot--min" />
          <span className="yaml-editor__dot yaml-editor__dot--max" />
        </div>
      </div>
      <div className="yaml-editor__content">
        <div className="yaml-editor__lines">
          {lines.map((_, index) => (
            <span key={`line-${index + 1}`} className="yaml-editor__line-number">
              {index + 1}
            </span>
          ))}
        </div>
        <textarea
          className="yaml-editor__textarea"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
          spellCheck={false}
        />
      </div>
    </div>
  );
};
