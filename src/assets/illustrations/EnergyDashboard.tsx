/**
 * EnergyDashboard - Dashboard tóm tắt lợi nhuận
 * Nền: ảnh trạm sạc VinFast thực tế
 * Foreground: Card dữ liệu (giữ SVG cho data viz)
 */

import React from 'react'
import { cn } from '../../lib/utils'
import realWelcomeVinfast from '../images/real-welcome-vinfast.jpg'

interface Props { className?: string }

export const EnergyDashboard: React.FC<Props> = ({ className }) => (
  <div className={cn('relative w-full overflow-hidden rounded-2xl', className)}>
    <img
      src={realWelcomeVinfast}
      alt="VinFast energy dashboard"
      className="w-full h-auto object-cover"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent" />
    <svg
      viewBox="0 0 400 280"
      fill="none"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Card background */}
      <rect x="20" y="150" width="360" height="120" rx="12" fill="#ffffff" opacity="0.97" />
      <rect x="20" y="150" width="360" height="36" rx="12" fill="url(#ed-g1)" />

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

      <text x="40" y="173" fill="white" fontSize="13" fontWeight="bold">Dashboard lợi nhuận</text>

      {/* KPI cards row */}
      <g transform="translate(40, 195)">
        <rect x="0" y="0" width="100" height="46" rx="6" fill="#dcfce7" />
        <text x="10" y="16" fill="#166534" fontSize="10">Doanh thu</text>
        <text x="10" y="36" fill="#15803d" fontSize="15" fontWeight="bold">128.5M</text>

        <rect x="115" y="0" width="100" height="46" rx="6" fill="#cffafe" />
        <text x="125" y="16" fill="#155e75" fontSize="10">Lợi nhuận</text>
        <text x="125" y="36" fill="#0e7490" fontSize="15" fontWeight="bold">+18.2%</text>

        <rect x="230" y="0" width="100" height="46" rx="6" fill="#fef3c7" />
        <text x="240" y="16" fill="#92400e" fontSize="10">Cổ tức</text>
        <text x="240" y="36" fill="#b45309" fontSize="14" fontWeight="bold">2.4M/th</text>
      </g>
    </svg>
  </div>
)

export default EnergyDashboard