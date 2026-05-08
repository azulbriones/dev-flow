import { Skeleton } from './Skeleton';

/**
 * DashboardSkeleton - Shows skeleton loaders matching Dashboard layout
 */
export const DashboardSkeleton = () => {
  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <Skeleton variant="rectangular" width={120} height={28} />
        <Skeleton
          variant="rectangular"
          width={200}
          height={16}
          className="skeleton--mt-2"
        />
      </div>

      <div className="dashboard__stats">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="dashboard__stat-card-skeleton">
            <Skeleton variant="rectangular" width={80} height={12} />
            <Skeleton variant="rectangular" width={60} height={28} />
          </div>
        ))}
      </div>

      <div className="dashboard__charts">
        <div className="dashboard__chart-skeleton">
          <Skeleton variant="rectangular" width={100} height={16} />
          <Skeleton variant="rectangular" width="100%" height={100} />
        </div>
        <div className="dashboard__chart-skeleton">
          <Skeleton variant="rectangular" width={140} height={16} />
          <div className="skeleton-stack skeleton-stack--spaced">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="rectangular" width="100%" height={24} />
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard__panel-skeleton">
        <div className="dashboard__tabs-skeleton">
          <Skeleton variant="rectangular" width={60} height={32} />
          <Skeleton variant="rectangular" width={80} height={32} />
        </div>
        <div className="dashboard__panel-body">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="dashboard__table-row-skeleton">
              <Skeleton variant="rectangular" width="50%" height={16} />
              <Skeleton variant="rectangular" width={80} height={20} />
              <Skeleton variant="rectangular" width={60} height={14} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
