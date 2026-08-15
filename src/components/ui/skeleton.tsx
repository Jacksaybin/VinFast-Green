/**
 * Skeleton — Loading placeholders dùng class .skeleton-shimmer đã có.
 */

import React from 'react';
import { cn } from '../../lib/utils';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn('skeleton-shimmer rounded-md bg-muted', className)}
    {...props}
  />
);

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({ lines = 1, className }) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={cn(
          'h-3',
          i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full',
        )}
      />
    ))}
  </div>
);

export const SkeletonRow: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'flex items-center gap-3 rounded-xl border border-border bg-card p-4',
      className,
    )}
  >
    <Skeleton className="h-10 w-10 flex-shrink-0 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-2.5 w-2/3" />
    </div>
    <Skeleton className="h-4 w-16" />
  </div>
);

interface SkeletonCardProps {
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className }) => (
  <div
    className={cn(
      'rounded-2xl border border-border bg-card p-5 shadow-card',
      className,
    )}
  >
    <div className="flex items-start gap-3">
      <Skeleton className="h-12 w-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-5 w-16 rounded-md" />
    </div>
    <div className="mt-4 space-y-2">
      <Skeleton className="h-2 w-full rounded-full" />
      <div className="flex justify-between">
        <Skeleton className="h-2.5 w-16" />
        <Skeleton className="h-2.5 w-20" />
      </div>
    </div>
  </div>
);

interface SkeletonListProps {
  count?: number;
  className?: string;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  count = 3,
  className,
}) => (
  <div className={cn('space-y-3', className)}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonRow key={i} />
    ))}
  </div>
);

interface SkeletonGridProps {
  count?: number;
  className?: string;
}

export const SkeletonGrid: React.FC<SkeletonGridProps> = ({
  count = 4,
  className,
}) => (
  <div
    className={cn(
      'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3',
      className,
    )}
  >
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);