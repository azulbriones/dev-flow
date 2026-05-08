import { useMemo } from 'react';

import { Spinner } from '../Spinner';
import type { ReadonlyButtonProps } from './types';

import './button.scss';

const VARIANT_CLASSES: Record<string, string> = {
  primary: 'button--primary',
  secondary: 'button--secondary',
  danger: 'button--danger',
  ghost: 'button--ghost',
};

const SIZE_CLASSES: Record<string, string> = {
  sm: 'button--sm',
  md: 'button--md',
  lg: 'button--lg',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  icon,
  iconPosition = 'left',
  disabled = false,
  type = 'button',
  className = '',
  onClick,
}: ReadonlyButtonProps) => {
  const isDisabled = disabled || isLoading;

  const variantClass = VARIANT_CLASSES[variant];
  const sizeClass = SIZE_CLASSES[size];

  const buttonContent = useMemo(() => {
    if (isLoading) {
      return (
        <>
          <Spinner size={size === 'sm' ? 'xs' : 'sm'} />
          <span>{loadingText || 'Cargando...'}</span>
        </>
      );
    }

    const iconEl = icon && <span className="button__icon">{icon}</span>;

    if (iconEl && iconPosition === 'left') {
      return (
        <>
          {iconEl}
          <span>{children}</span>
        </>
      );
    }

    if (iconEl && iconPosition === 'right') {
      return (
        <>
          <span>{children}</span>
          {iconEl}
        </>
      );
    }

    return <span>{children}</span>;
  }, [isLoading, loadingText, icon, iconPosition, children, size]);

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`button ${variantClass} ${sizeClass} ${className}`}
      onClick={onClick}
    >
      {buttonContent}
    </button>
  );
};
