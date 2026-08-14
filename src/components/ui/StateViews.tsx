/**
 * Generic UI helpers - Loading, Empty, Error states
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loading: React.FC<{ text?: string; fullScreen?: boolean }> = ({ text = 'Đang tải...', fullScreen }) => {
  const content = (
    <div className="flex flex-col items-center justify-center py-10 text-gray-500">
      <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      <p className="mt-2 text-sm">{text}</p>
    </div>
  );

  if (fullScreen) {
    return <div className="min-h-[60vh] flex items-center justify-center">{content}</div>;
  }
  return content;
};

export const Empty: React.FC<{ title?: string; description?: string; icon?: React.ReactNode }> = ({
  title = 'Chưa có dữ liệu',
  description,
  icon,
}) => (
  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
    {icon || (
      <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )}
    <h4 className="font-semibold text-gray-700">{title}</h4>
    {description && <p className="mt-1 text-sm text-center max-w-sm">{description}</p>}
  </div>
);

export const ErrorBox: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
    <p className="text-sm font-medium">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="mt-2 text-sm underline">
        Thử lại
      </button>
    )}
  </div>
);
