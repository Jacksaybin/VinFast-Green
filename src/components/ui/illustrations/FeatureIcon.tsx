/**
 * FeatureIcon - Bộ icon SVG tùy chỉnh cho V-GREEN
 * Bổ sung cho lucide-react với phong cách gradient, phù hợp theme xanh năng lượng
 */

import React from 'react';
import { cn } from '../../../lib/utils';

export type FeatureIconName =
  | 'wallet'
  | 'investment'
  | 'referral'
  | 'notification'
  | 'kyc'
  | 'audit'
  | 'package'
  | 'shield'
  | 'bolt'
  | 'leaf'
  | 'chart'
  | 'gift';

export interface FeatureIconProps {
  name: FeatureIconName;
  className?: string;
  size?: number;
  /** Dùng gradient (mặc định) hoặc đơn sắc */
  gradient?: boolean;
}

const ICONS: Record<FeatureIconName, JSX.Element> = {
  wallet: (
    <>
      <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2H5a2 2 0 0 0 0 4h14v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
      <circle cx="16" cy="11" r="1.2" fill="currentColor" />
    </>
  ),
  investment: (
    <>
      <path d="M3 17l5-5 4 4 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M14 9h5v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="5" cy="19" r="1" fill="currentColor" />
    </>
  ),
  referral: (
    <>
      <circle cx="7" cy="8" r="3" />
      <circle cx="17" cy="8" r="3" />
      <path d="M2 19c0-3 2.5-5 5-5s5 2 5 5" />
      <path d="M12 19c0-3 2.5-5 5-5s5 2 5 5" />
      <path d="M11 8h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  notification: (
    <>
      <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5L6 16z" />
      <path d="M10 21a2 2 0 0 0 4 0" />
      <circle cx="18" cy="6" r="2.5" fill="currentColor" opacity="0.4" />
    </>
  ),
  kyc: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <circle cx="10" cy="10" r="2.5" />
      <path d="M6 17c0-2 2-3.5 4-3.5s4 1.5 4 3.5" />
      <path d="M15 8l1.5 1.5L20 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  audit: (
    <>
      <path d="M9 3h6l4 4v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M9 13l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  package: (
    <>
      <path d="M12 3l8 4v10l-8 4-8-4V7l8-4z" />
      <path d="M4 7l8 4 8-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M12 11v10" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  bolt: (
    <>
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="currentColor" />
    </>
  ),
  leaf: (
    <>
      <path d="M4 20c0-8 6-14 16-16-2 10-8 16-16 16z" />
      <path d="M4 20c4-4 8-8 12-12" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </>
  ),
  chart: (
    <>
      <path d="M3 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 20h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="6" y="11" width="3" height="6" rx="1" fill="currentColor" opacity="0.5" />
      <rect x="11" y="7" width="3" height="10" rx="1" fill="currentColor" opacity="0.7" />
      <rect x="16" y="13" width="3" height="4" rx="1" fill="currentColor" opacity="0.9" />
    </>
  ),
  gift: (
    <>
      <rect x="3" y="8" width="18" height="4" />
      <path d="M5 12v9h14v-9" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M12 8v13" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 8c-2-3-5-3-5-1s3 1 5 1z" fill="currentColor" />
      <path d="M12 8c2-3 5-3 5-1s-3 1-5 1z" fill="currentColor" />
    </>
  ),
};

const FeatureIcon: React.FC<FeatureIconProps> = ({
  name,
  className,
  size = 24,
  gradient = true,
}) => {
  const gradId = `feat-grad-${name}`;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn('flex-shrink-0', className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {gradient && (
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      )}
      <g
        fill={gradient ? `url(#${gradId})` : 'currentColor'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {ICONS[name]}
      </g>
    </svg>
  );
};

export default FeatureIcon;