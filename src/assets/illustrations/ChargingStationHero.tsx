/**
 * ChargingStationHero - Hero illustration cho trang chủ V-GREEN
 *
 * Bao gồm:
 * - 2 trụ sạc DC
 * - Xe VF8 đang sạc
 * - Nền gradient xanh lá → cyan + bầu trời
 * - Mặt trời, đám mây, lá cây, tia năng lượng
 *
 * Animation nhẹ: pulse + float
 */

import React from 'react'
import { cn } from '../../lib/utils'

interface Props {
  className?: string
  showAnimations?: boolean
}

export const ChargingStationHero: React.FC<Props> = ({ className, showAnimations = true }) => {
  return (
    <svg
      viewBox="0 0 600 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-full h-auto', className)}
      aria-label="V-GREEN Charging Station"
    >
      <defs>
        <linearGradient id="csh-sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0e7490" />
          <stop offset="60%" stopColor="#0f766e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <linearGradient id="csh-ground" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#14532d" />
          <stop offset="100%" stopColor="#052e16" />
        </linearGradient>
        <linearGradient id="csh-station" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <linearGradient id="csh-station2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>
        <linearGradient id="csh-car" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#d4d4d4" />
        </linearGradient>
        <radialGradient id="csh-sun" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="60%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#fb923c" stopOpacity="0.8" />
        </radialGradient>
        <radialGradient id="csh-light" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#facc15" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
        </radialGradient>
        <filter id="csh-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Sky background */}
      <rect x="0" y="0" width="600" height="500" rx="20" fill="url(#csh-sky)" />

      {/* Decorative stars/sparkles */}
      <g opacity="0.5" fill="white">
        <circle cx="60" cy="60" r="1.5" />
        <circle cx="120" cy="40" r="1" />
        <circle cx="500" cy="80" r="1.5" />
        <circle cx="550" cy="50" r="1" />
        <circle cx="80" cy="140" r="1" />
      </g>

      {/* Sun */}
      <g className={showAnimations ? 'animate-pulse-slow' : ''}>
        <circle cx="460" cy="120" r="60" fill="url(#csh-sun)" />
        <circle cx="460" cy="120" r="40" fill="#fff" opacity="0.3" />
        {/* Sun rays */}
        <g stroke="#fde047" strokeWidth="3" strokeLinecap="round" opacity="0.7">
          <path d="M460 30v18" />
          <path d="M460 192v18" />
          <path d="M370 120h18" />
          <path d="M532 120h18" />
          <path d="M400 60 l12 12" />
          <path d="M508 168 l12 12" />
          <path d="M508 72 l-12 12" />
          <path d="M400 180 l12 -12" />
        </g>
      </g>

      {/* Clouds */}
      <g opacity="0.6" fill="white">
        <ellipse cx="120" cy="100" rx="35" ry="12" />
        <ellipse cx="160" cy="95" rx="25" ry="10" />
        <ellipse cx="320" cy="60" rx="30" ry="10" />
        <ellipse cx="350" cy="65" rx="20" ry="8" />
      </g>

      {/* Distant mountains */}
      <path d="M0 320 L80 250 L150 290 L230 230 L320 280 L400 240 L480 285 L560 245 L600 270 L600 360 L0 360 Z" fill="#052e16" opacity="0.5" />

      {/* Trees in background */}
      <g opacity="0.7">
        <circle cx="80" cy="300" r="22" fill="#15803d" />
        <rect x="76" y="300" width="8" height="20" fill="#166534" />
        <circle cx="520" cy="305" r="20" fill="#15803d" />
        <rect x="516" y="305" width="8" height="18" fill="#166534" />
      </g>

      {/* Ground */}
      <rect x="0" y="360" width="600" height="140" rx="0" fill="url(#csh-ground)" />

      {/* Ground decoration lines */}
      <g stroke="#22c55e" strokeWidth="1" opacity="0.3">
        <path d="M0 400h600" />
        <path d="M0 430h600" />
        <path d="M0 460h600" />
      </g>

      {/* Trụ sạc 1 (trái) */}
      <g className={showAnimations ? 'animate-float' : ''}>
        {/* Pillars */}
        <rect x="180" y="200" width="60" height="160" rx="8" fill="url(#csh-station)" />
        <rect x="180" y="200" width="60" height="20" rx="4" fill="#166534" />
        {/* Screen */}
        <rect x="190" y="230" width="40" height="22" rx="3" fill="#0f172a" />
        <rect x="194" y="234" width="32" height="14" rx="1" fill="#22d3ee" />
        <text x="210" y="245" textAnchor="middle" fill="#0f172a" fontSize="10" fontFamily="monospace" fontWeight="bold">98%</text>
        {/* Indicator */}
        <circle cx="210" cy="275" r="4" fill="#22c55e" filter="url(#csh-glow)" />
        <circle cx="210" cy="275" r="4" fill="#4ade80" className={showAnimations ? 'animate-pulse' : ''} />
        {/* Lightning symbol */}
        <path d="M210 290 L205 305 H211 L208 320 L218 300 H211 Z" fill="#facc15" />
        {/* Cable */}
        <path d="M240 280 Q280 290, 310 310" stroke="#166534" strokeWidth="6" fill="none" strokeLinecap="round" />
        <circle cx="310" cy="310" r="6" fill="#15803d" />
        {/* Glow under station */}
        <ellipse cx="210" cy="365" rx="40" ry="6" fill="#22c55e" opacity="0.4" filter="url(#csh-glow)" />
      </g>

      {/* Trụ sạc 2 (phải) */}
      <g className={showAnimations ? 'animate-float' : ''} style={{ animationDelay: '1s' }}>
        <rect x="360" y="220" width="60" height="140" rx="8" fill="url(#csh-station2)" />
        <rect x="360" y="220" width="60" height="20" rx="4" fill="#155e75" />
        <rect x="370" y="248" width="40" height="22" rx="3" fill="#0f172a" />
        <rect x="374" y="252" width="32" height="14" rx="1" fill="#22d3ee" />
        <text x="390" y="263" textAnchor="middle" fill="#0f172a" fontSize="10" fontFamily="monospace" fontWeight="bold">75%</text>
        <circle cx="390" cy="285" r="4" fill="#06b6d4" filter="url(#csh-glow)" />
        <circle cx="390" cy="285" r="4" fill="#67e8f9" className={showAnimations ? 'animate-pulse' : ''} />
        <path d="M390 300 L385 315 H391 L388 330 L398 310 H391 Z" fill="#facc15" />
        <path d="M360 305 Q330 315, 305 330" stroke="#155e75" strokeWidth="6" fill="none" strokeLinecap="round" />
        <circle cx="305" cy="330" r="6" fill="#0e7490" />
        <ellipse cx="390" cy="365" rx="40" ry="6" fill="#06b6d4" opacity="0.4" filter="url(#csh-glow)" />
      </g>

      {/* Car (VF8 style) */}
      <g transform="translate(230, 290)">
        {/* Car body */}
        <path
          d="M30 40 L40 20 Q60 10, 90 10 L130 10 Q155 12, 165 25 L175 40 L175 65 Q175 70, 170 70 L160 70 Q155 80, 145 80 Q135 80, 130 70 L70 70 Q65 80, 55 80 Q45 80, 40 70 L30 70 Q25 70, 25 65 Z"
          fill="url(#csh-car)"
          stroke="#a3a3a3"
          strokeWidth="1.5"
        />
        {/* Roof */}
        <path
          d="M55 25 Q70 14, 100 12 L125 12 Q140 14, 150 25 L55 25 Z"
          fill="#e5e5e5"
          stroke="#a3a3a3"
          strokeWidth="1.5"
        />
        {/* Windows */}
        <path
          d="M62 24 Q75 17, 95 16 L120 16 Q135 17, 145 24 L62 24 Z"
          fill="#22d3ee"
          opacity="0.7"
        />
        <line x1="100" y1="16" x2="100" y2="24" stroke="#a3a3a3" strokeWidth="1" />
        {/* Headlights */}
        <ellipse cx="170" cy="42" rx="6" ry="4" fill="#facc15" filter="url(#csh-glow)" />
        <ellipse cx="30" cy="42" rx="5" ry="3" fill="#f87171" />
        {/* V-GREEN logo on side */}
        <rect x="90" y="35" width="40" height="18" rx="3" fill="#15803d" />
        <text x="110" y="48" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">V-GREEN</text>
        {/* Wheels */}
        <circle cx="55" cy="73" r="12" fill="#262626" />
        <circle cx="55" cy="73" r="6" fill="#525252" />
        <circle cx="145" cy="73" r="12" fill="#262626" />
        <circle cx="145" cy="73" r="6" fill="#525252" />
        {/* Shadow */}
        <ellipse cx="100" cy="85" rx="80" ry="4" fill="black" opacity="0.3" />
      </g>

      {/* Floating energy particles */}
      <g className={showAnimations ? 'animate-pulse-slow' : ''} fill="#facc15">
        <circle cx="280" cy="180" r="2" opacity="0.9" />
        <circle cx="320" cy="200" r="3" opacity="0.8" />
        <circle cx="350" cy="160" r="2" opacity="0.85" />
        <circle cx="300" cy="240" r="2" opacity="0.7" />
        <circle cx="270" cy="140" r="1.5" opacity="0.7" />
      </g>

      {/* Decorative leaf in corner */}
      <g transform="translate(20, 380)" opacity="0.5">
        <path d="M0 30 C0 0, 30 0, 30 30 C20 35, 5 35, 0 30 Z" fill="#22c55e" />
        <path d="M5 28 L25 10" stroke="#15803d" strokeWidth="1.5" fill="none" />
      </g>

      {/* Lightning bolts floating */}
      <g opacity="0.85" fill="#facc15">
        <path d="M50 200 L45 215 H52 L48 230 L58 210 H51 Z" />
        <path d="M530 350 L525 363 H532 L528 376 L538 358 H531 Z" />
      </g>

      {/* Floating shine */}
      <g className={showAnimations ? 'animate-pulse-slow' : ''}>
        <circle cx="100" cy="250" r="40" fill="url(#csh-light)" />
        <circle cx="500" cy="280" r="30" fill="url(#csh-light)" />
      </g>

      {/* Foreground plant decoration */}
      <g transform="translate(0, 380)">
        <path d="M0 60 L0 100 L60 100 L60 80 Q40 80, 30 60 Z" fill="#166534" />
        <circle cx="40" cy="65" r="15" fill="#22c55e" opacity="0.6" />
      </g>
    </svg>
  )
}

export default ChargingStationHero