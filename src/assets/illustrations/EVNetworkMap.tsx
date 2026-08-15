/**
 * EVNetworkMap - Bản đồ mạng lưới trạm sạc Việt Nam
 * Nền: ảnh trạm sạc thực tế
 * Foreground: pins trạm sạc trên overlay
 */

import React from 'react'
import { cn } from '../../lib/utils'
import vinfastStation from '../images/vinfast-station-wikimedia.jpg'

interface Props { className?: string }

export const EVNetworkMap: React.FC<Props> = ({ className }) => (
  <div className={cn('relative w-full overflow-hidden rounded-2xl', className)}>
    <img
      src={vinfastStation}
      alt="VinFast charging network"
      className="w-full h-auto object-cover"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-brand-accent-900/85 via-brand-accent-900/55 to-brand-accent-900/40" />

    <svg
      viewBox="0 0 400 320"
      fill="none"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="map-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0e7490" />
          <stop offset="100%" stopColor="#083344" />
        </linearGradient>
      </defs>

      {/* Title */}
      <text x="200" y="32" textAnchor="middle" fill="white" fontSize="15" fontWeight="bold">
        Mạng lưới 50+ trạm sạc toàn quốc
      </text>

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

      {/* Legend */}
      <g transform="translate(20, 295)">
        <circle cx="0" cy="0" r="5" fill="#22c55e" />
        <text x="10" y="4" fill="white" fontSize="10">Đang hoạt động</text>
        <circle cx="100" cy="0" r="5" fill="#facc15" />
        <text x="110" y="4" fill="white" fontSize="10">Sắp ra mắt</text>
      </g>
    </svg>
  </div>
)

export default EVNetworkMap