/**
 * AvatarInitials — Hiển thị avatar tròn với initials từ tên, gradient theo hash.
 * Dùng cho Header + MyAccount greeting.
 */

import React from 'react';
import { User } from 'lucide-react';
import { cn } from '../../lib/utils';

const GRADIENT_PALETTE = [
  'from-brand-primary-500 to-brand-accent-500',
  'from-brand-accent-500 to-info',
  'from-success to-brand-primary-500',
  'from-warning to-brand-energy-orange',
  'from-info to-brand-accent-500',
  'from-brand-primary-600 to-success',
];

function hashStringToIndex(input: string, mod: number): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % mod;
}

function extractInitials(name?: string | null): string {
  if (!name) return '';
  const cleaned = name.trim();
  if (!cleaned) return '';
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: 'h-7 w-7 text-2xs',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

interface AvatarInitialsProps {
  name?: string | null;
  size?: AvatarSize;
  className?: string;
  showRing?: boolean;
}

export const AvatarInitials: React.FC<AvatarInitialsProps> = ({
  name,
  size = 'md',
  className,
  showRing = false,
}) => {
  const initials = extractInitials(name);
  const gradientClass =
    GRADIENT_PALETTE[hashStringToIndex(name || 'default', GRADIENT_PALETTE.length)];

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white shadow-sm',
        gradientClass,
        SIZE_CLASSES[size],
        showRing && 'ring-2 ring-primary/30 ring-offset-2 ring-offset-background',
        className,
      )}
      aria-label={name ? `Avatar của ${name}` : 'Avatar'}
    >
      {initials ? (
        <span className="select-none tracking-tight">{initials}</span>
      ) : (
        <User className="h-1/2 w-1/2" aria-hidden />
      )}
    </div>
  );
};

export default AvatarInitials;
