import React from 'react';

interface Props {
  className?: string;
}

const SecurityShield: React.FC<Props> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480" className={className} role="img" aria-label="Bảo mật an toàn">
    <defs>
      <radialGradient id="ss-bg" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor="#0e7490" />
        <stop offset="60%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#020617" />
      </radialGradient>
      <linearGradient id="ss-shield" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#86efac" />
        <stop offset="50%" stopColor="#22c55e" />
        <stop offset="100%" stopColor="#0891b2" />
      </linearGradient>
      <radialGradient id="ss-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
      </radialGradient>
    </defs>

    <rect width="480" height="480" rx="32" fill="url(#ss-bg)" />

    {/* Background pattern - circuit lines */}
    <g stroke="#22c55e" strokeWidth="1" opacity="0.15" fill="none">
      <path d="M0 80 H120 V40 H200" />
      <path d="M480 100 H360 V160 H280" />
      <path d="M40 380 H100 V340 H180" />
      <path d="M460 400 H380 V440 H320" />
    </g>
    <g fill="#22c55e" opacity="0.3">
      <circle cx="40" cy="80" r="2" />
      <circle cx="200" cy="40" r="2" />
      <circle cx="360" cy="160" r="2" />
      <circle cx="100" cy="340" r="2" />
      <circle cx="380" cy="440" r="2" />
    </g>

    {/* Glow behind shield */}
    <circle cx="240" cy="240" r="180" fill="url(#ss-glow)" />

    {/* Shield */}
    <g transform="translate(240 240)">
      <path
        d="M0 -130 L100 -90 V20 C 100 100, 60 150, 0 180 C -60 150, -100 100, -100 20 V -90 Z"
        fill="url(#ss-shield)"
      />
      <path
        d="M0 -130 L100 -90 V20 C 100 100, 60 150, 0 180 C -60 150, -100 100, -100 20 V -90 Z"
        fill="none"
        stroke="#fff"
        strokeWidth="3"
        opacity="0.4"
      />

      {/* Lock inside */}
      <g transform="translate(0 -10)">
        <rect x="-30" y="0" width="60" height="50" rx="8" fill="#fff" />
        <path d="M-20 0 V -16 C -20 -28, -10 -36, 0 -36 C 10 -36, 20 -28, 20 -16 V 0" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" />
        <circle cx="0" cy="22" r="6" fill="#16a34a" />
        <rect x="-2" y="22" width="4" height="14" fill="#16a34a" />
      </g>
    </g>

    {/* Orbiting dots */}
    <g className="animate-spin-slow" style={{ transformOrigin: '240px 240px' }}>
      <circle cx="240" cy="60" r="6" fill="#22c55e" />
      <circle cx="420" cy="240" r="4" fill="#06b6d4" />
      <circle cx="60" cy="240" r="5" fill="#facc15" />
    </g>

    {/* Title */}
    <text x="240" y="410" textAnchor="middle" fontFamily="Inter" fontSize="20" fontWeight="800" fill="#fff">Bảo mật 100%</text>
    <text x="240" y="434" textAnchor="middle" fontFamily="Inter" fontSize="13" fill="#86efac">Mã hóa end-to-end • JWT • Audit log</text>
  </svg>
);

export default SecurityShield;