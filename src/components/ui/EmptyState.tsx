/**
 * EmptyState — Wrapper mỏng quanh Empty trong StateViews với slot illustration.
 */

import React from 'react';
import { Empty } from './StateViews';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  illustration?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  illustration,
  icon,
  action,
  className,
}) => (
  <Empty
    title={title}
    description={description}
    illustration={illustration}
    icon={icon}
    action={action}
    className={className}
  />
);

export default EmptyState;
