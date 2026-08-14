/**
 * EmptyWallet - Ví trống cho trạng thái không có giao dịch
 */

import React from 'react'
import { cn } from '../../lib/utils'

interface Props { className?: string }

export const EmptyWallet: React.FC<Props> = ({ className }) => (
  <svg viewBox="0 0 240 200" fill="none" className={cn('w-full h-auto', className)}>
    <defs>
      <linearGradient id="ew-g1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22c55e" />
        <stop offset="100%" stopColor="#15803d" />
      </linearGradient>
      <linearGradient id="ew-g2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#cffafe" />
        <stop offset="100%" stopColor="#a5f3fc" />
      </linearGradient>
    </defs>
    {/* Background circle */}
    <circle cx="120" cy="100" r="90" fill="url(#ew-g2)" opacity="0.5" />
    <circle cx="120" cy="100" r="70" fill="url(#ew-g2)" opacity="0.4" />

    {/* Wallet body */}
    <rect x="60" y="70" width="120" height="80" rx="10" fill="url(#ew-g1)" />
    <path d="M60 90h120" stroke="white" strokeWidth="2" opacity="0.4" />
    {/* Wallet flap */}
    <path d="M60 70 L60 60 Q60 50, 70 50 L170 50 Q180 50, 180 60 L180 70 Z" fill="#15803d" />
    {/* Card slot empty */}
    <rect x="80" y="100" width="60" height="35" rx="5" fill="white" opacity="0.3" stroke="white" strokeWidth="2" strokeDasharray="3 3" />
    {/* Coin */}
    <circle cx="155" cy="125" r="14" fill="#facc15" />
    <text x="155" y="130" textAnchor="middle" fill="#166534" fontSize="14" fontWeight="bold">đ</text>
    {/* Floating sparkles */}
    <g fill="#22c55e" opacity="0.6">
      <circle cx="50" cy="50" r="2" />
      <circle cx="190" cy="60" r="3" />
      <circle cx="200" cy="130" r="2" />
    </g>
  </svg>
)

export default EmptyWallet