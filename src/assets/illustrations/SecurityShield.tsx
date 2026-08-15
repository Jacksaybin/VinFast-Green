/**
 * SecurityShield - Hero illustration cho trang Login / ForgotPassword
 *
 * Hiển thị ảnh thực tế 3D render về digital shield & lock với lớp overlay
 * gradient + các badge bảo mật (SSL / 2FA / GDPR) để khớp với hero section.
 */

import React from 'react';
import securityImage from '../images/security-shield.jpg';

interface Props {
  className?: string;
  size?: number;
}

const SecurityShield: React.FC<Props> = ({ className, size }) => (
  <div
    className={
      'relative inline-block align-middle rounded-2xl overflow-hidden shadow-elevated ' +
      (className ?? '')
    }
    role="img"
    aria-label="Bảo mật an toàn — Mã hóa end-to-end, khiên bảo vệ dữ liệu"
  >
    {typeof size === 'number' ? (
      <img
        src={securityImage}
        alt=""
        width={size}
        height={Math.round(size * 0.5625)}
        loading="lazy"
        decoding="async"
        className="block w-auto h-auto object-cover aspect-[16/9]"
        draggable={false}
      />
    ) : (
      <img
        src={securityImage}
        alt=""
        loading="lazy"
        decoding="async"
        className="block w-full h-auto object-cover aspect-[16/9]"
        draggable={false}
      />
    )}

    {/* Lớp phủ gradient để hài hoà với hero gradient-hero */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-brand-primary-900/65 via-brand-primary-700/15 to-transparent"
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
    />

    {/* Badge bảo mật nổi */}
    <div
      aria-hidden="true"
      className="absolute top-2 left-2 md:top-3 md:left-3 inline-flex items-center gap-1.5 rounded-full bg-black/35 backdrop-blur-md px-2.5 py-1 text-[10px] md:text-xs font-semibold text-white border border-white/20"
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-primary-400 shadow-[0_0_10px_rgba(74,222,128,0.9)] animate-pulse" />
      <span>End-to-End Encrypted</span>
    </div>

    <div
      aria-hidden="true"
      className="absolute bottom-2 left-2 right-2 md:bottom-3 md:left-3 md:right-3 flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 px-3 py-2 text-white"
    >
      <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-brand-primary-400 to-brand-accent-500 flex items-center justify-center shadow-glow">
        <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true">
          <path
            d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z"
            fill="currentColor"
            className="text-white"
          />
          <path d="M9 12l2 2 4-4" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="min-w-0 leading-tight">
        <div className="text-[11px] md:text-xs font-bold">Bảo mật 100%</div>
        <div className="text-[10px] md:text-[11px] text-white/80">Mã hóa · JWT · Audit log</div>
      </div>
    </div>
  </div>
);

export default SecurityShield;
export { SecurityShield };