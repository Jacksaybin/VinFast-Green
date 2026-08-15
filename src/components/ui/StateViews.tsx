/**
 * Generic UI helpers - Loading, Empty, Error states
 * Đã tinh chỉnh: dùng design token, hỗ trợ illustration prop, error box chuẩn semantic.
 */

import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  text = 'Đang tải...',
  fullScreen,
  className,
}) => {
  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-10 text-muted-foreground',
        className,
      )}
    >
      <div className="relative mb-3">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-md" aria-hidden />
        <Loader2 className="relative h-8 w-8 animate-spin text-primary" />
      </div>
      <p className="text-sm font-medium">{text}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-background">
        {content}
      </div>
    );
  }
  return content;
};

interface EmptyProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  illustration?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const Empty: React.FC<EmptyProps> = ({
  title = 'Chưa có dữ liệu',
  description,
  icon,
  illustration,
  action,
  className,
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center px-4 py-12 text-center text-muted-foreground',
      className,
    )}
  >
    {illustration ? (
      <div className="mb-4">{illustration}</div>
    ) : icon ? (
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted text-muted-foreground/70">
        {icon}
      </div>
    ) : (
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted text-muted-foreground/60">
        <svg
          className="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
    )}
    <h4 className="font-semibold text-foreground">{title}</h4>
    {description && (
      <p className="mt-1 max-w-sm text-sm leading-relaxed">{description}</p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

interface ErrorBoxProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorBox: React.FC<ErrorBoxProps> = ({
  message,
  onRetry,
  className,
}) => (
  <div
    className={cn(
      'flex items-start gap-3 rounded-xl border border-danger/20 bg-danger-subtle p-4 text-danger-strong shadow-sm',
      className,
    )}
    role="alert"
  >
    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
    <div className="flex-1">
      <p className="text-sm font-medium leading-relaxed">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 text-sm font-medium text-danger-strong underline-offset-2 hover:underline"
        >
          Thử lại
        </button>
      )}
    </div>
  </div>
);
