/**
 * EVNetworkMap - Bản đồ mạng lưới trạm sạc Việt Nam (stylized)
 */

import React from 'react'
import { cn } from '../../lib/utils'

interface Props { className?: string }

export const EVNetworkMap: React.FC<Props> = ({ className }) => (
  <svg viewBox="0 0 400 320" fill="none" className={cn('w-full h-auto', className)}>
    <defs>
      <linearGradient id="map-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0e7490" />
        <stop offset="100%" stopColor="#083344" />
      </linearGradient>
    </defs>

    {/* Background */}
    <rect x="0" y="0" width="400" height="320" rx="16" fill="url(#map-bg)" />

    {/* Stylized Vietnam shape */}
    <path
      d="M150 60 L180 50 L210 70 L220 100 L235 130 L240 160 L230 180 L220 210 L210 230 L195 260 L185 270 L175 250 L165 220 L155 190 L145 160 L135 130 L130 100 L140 80 Z"
      fill="#dcfce7"
      opacity="0.85"
      stroke="#22c55e"
      strokeWidth="1.5"
    />

    {/* Charging station pins */}
    <g>
      {/* Hà Nội */}
      <g transform="translate(165, 95)">
        <circle cx="0" cy="0" r="10" fill="#22c55e" />
        <circle cx="0" cy="0" r="5" fill="white" />
        <text x="14" y="4" fill="white" fontSize="10" fontWeight="bold">Hà Nội</text>
      </g>
      {/* Hải Phòng */}
      <g transform="translate(195, 105)">
        <circle cx="0" cy="0" r="7" fill="#22c55e" />
        <circle cx="0" cy="0" r="3" fill="white" />
      </g>
      {/* Đà Nẵng */}
      <g transform="translate(210, 175)">
        <circle cx="0" cy="0" r="9" fill="#facc15" />
        <circle cx="0" cy="0" r="4" fill="white" />
        <text x="14" y="4" fill="white" fontSize="10" fontWeight="bold">Đà Nẵng</text>
      </g>
      {/* Nha Trang */}
      <g transform="translate(205, 215)">
        <circle cx="0" cy="0" r="7" fill="#22c55e" />
        <circle cx="0" cy="0" r="3" fill="white" />
      </g>
      {/* HCM */}
      <g transform="translate(180, 260)">
        <circle cx="0" cy="0" r="11" fill="#22c55e" />
        <circle cx="0" cy="0" r="5" fill="white" />
        <text x="-30" y="4" fill="white" fontSize="10" fontWeight="bold">TP.HCM</text>
      </g>
    </g>

    {/* Title */}
    <text x="200" y="30" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
      Mạng lưới 50+ trạm sạc toàn quốc
    </text>

    {/* Legend */}
    <g transform="translate(20, 285)">
      <circle cx="0" cy="0" r="5" fill="#22c55e" />
      <text x="10" y="4" fill="white" fontSize="10">Đang hoạt động</text>
      <circle cx="100" cy="0" r="5" fill="#facc15" />
      <text x="110" y="4" fill="white" fontSize="10">Sắp ra mắt</text>
    </g>
  </svg>
)

export default EVNetworkMap