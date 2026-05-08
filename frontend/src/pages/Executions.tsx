import { useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { ErrorMessage } from '../components/ErrorMessage';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { getExecutions } from '../features/workflows/api/client';
import { useWorkflows } from '../features/workflows/hooks/useWorkflows';
import type { ExecutionStatus } from '../features/workflows/types';
import { ExecutionsView } from './executions/ExecutionsView';
import './Executions.scss';

type StatusFilter = 'all' | 'pending' | 'running' | 'completed' | 'failed';
type SortBy = 'date' | 'workflow' | 'status';

export const Executions = () => {
  const {
    data: executions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['executions'],
    queryFn: getExecutions,
    staleTime: 1000 * 60 * 5,
  });
  const { data: workflows } = useWorkflows();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');

  const stats = useMemo(() => {
    const total = executions?.length || 0;
    const completed = executions?.filter((e) => e.status === 'completed').length || 0;
    const failed = executions?.filter((e) => e.status === 'failed').length || 0;
    const running = executions?.filter((e) => e.status === 'running').length || 0;
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, failed, running, successRate };
  }, [executions]);

  const trend = useMemo(() => {
    if (stats.total < 2) return null;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oldExec = executions?.filter((e) => new Date(e.started_at) < weekAgo) || [];
    const recentExec =
      executions?.filter((e) => new Date(e.started_at) >= weekAgo) || [];

    if (oldExec.length < 1 || recentExec.length < 1) return null;

    const oldRate = Math.round(
      (oldExec.filter((e) => e.status === 'completed').length / oldExec.length) * 100
    );
    const recentRate = Math.round(
      (recentExec.filter((e) => e.status === 'completed').length / recentExec.length) *
        100
    );

    const diff = recentRate - oldRate;
    return {
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral',
      value: Math.abs(diff),
    };
  }, [executions, stats.total]);

  const workflowMap = useMemo(
    () =>
      workflows?.reduce<Record<number, string>>((acc, wf) => {
        acc[wf.id] = wf.name;
        return acc;
      }, {}) || {},
    [workflows]
  );

  const filteredExecutions = useMemo(() => {
    if (!executions || !workflows) return [];

    const query = searchQuery.trim().toLowerCase();
    const filtered = executions.filter((execution) => {
      const workflowName = execution.workflow_id
        ? workflowMap[execution.workflow_id]?.toLowerCase() || ''
        : 'adhoc';
      const matchesSearch = query
        ? workflowName.includes(query) || execution.id.toString().includes(query)
        : true;
      const matchesStatus =
        statusFilter !== 'all' ? execution.status === statusFilter : true;

      return matchesSearch && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.started_at).getTime() - new Date(a.started_at).getTime();
        case 'workflow':
          return (
            a.workflow_id ? workflowMap[a.workflow_id] || '' : 'Ad hoc'
          ).localeCompare(b.workflow_id ? workflowMap[b.workflow_id] || '' : 'Ad hoc');
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
  }, [executions, workflows, workflowMap, searchQuery, statusFilter, sortBy]);

  const viewRows = filteredExecutions.map((execution) => ({
    id: execution.id,
    workflow_id: execution.workflow_id,
    status: execution.status as ExecutionStatus,
    started_at: execution.started_at,
    finished_at: execution.finished_at,
    workflowName: execution.workflow_id
      ? workflowMap[execution.workflow_id] || 'Desconocido'
      : 'Ad hoc',
  }));

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorMessage message="Error al cargar ejecuciones" />;

  return (
    <ExecutionsView
      stats={stats}
      trend={trend}
      filteredExecutions={viewRows}
      workflowMap={workflowMap}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      sortBy={sortBy}
      onSortChange={setSortBy}
    />
  );
};
