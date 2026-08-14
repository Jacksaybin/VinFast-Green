import React from 'react';

interface Props {
  className?: string;
}

const EmptyInvestments: React.FC<Props> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" className={className} role="img" aria-label="Chưa có gói đầu tư">
    <defs>
      <linearGradient id="ei-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#cffafe" />
        <stop offset="100%" stopColor="#bbf7d0" />
      </linearGradient>
      <linearGradient id="ei-card" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#22c55e" />
        <stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>
    </defs>
    <ellipse cx="160" cy="220" rx="120" ry="14" fill="#000" opacity="0.08" />
    <rect x="40" y="40" width="240" height="160" rx="20" fill="url(#ei-bg)" />

    {/* Empty cards stacked */}
    <g transform="translate(80 80)" opacity="0.4">
      <rect width="160" height="90" rx="10" fill="url(#ei-card)" />
    </g>
    <g transform="translate(90 70)" opacity="0.7">
      <rect width="160" height="90" rx="10" fill="url(#ei-card)" />
    </g>
    <g transform="translate(100 60)">
      <rect width="160" height="90" rx="10" fill="#ffffff" stroke="#22c55e" strokeWidth="2" strokeDasharray="6 4" />
      <text x="80" y="40" textAnchor="middle" fontFamily="Inter" fontSize="11" fontWeight="700" fill="#16a34a">CHƯA CÓ</text>
      <text x="80" y="58" textAnchor="middle" fontFamily="Inter" fontSize="11" fontWeight="700" fill="#16a34a">GÓI ĐẦU TƯ</text>
      <circle cx="80" cy="75" r="10" fill="#22c55e" opacity="0.15" />
      <path d="M75 75 L79 79 L86 71" stroke="#22c55e" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* Plus icon floating */}
    <g transform="translate(230 50)" className="animate-pulse-slow">
      <circle r="18" fill="#22c55e" />
      <path d="M-7 0 H7 M0 -7 V7" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </g>
  </svg>
);

export default EmptyInvestments;
export { EmptyInvestments };