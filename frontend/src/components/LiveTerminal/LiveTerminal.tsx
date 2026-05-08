import { useState, useRef, useEffect } from 'react';
import './LiveTerminal.scss';

export interface LiveTerminalProps {
  output: string;
  executionStatus?: string;
}

export type ReadonlyLiveTerminalProps = Readonly<LiveTerminalProps>;

/**
 * LiveTerminal - Streaming output display

 */
export const LiveTerminal = ({
  output,
  executionStatus,
}: Readonly<LiveTerminalProps>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-desplazarse cuando llega nuevo output
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [output, autoScroll]);

  const getStatusClass = (status?: string): string => {
    if (status === 'completed') return 'text-success';
    if (status === 'failed') return 'text-error';
    if (status === 'running') return 'text-warning';
    return 'text-muted';
  };

  const getStatusLabel = (status?: string): string => {
    if (status === 'completed') return 'COMPLETADO';
    if (status === 'failed') return 'ERROR';
    if (status === 'running') return 'EJECUTANDO';
    return 'INACTIVO';
  };

  const lines = output.split('\n').filter((line) => line.trim());

  return (
    <div className="live-terminal">
      <div className="live-terminal__header">
        <div className="live-terminal__status">
          <span>Salida en vivo</span>
          <span
            className={`live-terminal__status-indicator ${getStatusClass(
              executionStatus
            )}`}
          >
            {getStatusLabel(executionStatus)}
          </span>
        </div>
        <div className="live-terminal__actions">
          <label className="live-terminal__toggle">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
            Auto-desplazar {autoScroll ? 'Sí' : 'No'}
          </label>
        </div>
      </div>
      <div ref={containerRef} className="live-terminal__content">
        {lines.length === 0 ? (
          <div className="live-terminal__empty">
            # Esperando señal de ejecución...
          </div>
        ) : (
          lines.map((line, index) => {
            const lineClass = line.includes('SUCCESS')
              ? 'text-success'
              : line.includes('ERROR')
                ? 'text-error'
                : line.includes('WARNING') || line.includes('WARN')
                  ? 'text-warning'
                  : line.includes('INFO') || line.includes('STEP')
                    ? 'text-accent'
                    : 'text-muted';

            return (
              <div
                key={`line-${index + 1}`}
                className={`live-terminal__line ${lineClass}`}
              >
                <span className="live-terminal__line-index">{index + 1}</span>
                <span>{line}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
