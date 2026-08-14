import React from 'react';

interface Props {
  className?: string;
}

const NoNotifications: React.FC<Props> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" className={className} role="img" aria-label="Chưa có thông báo">
    <defs>
      <linearGradient id="nn-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fef3c7" />
        <stop offset="100%" stopColor="#fed7aa" />
      </linearGradient>
    </defs>
    <ellipse cx="160" cy="220" rx="120" ry="14" fill="#000" opacity="0.08" />
    <rect x="40" y="40" width="240" height="160" rx="20" fill="url(#nn-bg)" />

    {/* Sleeping bell */}
    <g transform="translate(160 110)">
      {/* Z's floating up */}
      <g className="animate-float" opacity="0.7">
        <text x="-50" y="-50" fontFamily="Inter" fontSize="20" fontWeight="800" fill="#fb923c">z</text>
      </g>
      <g className="animate-float" style={{ animationDelay: '0.5s' }} opacity="0.5">
        <text x="-30" y="-70" fontFamily="Inter" fontSize="16" fontWeight="800" fill="#fb923c">z</text>
      </g>
      <g className="animate-float" style={{ animationDelay: '1s' }} opacity="0.4">
        <text x="-10" y="-85" fontFamily="Inter" fontSize="14" fontWeight="800" fill="#fb923c">z</text>
      </g>

      {/* Bell */}
      <path d="M0 -40 C -22 -40, -30 -28, -30 -10 L -30 14 L -38 22 H 38 L 30 14 L 30 -10 C 30 -28, 22 -40, 0 -40 Z" fill="#f97316" />
      <path d="M0 -40 C -22 -40, -30 -28, -30 -10 L -30 14 L -38 22 H 38 L 30 14 L 30 -10 C 30 -28, 22 -40, 0 -40 Z" fill="none" stroke="#7c2d12" strokeWidth="2" />
      <circle cx="0" cy="30" r="6" fill="#7c2d12" />

      {/* Closed eyes */}
      <path d="M-12 -8 Q -8 -10, -4 -8" stroke="#7c2d12" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M4 -8 Q 8 -10, 12 -8" stroke="#7c2d12" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  </svg>
);

export default NoNotifications;
export { NoNotifications };