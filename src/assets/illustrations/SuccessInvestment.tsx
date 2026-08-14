import React from 'react';

interface Props {
  className?: string;
}

const SuccessInvestment: React.FC<Props> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" className={className} role="img" aria-label="Đầu tư thành công">
    <defs>
      <linearGradient id="si-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#bbf7d0" />
        <stop offset="100%" stopColor="#a7f3d0" />
      </linearGradient>
      <linearGradient id="si-circle" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#22c55e" />
        <stop offset="100%" stopColor="#0891b2" />
      </linearGradient>
    </defs>
    <ellipse cx="160" cy="220" rx="120" ry="14" fill="#000" opacity="0.08" />
    <rect x="40" y="40" width="240" height="160" rx="20" fill="url(#si-bg)" />

    {/* Big success circle */}
    <g transform="translate(160 110)">
      <circle r="50" fill="#fff" />
      <circle r="42" fill="url(#si-circle)" />
      <path d="M-18 0 L-6 12 L20 -16" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* Falling coins */}
    <g className="animate-float">
      <circle cx="80" cy="50" r="10" fill="#facc15" />
      <text x="80" y="55" textAnchor="middle" fontFamily="Inter" fontSize="11" fontWeight="800" fill="#92400e">$</text>
    </g>
    <g className="animate-float" style={{ animationDelay: '0.5s' }}>
      <circle cx="240" cy="60" r="12" fill="#fb923c" />
      <text x="240" y="66" textAnchor="middle" fontFamily="Inter" fontSize="13" fontWeight="800" fill="#7c2d12">₫</text>
    </g>
    <g className="animate-float" style={{ animationDelay: '1.2s' }}>
      <circle cx="50" cy="130" r="9" fill="#22c55e" />
      <text x="50" y="135" textAnchor="middle" fontFamily="Inter" fontSize="10" fontWeight="800" fill="#fff">$</text>
    </g>
    <g className="animate-float" style={{ animationDelay: '1.7s' }}>
      <circle cx="270" cy="140" r="11" fill="#06b6d4" />
      <text x="270" y="145" textAnchor="middle" fontFamily="Inter" fontSize="12" fontWeight="800" fill="#fff">$</text>
    </g>

    {/* Sparkles */}
    <g fill="#fff" opacity="0.9">
      <circle cx="120" cy="170" r="2" />
      <circle cx="200" cy="180" r="2.5" />
      <circle cx="100" cy="80" r="1.5" />
    </g>
  </svg>
);

export default SuccessInvestment;