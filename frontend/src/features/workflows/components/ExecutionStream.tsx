import { Spinner } from '../../../components/Spinner';

interface ExecutionStreamProps {
  output: string;
  isConnected: boolean;
  isReconnecting?: boolean;
}

export const ExecutionStream = ({
  output,
  isConnected,
  isReconnecting = false,
}: ExecutionStreamProps) => {
  return (
    <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm h-64 overflow-auto">
      {isReconnecting ? (
        <div className="flex items-center gap-2 mb-2 text-yellow-400">
          <Spinner size="sm" />
          <span>Reconectando...</span>
        </div>
      ) : isConnected ? (
        <div className="flex items-center gap-2 mb-2 text-green-400">
          <Spinner size="sm" />
          <span>Conectado</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-2 text-gray-500">
          <Spinner size="sm" />
          <span>Esperando conexion...</span>
        </div>
      )}
      <pre className="whitespace-pre-wrap">{output || 'Esperando salida...'}</pre>
    </div>
  );
};