import { useState, useEffect, useRef, useMemo } from 'react';

import type { TerminalPanelProps } from './types';
import './terminalPanel.scss';

// Mock log line coloring
const PROMPT_REGEX = /^\s*\$\s/;
const STEP_REGEX = /^\d+\/\d+/;
const SEPARATOR_REGEX = /^=+$/;

function getLineClass(line: string): string {
  if (PROMPT_REGEX.test(line)) return 'terminal__line--prompt';
  if (line.toLowerCase().includes('error') || line.toLowerCase().includes('failed'))
    return 'terminal__line--error';
  if (line.toLowerCase().includes('warning')) return 'terminal__line--warning';
  if (line.includes('✓') || line.includes('completed'))
    return 'terminal__line--success';
  if (STEP_REGEX.test(line)) return 'terminal__line--step';
  if (SEPARATOR_REGEX.test(line)) return 'terminal__line--separator';
  return '';
}

export const TerminalPanel = ({
  output,
  isConnected,
  isReconnecting = false,
  executionStatus,
  onStickyToggle,
  stickyEnabled = true,
  onFilter,
  filterQuery = '',
}: Readonly<TerminalPanelProps>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [localFilter, setLocalFilter] = useState(filterQuery);

  // Filter lines
  const filteredLines = useMemo(() => {
    if (!localFilter.trim()) return output.split('\n');
    const query = localFilter.toLowerCase();
    return output.split('\n').filter((line) => line.toLowerCase().includes(query));
  }, [output, localFilter]);

  // Auto-scroll when new output or sticky enabled
  useEffect(() => {
    if (stickyEnabled && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [output, stickyEnabled]);

  // Debounce filter
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilter?.(localFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [localFilter, onFilter]);

  const getStatusIndicator = () => {
    if (executionStatus === 'completed') {
      return (
        <span className="terminal__status terminal__status--success">✓ Completado</span>
      );
    }
    if (executionStatus === 'failed') {
      return <span className="terminal__status terminal__status--error">✗ Error</span>;
    }
    if (isReconnecting) {
      return (
        <span className="terminal__status terminal__status--warning">
          ⟳ Reconectando...
        </span>
      );
    }
    if (isConnected) {
      return (
        <span className="terminal__status terminal__status--running">● Ejecutando</span>
      );
    }
    return <span className="terminal__status">○ Esperando</span>;
  };

  return (
    <div className="terminal-panel">
      {/* Sticky Header */}
      <div className="terminal-panel__header">
        <div className="terminal-panel__title">
          <span className="terminal-panel__title-text">Salida</span>
          {getStatusIndicator()}
        </div>

        <div className="terminal-panel__actions">
          {/* Filter Input */}
          <div className="terminal-panel__filter">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Filtrar logs..."
              value={localFilter}
              onChange={(e) => setLocalFilter(e.target.value)}
            />
            {localFilter && (
              <button
                type="button"
                className="terminal-panel__filter-clear"
                onClick={() => setLocalFilter('')}
              >
                ×
              </button>
            )}
          </div>

          {/* Sticky Toggle */}
          <label className="terminal-panel__toggle">
            <input
              type="checkbox"
              checked={stickyEnabled}
              onChange={(e) => onStickyToggle?.(e.target.checked)}
            />
            <span>Auto-desplazar</span>
          </label>
        </div>
      </div>

      {/* Terminal Content */}
      <div ref={containerRef} className="terminal-panel__content">
        {filteredLines.length === 0 ? (
          <div className="terminal-panel__empty">
            {localFilter ? `No hay logs para "${localFilter}"` : 'No hay output'}
          </div>
        ) : (
          filteredLines.map((line, index) => (
            <div
              key={`${index}-${line.slice(0, 20)}`}
              className={`terminal__line log-line ${getLineClass(line)}`}
            >
              {line.includes('\u00A0') ? '' : line}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
