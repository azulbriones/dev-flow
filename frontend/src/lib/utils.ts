/**
 * Shared utility functions for formatting and helpers
 * Centralized to avoid duplication across components
 */

import type { ExecutionStatus } from '../features/workflows/types';

/** Format number with suffix (k, M) - used in Dashboard, Workflows */
export function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

/** Format date relative to now - used in Dashboard, Executions */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'ahora mismo';
  if (diffMins < 60) return `hace ${diffMins} min`;
  if (diffHours < 24) return `hace ${diffHours} h`;
  return `hace ${diffDays} d`;
}

/** Get status display class for LED indicator */
export function getLedClass(status: ExecutionStatus): string {
  const map: Record<ExecutionStatus, string> = {
    completed: 'success',
    failed: 'error',
    running: 'running',
    pending: 'muted',
  };
  return map[status] || 'muted';
}

/** Get status display class for text */
export function getStatusClass(status: ExecutionStatus): string {
  const map: Record<ExecutionStatus, string> = {
    completed: 'text-success',
    failed: 'text-error',
    running: 'text-warning',
    pending: 'text-muted',
  };
  return map[status] || 'text-muted';
}
