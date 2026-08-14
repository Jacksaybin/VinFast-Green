/**
 * LogoVGreen - Logo chính thức V-GREEN
 * Chữ V cách điệu kết hợp chiếc lá xanh (năng lượng tái tạo) và tia điện
 * Hỗ trợ 2 variant: full (logo + text) và mark (chỉ icon)
 */

import React from 'react';
import { cn } from '../../../lib/utils';

export interface LogoVGreenProps {
  className?: string;
  variant?: 'full' | 'mark';
  withText?: boolean;
  theme?: 'auto' | 'light' | 'dark';
}

const Mark: React.FC<{ className?: string; gradient?: boolean }> = ({
  className,
  gradient = true,
}) => (
  <svg
    viewBox="0 0 48 48"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {gradient && (
      <defs>
        <linearGradient id="vgreen-mark-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#16a34a" />
          <stop offset="50%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>
        <linearGradient id="vgreen-mark-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
    )}
    {/* Background rounded square */}
    <rect
      x="2"
      y="2"
      width="44"
      height="44"
      rx="12"
      fill={gradient ? 'url(#vgreen-mark-grad)' : 'currentColor'}
    />
    {/* Chữ V cách điệu - hai đường chéo tạo V */}
    <path
      d="M14 14 L24 34 L34 14"
      stroke="white"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Chiếc lá năng lượng (góc trên phải) */}
    <path
      d="M30 8 Q34 6 36 10 Q34 14 30 12 Q28 10 30 8 Z"
      fill={gradient ? 'url(#vgreen-mark-leaf)' : 'white'}
      opacity="0.9"
    />
    {/* Tia điện nhỏ */}
    <path
      d="M35 6 L37 9 L35 9 L37 12"
      stroke="#facc15"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export const LogoVGreen: React.FC<LogoVGreenProps> = ({
  className,
  variant = 'full',
  withText = true,
  theme = 'auto',
}) => {
  const textColorClass =
    theme === 'dark'
      ? 'text-white'
      : theme === 'light'
        ? 'text-brand-primary-700'
        : 'text-brand-primary-700 dark:text-brand-primary-300';

  if (variant === 'mark') {
    return <Mark className={cn('w-8 h-8', className)} />;
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Mark className="w-9 h-9 flex-shrink-0" />
      {withText && (
        <div className="flex flex-col leading-none">
          <span className={cn('text-lg font-extrabold tracking-tight', textColorClass)}>
            V-GREEN
          </span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-brand-accent-600 dark:text-brand-accent-400">
            VinFast Charging
          </span>
        </div>
      )}
    </div>
  );
};

export default LogoVGreen;