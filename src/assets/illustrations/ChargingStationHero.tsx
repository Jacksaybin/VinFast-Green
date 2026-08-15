/**
 * ChargingStationHero - Hero illustration cho trang chủ V-GREEN
 *
 * Hiển thị ảnh thực tế trạm sạc VinFast / EV với khung trang trí gradient,
 * logo overlay và animation nhẹ (pulse / float).
 */

import React from 'react'
import { cn } from '../../lib/utils'

// Ảnh trạm sạc thực tế được bundle trong dự án (esbuild loader .jpg).
// Nguồn: Unsplash - free for commercial use (Unsplash License).
import stationImage from '../images/charging-station-hero.jpg'

interface Props {
  className?: string
  showAnimations?: boolean
}

export const ChargingStationHero: React.FC<Props> = ({ className, showAnimations = true }) => {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-3xl shadow-elevated ring-1 ring-white/20',
        'bg-gradient-hero',
        className
      )}
      aria-label="V-GREEN Charging Station"
      role="img"
    >
      {/* Ảnh trạm sạc thực tế */}
      <img
        src={stationImage}
        alt="Trạm sạc xe điện V-GREEN / VinFast ngoài trời"
        loading="eager"
        decoding="async"
        className={cn(
          'block w-full h-auto aspect-[4/3] md:aspect-[3/2] object-cover',
          'transition-transform duration-700 ease-out',
          showAnimations && 'hover:scale-[1.02]'
        )}
      />

      {/* Lớp phủ gradient để hài hoà với hero section phía sau */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-brand-primary-900/55 via-transparent to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"
      />

      {/* Logo V-GREEN + badge nổi */}
      <div
        className={cn(
          'absolute top-3 left-3 md:top-4 md:left-4',
          'inline-flex items-center gap-1.5 md:gap-2 rounded-full',
          'bg-black/35 backdrop-blur-md px-2.5 py-1 md:px-3 md:py-1.5',
          'text-[10px] md:text-xs font-semibold text-white border border-white/20',
          'max-w-[calc(100%-1.5rem)] truncate',
          showAnimations && 'animate-fade-in'
        )}
      >
        <span className="inline-block w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-brand-primary-400 shadow-[0_0_10px_rgba(74,222,128,0.9)] flex-shrink-0" />
        <span className="truncate">V-GREEN · Live</span>
      </div>

      {/* Thẻ thông số kỹ thuật overlay */}
      <div
        className={cn(
          'absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-auto',
          'flex items-center gap-2 md:gap-3 rounded-2xl',
          'bg-white/10 backdrop-blur-xl border border-white/20',
          'px-3 py-2 md:px-4 md:py-3 text-white',
          showAnimations && 'animate-fade-in'
        )}
        style={showAnimations ? { animationDelay: '0.2s' } : undefined}
      >
        <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-brand-primary-400 to-brand-primary-500 flex items-center justify-center shadow-glow">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-4 h-4 md:w-5 md:h-5"
            aria-hidden="true"
          >
            <path
              d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"
              fill="currentColor"
              className="text-white"
            />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] md:text-xs text-white/80 leading-tight">Công suất tối đa</div>
          <div className="text-sm md:text-base font-bold leading-tight whitespace-nowrap">150 kW · DC Fast</div>
        </div>
      </div>

      {/* Hiệu ứng pulse nhẹ ở góc */}
      {showAnimations && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-6 -right-6 w-24 h-24 md:w-32 md:h-32 rounded-full bg-brand-primary-400/20 blur-2xl animate-pulse-slow"
        />
      )}
    </div>
  )
}

export default ChargingStationHero