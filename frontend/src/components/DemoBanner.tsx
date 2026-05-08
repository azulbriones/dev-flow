import { FEATURES } from '../config';
import './DemoBanner.css';

/**
 * DemoBanner - Shows when running in read-only demo mode
 * Displays a subtle banner explaining the demo limitations
 */
export const DemoBanner = () => {
  if (!FEATURES.showDemoBanner) return null;

  return (
    <div className="demo-banner">
      <div className="demo-banner__content">
        <svg
          className="demo-banner__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
        <span className="demo-banner__text">
          <strong>Modo demo:</strong> podés ver flujos de trabajo y ejecuciones, pero
          crear o editar está deshabilitado. Ejecutá localmente con{' '}
          <code>VITE_READ_ONLY_MODE=false</code> para tener la funcionalidad completa.
        </span>
      </div>
    </div>
  );
};
