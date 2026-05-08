import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useWorkflows } from '../features/workflows/hooks/useWorkflows';
import { useMutateWorkflow } from '../features/workflows/hooks/useMutateWorkflow';
import { ErrorMessage } from '../components/ErrorMessage';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { EmptyState } from '../components/EmptyState';
import { WorkflowList } from '../features/workflows/components/WorkflowList';
import { usePermissions } from '../lib/permissions';
import type { WorkflowListItem } from '../features/workflows/types';
import './Workflows.scss';

export const Workflows = () => {
  const navigate = useNavigate();
  const { data: workflows, isLoading, error } = useWorkflows();
  const { remove } = useMutateWorkflow();
  const permissions = usePermissions();

  const [searchQuery, setSearchQuery] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Pick<
    WorkflowListItem,
    'id' | 'name'
  > | null>(null);

  // Filter workflows by search
  const filteredWorkflows = useMemo(() => {
    if (!searchQuery.trim() || !workflows) return workflows;
    const query = searchQuery.toLowerCase();
    return workflows.filter(
      (w) =>
        w.name.toLowerCase().includes(query) ||
        w.description?.toLowerCase().includes(query)
    );
  }, [workflows, searchQuery]);

  const visibleWorkflows = filteredWorkflows || [];

  const handleDelete = (id: number, name: string): void => {
    if (!permissions.canDelete) {
      toast.error(permissions.getBlockedMessage('delete'));
      return;
    }

    setPendingDelete({ id, name });
  };

  const confirmDelete = (): void => {
    if (!pendingDelete) return;

    const { id, name } = pendingDelete;
    setPendingDelete(null);

    remove.mutate(id, {
      onSuccess: () => toast.success(`Flujo de trabajo "${name}" eliminado`),
      onError: () => toast.error('Error al eliminar el flujo de trabajo'),
    });
  };

  const handleEdit = (workflow: WorkflowListItem): void => {
    if (!permissions.canEdit) {
      toast.error(permissions.getBlockedMessage('edit'));
      return;
    }
    navigate(`/workflows/${workflow.id}`);
  };

  const handleNewWorkflow = () => {
    if (!permissions.canCreate) {
      toast.error(permissions.getBlockedMessage('create'));
      return;
    }
    navigate('/workflows/new');
  };

  // Loading state
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <ErrorMessage message="Error al cargar flujos de trabajo" />;
  }

  // Empty state
  if (!workflows || workflows.length === 0) {
    return (
      <div className="workflows-page">
        <div className="workflows-page__header">
          <div className="workflows-page__title">
            <h1>Flujos de trabajo</h1>
            <p className="workflows-page__subtitle">
              Gestioná tus definiciones de flujos de trabajo
            </p>
            <p className="workflows-page__meta">
              Buscá, editá y creá flujos de trabajo desde un solo lugar
            </p>
          </div>
          {permissions.canCreate && (
            <button className="workflows-page__new-btn" onClick={handleNewWorkflow}>
              + Nuevo flujo de trabajo
            </button>
          )}
        </div>
        <div className="workflows-page__empty">
          <EmptyState
            icon="info"
            title="Todavía no hay flujos de trabajo"
            description={
              permissions.canCreate
                ? 'Creá tu primer flujo de trabajo para empezar'
                : 'No hay flujos de trabajo disponibles en esta demo'
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="workflows-page">
      {/* Header with Search */}
      <div className="workflows-page__header">
        <div className="workflows-page__title">
          <h1>Flujos de trabajo</h1>
          <p className="workflows-page__subtitle">
            Gestioná tus definiciones de flujos de trabajo
          </p>
          <p className="workflows-page__meta">
            Buscá, editá y creá flujos de trabajo desde un solo lugar
          </p>
        </div>
        <div className="workflows-page__header-actions">
          {/* Search wrapper with label */}
          <div className="workflows-page__search-wrapper">
            <span className="workflows-page__search-label">Buscar</span>
            <div className="workflows-page__search">
              <svg
                className="workflows-page__search-icon"
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar por nombre o descripción..."
                className="workflows-page__search-input"
              />
            </div>
          </div>
          {permissions.canCreate && (
            <button className="workflows-page__new-btn" onClick={handleNewWorkflow}>
              + Nuevo flujo de trabajo
            </button>
          )}
        </div>
      </div>

      {/* Workflow List - receives filtered workflows */}
      <WorkflowList
        workflows={visibleWorkflows}
        onDelete={permissions.canDelete ? handleDelete : undefined}
        onEdit={permissions.canEdit ? handleEdit : undefined}
      />

      {pendingDelete ? (
        <div
          className="workflows-page__modal-backdrop"
          onClick={() => setPendingDelete(null)}
        >
          <div
            className="workflows-page__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-workflow-title"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="workflows-page__modal-eyebrow">Zona peligrosa</p>
            <h2 id="delete-workflow-title">¿Eliminar flujo de trabajo?</h2>
            <p>
              Esto eliminará de forma permanente
              <strong>{pendingDelete.name}</strong> del espacio de trabajo.
            </p>
            <div className="workflows-page__modal-actions">
              <button
                type="button"
                className="workflows-page__modal-cancel"
                onClick={() => setPendingDelete(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="workflows-page__modal-confirm"
                onClick={confirmDelete}
              >
                Eliminar flujo de trabajo
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
