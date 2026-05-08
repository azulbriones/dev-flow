import { useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { getExecutions } from '../features/workflows/api/client';
import { useWorkflows } from '../features/workflows/hooks/useWorkflows';
import { ErrorMessage } from '../components/ErrorMessage';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import type { ExecutionStatus } from '../features/workflows/types';
import { DashboardView } from './dashboard/DashboardView';
import './Dashboard.scss';

export const Dashboard = () => {
  const {
    data: executions,
    isLoading: loadingExecutions,
    error: errorExecutions,
  } = useQuery({
    queryKey: ['executions'],
    queryFn: getExecutions,
    staleTime: 1000 * 60 * 2,
  });
  const {
    data: workflows,
    isLoading: loadingWorkflows,
    error: errorWorkflows,
  } = useWorkflows();
  const [activeTab, setActiveTab] = useState<'recent' | 'failed'>('recent');

  const isLoading = loadingExecutions || loadingWorkflows;
  const hasError = errorExecutions || errorWorkflows;

  const workflowMap = useMemo(
    () =>
      workflows?.reduce<Record<number, string>>((acc, wf) => {
        acc[wf.id] = wf.name;
        return acc;
      }, {}) || {},
    [workflows]
  );

  const stats = useMemo(() => {
    const items = executions || [];
    const totalExecutions = items.length;
    const completed = items.filter((e) => e.status === 'completed').length;
    const successRate =
      totalExecutions > 0 ? Math.round((completed / totalExecutions) * 100) : 0;

    const finished = items.filter((e) => e.status === 'completed' && e.finished_at);
    const avgDuration =
      finished.length > 0
        ? Math.round(
            finished.reduce((acc, e) => {
              const start = new Date(e.started_at).getTime();
              const end = new Date(e.finished_at!).getTime();
              return acc + (end - start);
            }, 0) /
              finished.length /
              1000
          )
        : 0;

    return {
      totalWorkflows: workflows?.length || 0,
      totalExecutions,
      successRate,
      avgDuration,
    };
  }, [workflows, executions]);

  const statusBreakdownData = useMemo(() => {
    if (!executions) return [];

    const counts = { pending: 0, running: 0, completed: 0, failed: 0 };
    executions.forEach((execution) => {
      counts[execution.status]++;
    });

    return [
      { name: 'Completadas', value: counts.completed },
      { name: 'En ejecución', value: counts.running },
      { name: 'Fallidas', value: counts.failed },
      { name: 'Pendientes', value: counts.pending },
    ].filter((item) => item.value > 0);
  }, [executions]);

  const topWorkflowsData = useMemo(() => {
    if (!executions) return [];

    const counts: Record<number, number> = {};
    executions.forEach((execution) => {
      if (execution.workflow_id === null) return;
      counts[execution.workflow_id] = (counts[execution.workflow_id] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({
        name: workflowMap[Number(id)] || 'Unknown',
        count,
      }));
  }, [executions, workflowMap]);

  const recentActivity = useMemo(() => {
    if (!executions) return [];

    return [...executions]
      .sort(
        (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
      )
      .slice(0, 15)
      .map((execution) => ({
        id: execution.id,
        workflow_id: execution.workflow_id,
        status: execution.status as ExecutionStatus,
        error_message: execution.error_message,
        workflowName: execution.workflow_id
          ? workflowMap[execution.workflow_id] || 'Unknown'
          : 'Ad hoc',
        started_at: execution.started_at,
      }));
  }, [executions, workflowMap]);

  const failedActivity = useMemo(() => {
    return recentActivity.filter((item) => item.status === 'failed');
  }, [recentActivity]);

  const activity = activeTab === 'failed' ? failedActivity : recentActivity;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (hasError) {
    return <ErrorMessage message="Error al cargar datos del tablero" />;
  }

  return (
    <DashboardView
      stats={stats}
      statusBreakdownData={statusBreakdownData}
      topWorkflowsData={topWorkflowsData}
      activity={activity}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onWorkflowClick={(workflowId) => `/workflows/${workflowId}`}
    />
  );
};
