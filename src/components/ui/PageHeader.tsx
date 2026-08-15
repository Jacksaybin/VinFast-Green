/**
 * PageHeader — Chuẩn hóa pattern "Back button + Title + Action" lặp ở nhiều trang.
 */

import React from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string | -1;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
  sticky?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  backTo,
  onBack,
  rightAction,
  className,
  sticky = false,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (backTo === -1 || backTo === undefined) {
      navigate(-1);
    } else {
      navigate(backTo as string);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 px-4 py-3',
        sticky && 'sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur-md',
        !sticky && 'border-b border-border bg-card',
        className,
      )}
    >
      <button
        type="button"
        onClick={handleBack}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Quay lại"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1 text-center">
        <h1 className="truncate text-base font-semibold text-foreground md:text-lg">
          {title}
        </h1>
        {subtitle && (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center">
        {rightAction}
      </div>
    </div>
  );
};

export default PageHeader;
