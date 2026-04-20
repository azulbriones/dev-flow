interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
      {message}
    </div>
  );
};