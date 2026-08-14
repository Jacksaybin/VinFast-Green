/**
 * V-GREEN Design Tokens
 * Một bảng tra cứu tập trung cho mọi giá trị thiết kế của hệ thống.
 * Dùng khi cần truy cập token từ JavaScript (ví dụ inline style, SVG fill, v.v.)
 * Đối với Tailwind class, ưu tiên dùng utility class từ tailwind.config.js.
 */

export const brand = {
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  accent: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    950: '#083344',
  },
  energy: {
    yellow: '#facc15',
    orange: '#fb923c',
    red: '#f87171',
  },
} as const;

export const semantic = {
  success: {
    subtle: 'hsl(142 76% 95%)',
    DEFAULT: 'hsl(142 71% 45%)',
    strong: 'hsl(142 76% 32%)',
  },
  warning: {
    subtle: 'hsl(38 92% 95%)',
    DEFAULT: 'hsl(38 92% 50%)',
    strong: 'hsl(32 95% 36%)',
  },
  danger: {
    subtle: 'hsl(0 86% 96%)',
    DEFAULT: 'hsl(0 84% 60%)',
    strong: 'hsl(0 72% 45%)',
  },
  info: {
    subtle: 'hsl(199 89% 95%)',
    DEFAULT: 'hsl(199 89% 48%)',
    strong: 'hsl(199 84% 36%)',
  },
} as const;

export const gradient = {
  primary: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
  hero: 'linear-gradient(135deg, #16a34a 0%, #0e7490 100%)',
  card: 'linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%)',
  mesh: 'radial-gradient(at 20% 20%, rgba(74, 222, 128, 0.35) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(34, 211, 238, 0.25) 0px, transparent 50%), radial-gradient(at 0% 80%, rgba(34, 197, 94, 0.25) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(14, 116, 144, 0.2) 0px, transparent 50%)',
} as const;

export const radius = {
  sm: 'calc(var(--radius) - 4px)',
  DEFAULT: '0.625rem',
  md: 'calc(var(--radius) - 2px)',
  lg: 'var(--radius)',
  xl: 'calc(var(--radius) + 4px)',
  '2xl': 'calc(var(--radius) + 8px)',
  full: '9999px',
} as const;

export const shadow = {
  glow: '0 0 24px 0 rgba(22, 163, 74, 0.35)',
  'glow-lg': '0 0 40px 0 rgba(22, 163, 74, 0.45)',
  elevated: '0 10px 30px -10px rgba(0, 0, 0, 0.15)',
  card: '0 4px 16px -4px rgba(0, 0, 0, 0.08)',
  'card-hover': '0 8px 28px -8px rgba(0, 0, 0, 0.18)',
} as const;

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
} as const;

export type BrandColor = keyof typeof brand.primary;
export type AccentColor = keyof typeof brand.accent;