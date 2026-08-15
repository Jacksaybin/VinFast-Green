/**
 * useThemeTokens - Hook đọc CSS variables runtime
 * Hữu ích cho SVG fill="currentColor" tự chuyển màu theo theme/accent
 */

import { useEffect, useState } from 'react';

interface ThemeTokens {
  primary: string;
  accent: string;
  background: string;
  foreground: string;
  uiAccent: string;
  isDark: boolean;
}

const tokensToVar: (keyof ThemeTokens)[] = [
  'primary',
  'accent',
  'background',
  'foreground',
];

function readVar(name: string): string {
  if (typeof window === 'undefined') return '';
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(`--${name}`)
    .trim();
  return value;
}

function hslVarToCss(hsl: string): string {
  if (!hsl) return '';
  return `hsl(${hsl})`;
}

export function useThemeTokens(): ThemeTokens {
  const [tokens, setTokens] = useState<ThemeTokens>(() => ({
    primary: '',
    accent: '',
    background: '',
    foreground: '',
    uiAccent: '',
    isDark: false,
  }));

  useEffect(() => {
    const update = () => {
      const isDark = document.documentElement.classList.contains('dark');
      const uiAccent =
        document.documentElement.style.getPropertyValue('--ui-accent') ||
        '#16a34a';

      const next: ThemeTokens = {
        primary: '',
        accent: '',
        background: '',
        foreground: '',
        uiAccent,
        isDark,
      };
      tokensToVar.forEach((k) => {
        next[k] = hslVarToCss(readVar(k));
      });
      setTokens(next);
    };

    update();

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    return () => observer.disconnect();
  }, []);

  return tokens;
}