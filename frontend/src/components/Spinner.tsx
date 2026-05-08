interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export type ReadonlySpinnerProps = Readonly<SpinnerProps>;

export const Spinner = ({ size = 'md' }: ReadonlySpinnerProps) => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div
      className={
        `${sizes[size]} border-2 border-gray-200 border-t-blue-600 ` +
        'rounded-full animate-spin'
      }
    />
  );
};
