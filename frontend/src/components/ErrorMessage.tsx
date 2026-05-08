import './ErrorMessage.scss';

interface ErrorMessageProps {
  message?: string;
  title?: string;
  onRetry?: () => void;
}

export type ReadonlyErrorMessageProps = Readonly<ErrorMessageProps>;

export const ErrorMessage = ({
  message = 'Algo salió mal',
  title = 'Error',
  onRetry,
}: ReadonlyErrorMessageProps) => {
  return (
    <div className="error-message">
      <div className="error-message__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
      <div className="error-message__content">
        <h3 className="error-message__title">{title}</h3>
        <p className="error-message__text">{message}</p>
        {onRetry && (
          <button className="error-message__retry" onClick={onRetry}>
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
};
