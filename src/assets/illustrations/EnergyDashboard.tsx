/**
 * EnergyDashboard - Dashboard tóm tắt lợi nhuận
 */

import React from 'react'
import { cn } from '../../lib/utils'

interface Props { className?: string }

export const EnergyDashboard: React.FC<Props> = ({ className }) => (
  <svg viewBox="0 0 400 280" fill="none" className={cn('w-full h-auto', className)}>
    <defs>
      <linearGradient id="ed-g1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22c55e" />
        <stop offset="100%" stopColor="#0e7490" />
      </linearGradient>
      <linearGradient id="ed-area" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
      </linearGradient>
    </defs>

    {/* Card background */}
    <rect x="20" y="30" width="360" height="220" rx="12" fill="#ffffff" opacity="0.95" />
    <rect x="20" y="30" width="360" height="40" rx="12" fill="url(#ed-g1)" />
    <text x="40" y="55" fill="white" fontSize="14" fontWeight="bold">Dashboard lợi nhuận</text>

    {/* KPI cards row */}
    <g transform="translate(40, 85)">
      <rect x="0" y="0" width="100" height="50" rx="6" fill="#dcfce7" />
      <text x="10" y="18" fill="#166534" fontSize="10">Doanh thu</text>
      <text x="10" y="38" fill="#15803d" fontSize="16" fontWeight="bold">128.5M</text>

      <rect x="115" y="0" width="100" height="50" rx="6" fill="#cffafe" />
      <text x="125" y="18" fill="#155e75" fontSize="10">Lợi nhuận</text>
      <text x="125" y="38" fill="#0e7490" fontSize="16" fontWeight="bold">+18.2%</text>

      <rect x="230" y="0" width="100" height="50" rx="6" fill="#fef3c7" />
      <text x="240" y="18" fill="#92400e" fontSize="10">Cổ tức</text>
      <text x="240" y="38" fill="#b45309" fontSize="16" fontWeight="bold">2.4M/tháng</text>
    </g>

    {/* Chart area */}
    <g transform="translate(40, 150)">
      {/* Grid lines */}
      <line x1="0" y1="0" x2="320" y2="0" stroke="#e5e5e5" strokeDasharray="3 3" />
      <line x1="0" y1="30" x2="320" y2="30" stroke="#e5e5e5" strokeDasharray="3 3" />
      <line x1="0" y1="60" x2="320" y2="60" stroke="#e5e5e5" strokeDasharray="3 3" />
      <line x1="0" y1="90" x2="320" y2="90" stroke="#e5e5e5" strokeDasharray="3 3" />

      {/* Area fill */}
      <path
        d="M0 80 L40 70 L80 75 L120 50 L160 45 L200 30 L240 25 L280 15 L320 5 L320 90 L0 90 Z"
        fill="url(#ed-area)"
      />
      {/* Line */}
      <path
        d="M0 80 L40 70 L80 75 L120 50 L160 45 L200 30 L240 25 L280 15 L320 5"
        stroke="url(#ed-g1)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Dots */}
      <g fill="#22c55e">
        <circle cx="0" cy="80" r="3" />
        <circle cx="40" cy="70" r="3" />
        <circle cx="80" cy="75" r="3" />
        <circle cx="120" cy="50" r="3" />
        <circle cx="160" cy="45" r="3" />
        <circle cx="200" cy="30" r="3" />
        <circle cx="240" cy="25" r="3" />
        <circle cx="280" cy="15" r="3" />
        <circle cx="320" cy="5" r="4" fill="#facc15" stroke="#22c55e" strokeWidth="2" />
      </g>
    </g>
  </svg>
)

export default EnergyDashboard