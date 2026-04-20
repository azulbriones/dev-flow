import { useWorkflows } from '../features/workflows/hooks/useWorkflows';
import { useMutateWorkflow } from '../features/workflows/hooks/useMutateWorkflow';
import { WorkflowList } from '../features/workflows/components/WorkflowList';
import { WorkflowForm } from '../features/workflows/components/WorkflowForm';
import { ErrorMessage } from '../components/ErrorMessage';
import { Spinner } from '../components/Spinner';

export const Dashboard = () => {
  const { data: workflows, isLoading, error } = useWorkflows();
  const { create, remove } = useMutateWorkflow();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message="Error al cargar workflows" />;
  }

  const handleDelete = (id: number): void => {
    if (confirm('¿Eliminar workflow?')) {
      remove.mutate(id);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">Workflows</h1>
        <WorkflowList workflows={workflows || []} onDelete={handleDelete} />
      </div>
      <div className="border-t pt-6">
        <h2 className="text-xl font-bold mb-4">Nuevo Workflow</h2>
        <WorkflowForm
          onSubmit={(data) => create.mutate(data)}
          isLoading={create.isPending}
        />
        {create.isError && <ErrorMessage message="Error al crear workflow" />}
      </div>
    </div>
  );
};