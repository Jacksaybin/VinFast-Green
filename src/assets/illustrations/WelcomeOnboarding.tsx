import React from 'react';

interface Props {
  className?: string;
}

const WelcomeOnboarding: React.FC<Props> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480" className={className} role="img" aria-label="Chào mừng bạn đến với V-GREEN">
    <defs>
      <linearGradient id="wo-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#0e7490" />
        <stop offset="60%" stopColor="#16a34a" />
        <stop offset="100%" stopColor="#052e16" />
      </linearGradient>
      <linearGradient id="wo-card" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#cffafe" />
      </linearGradient>
    </defs>

    <rect width="480" height="480" rx="32" fill="url(#wo-bg)" />

    {/* Sun glow */}
    <circle cx="380" cy="100" r="80" fill="#facc15" opacity="0.18" />
    <circle cx="380" cy="100" r="38" fill="#facc15" opacity="0.95" />

    {/* Person figure */}
    <g transform="translate(240 280)">
      {/* Body */}
      <path d="M-50 80 C -50 30, -30 10, 0 10 C 30 10, 50 30, 50 80 Z" fill="#fff" />
      {/* Head */}
      <circle cx="0" cy="-20" r="32" fill="#fbbf24" />
      {/* Hair */}
      <path d="M-30 -30 C -28 -45, 28 -45, 30 -30 L 32 -10 C 32 -10, -32 -10, -32 -10 Z" fill="#1f2937" />
      {/* Smile */}
      <path d="M-8 -16 Q 0 -10, 8 -16" stroke="#7c2d12" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Eyes */}
      <circle cx="-10" cy="-26" r="2" fill="#1f2937" />
      <circle cx="10" cy="-26" r="2" fill="#1f2937" />

      {/* Hand waving */}
      <g transform="translate(-50 30) rotate(-20)">
        <rect x="-6" y="0" width="12" height="22" rx="6" fill="#fbbf24" />
      </g>
    </g>

    {/* Floating cards with benefits */}
    <g transform="translate(60 130)" className="animate-float">
      <rect width="100" height="60" rx="10" fill="url(#wo-card)" />
      <circle cx="20" cy="30" r="14" fill="#22c55e" opacity="0.2" />
      <text x="42" y="26" fontFamily="Inter" fontSize="10" fontWeight="700" fill="#0f172a">Lợi nhuận</text>
      <text x="42" y="40" fontFamily="Inter" fontSize="13" fontWeight="800" fill="#16a34a">+18%/năm</text>
    </g>
    <g transform="translate(330 170)" className="animate-float" style={{ animationDelay: '0.7s' }}>
      <rect width="100" height="60" rx="10" fill="url(#wo-card)" />
      <circle cx="20" cy="30" r="14" fill="#0891b2" opacity="0.2" />
      <text x="42" y="26" fontFamily="Inter" fontSize="10" fontWeight="700" fill="#0f172a">Trạm sạc</text>
      <text x="42" y="40" fontFamily="Inter" fontSize="13" fontWeight="800" fill="#0e7490">1,247+</text>
    </g>
    <g transform="translate(80 320)" className="animate-float" style={{ animationDelay: '1.4s' }}>
      <rect width="100" height="60" rx="10" fill="url(#wo-card)" />
      <circle cx="20" cy="30" r="14" fill="#facc15" opacity="0.25" />
      <text x="42" y="26" fontFamily="Inter" fontSize="10" fontWeight="700" fill="#0f172a">Thành viên</text>
      <text x="42" y="40" fontFamily="Inter" fontSize="13" fontWeight="800" fill="#b45309">50K+</text>
    </g>

    {/* Title */}
    <text x="240" y="430" textAnchor="middle" fontFamily="Inter" fontSize="22" fontWeight="800" fill="#fff">Chào mừng đến V-GREEN</text>
    <text x="240" y="452" textAnchor="middle" fontFamily="Inter" fontSize="13" fill="#86efac">Đầu tư xanh, sinh lời bền vững</text>
  </svg>
);

export default WelcomeOnboarding;