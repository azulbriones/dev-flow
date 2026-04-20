import { Spinner } from '../../../components/Spinner';

interface ExecutionStreamProps {
  output: string;
  isConnected: boolean;
}

export const ExecutionStream = ({ output, isConnected }: ExecutionStreamProps) => {
  return (
    <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm h-64 overflow-auto">
      {isConnected ? (
        <>
          <div className="flex items-center gap-2 mb-2 text-green-400">
            <Spinner size="sm" />
            <span>Conectado</span>
          </div>
          <pre className="whitespace-pre-wrap">{output || 'Esperando salida...'}</pre>
        </>
      ) : (
        <span className="text-gray-500">Desconectado</span>
      )}
    </div>
  );
};