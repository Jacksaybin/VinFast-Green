/**
 * AppearanceManager - Module quản lý giao diện (theme, font-size, density, accent color)
 * Đã tinh chỉnh: 5 accent mới (VinFast Blue, V-GREEN, Solar Yellow, Ocean Cyan, Forest Deep), live preview.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Moon, Sun, Monitor, Droplet, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { LogoVGreen, FeatureIcon } from './ui/illustrations';

type ThemeMode = 'light' | 'dark' | 'system';

interface Accent {
  key: string;
  name: string;
  hex: string;
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  const mq = window.matchMedia('(prefers-color-scheme: dark)');

  const setDark = (on: boolean) => {
    if (on) root.classList.add('dark');
    else root.classList.remove('dark');
  };

  if (mode === 'system') {
    setDark(mq.matches);
  } else if (mode === 'dark') {
    setDark(true);
  } else {
    setDark(false);
  }
}

function bindSystemThemeListener(enabled: boolean) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const listener = (e: MediaQueryListEvent) => {
    const mode = safeGet('ui.theme') as ThemeMode | null;
    if (mode === 'system') {
      if (e.matches) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }
  };

  if (enabled) {
    try {
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    } catch {
      try {
        // @ts-ignore
        mq.addListener(listener);
        return () => {
          // @ts-ignore
          mq.removeListener(listener);
        };
      } catch {
        return () => {};
      }
    }
  }
  return () => {};
}

function applyFontSize(px: number) {
  document.documentElement.style.fontSize = `${px}px`;
}

function applyAccent(hex: string) {
  document.documentElement.style.setProperty('--ui-accent', hex);
}

function applyCompact(compact: boolean) {
  const root = document.documentElement;
  if (compact) {
    root.setAttribute('data-compact', 'true');
    root.style.setProperty('--ui-line', '1.35');
    root.style.setProperty('--ui-letter', '-0.01em');
  } else {
    root.removeAttribute('data-compact');
    root.style.removeProperty('--ui-line');
    root.style.removeProperty('--ui-letter');
  }
}

const AppearanceManager: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>(
    () => (safeGet('ui.theme') as ThemeMode) || 'system'
  );
  const [fontPx, setFontPx] = useState<number>(() => {
    const saved = safeGet('ui.fontPx');
    return saved ? parseInt(saved, 10) || 16 : 16;
  });
  const [compact, setCompact] = useState<boolean>(
    () => safeGet('ui.compact') === 'true'
  );
  const [accent, setAccent] = useState<string>(
    () => safeGet('ui.accent') || '#16a34a'
  );

  // Bảng accent mở rộng với 5 màu V-GREEN branding
  const accents: Accent[] = useMemo(
    () => [
      { key: 'vgreen', name: 'V-GREEN', hex: '#16a34a' },
      { key: 'vinfast', name: 'VinFast Blue', hex: '#0ea5e9' },
      { key: 'ocean', name: 'Ocean Cyan', hex: '#06b6d4' },
      { key: 'forest', name: 'Forest Deep', hex: '#15803d' },
      { key: 'solar', name: 'Solar Yellow', hex: '#facc15' },
      { key: 'sunset', name: 'Sunset Orange', hex: '#fb923c' },
      { key: 'rose', name: 'Rose', hex: '#e11d48' },
      { key: 'purple', name: 'Purple', hex: '#7c3aed' },
      { key: 'indigo', name: 'Indigo', hex: '#4f46e5' },
      { key: 'slate', name: 'Slate', hex: '#475569' },
    ],
    []
  );

  useEffect(() => {
    applyTheme(theme);
    safeSet('ui.theme', theme);
    const unbind = bindSystemThemeListener(theme === 'system');
    return unbind;
  }, [theme]);

  useEffect(() => {
    applyFontSize(fontPx);
    safeSet('ui.fontPx', String(fontPx));
  }, [fontPx]);

  useEffect(() => {
    applyAccent(accent);
    safeSet('ui.accent', accent);
  }, [accent]);

  useEffect(() => {
    applyCompact(compact);
    safeSet('ui.compact', String(compact));
  }, [compact]);

  const handleReset = () => {
    setTheme('system');
    setFontPx(16);
    setCompact(false);
    setAccent('#16a34a');
  };

  return (
    <div className="space-y-4">
      <style>{`
        :root {
          --ui-accent: ${accent};
        }
        [data-compact="true"] body, [data-compact="true"] * {
          line-height: var(--ui-line, 1.45);
          letter-spacing: var(--ui-letter, 0);
        }
      `}</style>

      {/* Theme Mode */}
      <div className="bg-card rounded-2xl shadow-card border border-border p-4 md:p-5">
        <h3 className="font-semibold text-foreground mb-1">Chế độ hiển thị</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Chọn theme sáng, tối hoặc đồng bộ với hệ điều hành
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setTheme('light')}
            className={cn(
              'flex items-center justify-center space-x-2 border-2 rounded-xl py-3 transition-all',
              theme === 'light'
                ? 'border-[var(--ui-accent)] bg-[color:var(--ui-accent)/0.08] text-foreground shadow-glow'
                : 'border-border hover:border-[var(--ui-accent)]/40'
            )}
          >
            <Sun className="w-4 h-4 text-[var(--ui-accent)]" />
            <span className="text-sm font-medium">Light</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={cn(
              'flex items-center justify-center space-x-2 border-2 rounded-xl py-3 transition-all',
              theme === 'dark'
                ? 'border-[var(--ui-accent)] bg-[color:var(--ui-accent)/0.08] text-foreground shadow-glow'
                : 'border-border hover:border-[var(--ui-accent)]/40'
            )}
          >
            <Moon className="w-4 h-4 text-[var(--ui-accent)]" />
            <span className="text-sm font-medium">Dark</span>
          </button>
          <button
            onClick={() => setTheme('system')}
            className={cn(
              'flex items-center justify-center space-x-2 border-2 rounded-xl py-3 transition-all',
              theme === 'system'
                ? 'border-[var(--ui-accent)] bg-[color:var(--ui-accent)/0.08] text-foreground shadow-glow'
                : 'border-border hover:border-[var(--ui-accent)]/40'
            )}
          >
            <Monitor className="w-4 h-4 text-[var(--ui-accent)]" />
            <span className="text-sm font-medium">System</span>
          </button>
        </div>
      </div>

      {/* Font Size */}
      <div className="bg-card rounded-2xl shadow-card border border-border p-4 md:p-5">
        <h3 className="font-semibold text-foreground mb-1">Cỡ chữ toàn trang</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Điều chỉnh kích thước chữ phù hợp với bạn
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setFontPx(14)}
            className={cn(
              'border-2 rounded-xl py-3 text-sm transition-all',
              fontPx === 14
                ? 'border-[var(--ui-accent)] bg-[color:var(--ui-accent)/0.08] text-foreground shadow-glow'
                : 'border-border hover:border-[var(--ui-accent)]/40'
            )}
          >
            Nhỏ (14)
          </button>
          <button
            onClick={() => setFontPx(16)}
            className={cn(
              'border-2 rounded-xl py-3 transition-all',
              fontPx === 16
                ? 'border-[var(--ui-accent)] bg-[color:var(--ui-accent)/0.08] text-foreground shadow-glow'
                : 'border-border hover:border-[var(--ui-accent)]/40'
            )}
          >
            Chuẩn (16)
          </button>
          <button
            onClick={() => setFontPx(18)}
            className={cn(
              'border-2 rounded-xl py-3 text-lg transition-all',
              fontPx === 18
                ? 'border-[var(--ui-accent)] bg-[color:var(--ui-accent)/0.08] text-foreground shadow-glow'
                : 'border-border hover:border-[var(--ui-accent)]/40'
            )}
          >
            Lớn (18)
          </button>
        </div>
      </div>

      {/* Compact Mode */}
      <div className="bg-card rounded-2xl shadow-card border border-border p-4 md:p-5">
        <h3 className="font-semibold text-foreground mb-1">Chế độ cô đọng</h3>
        <p className="text-sm text-muted-foreground">
          Giảm khoảng cách, tăng mật độ thông tin (phù hợp màn hình nhỏ).
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted-foreground">Hiện đang: {compact ? 'Bật' : 'Tắt'}</span>
          <button
            onClick={() => setCompact(!compact)}
            className={cn(
              'min-w-[80px] text-sm rounded-full px-3 py-1.5 border-2 transition-all',
              compact
                ? 'border-[var(--ui-accent)] bg-[color:var(--ui-accent)/0.08] text-foreground'
                : 'border-border hover:border-[var(--ui-accent)]/40 text-muted-foreground'
            )}
          >
            {compact ? 'Bật' : 'Tắt'}
          </button>
        </div>
      </div>

      {/* Accent Color */}
      <div className="bg-card rounded-2xl shadow-card border border-border p-4 md:p-5">
        <h3 className="font-semibold text-foreground mb-1">Màu nhấn</h3>
        <p className="text-xs text-muted-foreground mb-3">
          10 màu nhấn đặc trưng V-GREEN — áp dụng cho nút, viền, highlight
        </p>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {accents.map((a) => (
            <button
              key={a.key}
              onClick={() => setAccent(a.hex)}
              className="group flex flex-col items-center gap-1"
              title={a.name}
            >
              <span
                className={cn(
                  'w-10 h-10 rounded-full relative transition-transform group-hover:scale-110',
                  accent.toLowerCase() === a.hex.toLowerCase() &&
                    'ring-2 ring-offset-2 ring-offset-card ring-[var(--ui-accent)]'
                )}
                style={{ backgroundColor: a.hex }}
              >
                {accent.toLowerCase() === a.hex.toLowerCase() && (
                  <span className="absolute inset-0 flex items-center justify-center text-white">
                    <Check className="w-4 h-4" />
                  </span>
                )}
              </span>
              <span className="text-[10px] text-muted-foreground truncate max-w-full">
                {a.name}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Droplet className="w-4 h-4 text-muted-foreground" />
          <input
            aria-label="Chọn màu nhấn tùy ý"
            type="color"
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
            className="w-9 h-9 rounded-full overflow-hidden cursor-pointer border border-border"
          />
          <span className="text-xs text-muted-foreground">
            Tùy chỉnh nâng cao
          </span>
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-card rounded-2xl shadow-card border border-border p-4 md:p-5">
        <h3 className="font-semibold text-foreground mb-3">Xem trước</h3>
        <div className="bg-gradient-card rounded-xl p-4 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <LogoVGreen variant="mark" />
            <span className="text-xs text-muted-foreground">Live preview</span>
          </div>
          <h4 className="text-lg font-bold text-foreground">
            Tiêu đề mẫu
          </h4>
          <p className="text-sm text-muted-foreground">
            Đây là đoạn văn minh họa. Hệ thống sẽ áp dụng màu nhấn và theme bạn chọn.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-glow transition-all hover:scale-105"
              style={{ backgroundColor: accent }}
            >
              Nút chính
            </button>
            <button
              className="px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all hover:bg-[color:var(--ui-accent)/0.08]"
              style={{ borderColor: accent, color: accent }}
            >
              Nút phụ
            </button>
            <button
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ backgroundColor: `${accent}1a`, color: accent }}
            >
              Pill subtle
            </button>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${accent}1a` }}
            >
              <FeatureIcon name="investment" size={20} style={{ color: accent }} className="" />
            </div>
            <div
              className="w-10 h-10 rounded-full"
              style={{ backgroundColor: accent, opacity: 0.85 }}
            />
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: '66%', backgroundColor: accent }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div
              className="rounded-lg p-2 text-center border"
              style={{ borderColor: `${accent}40`, backgroundColor: `${accent}0a` }}
            >
              <div className="text-[10px] text-muted-foreground">Subtle</div>
              <div className="text-sm font-bold" style={{ color: accent }}>66%</div>
            </div>
            <div
              className="rounded-lg p-2 text-center text-white"
              style={{ backgroundColor: accent }}
            >
              <div className="text-[10px] opacity-90">Default</div>
              <div className="text-sm font-bold">2.5M</div>
            </div>
            <div
              className="rounded-lg p-2 text-center text-white"
              style={{ backgroundColor: `${accent}cc` }}
            >
              <div className="text-[10px] opacity-90">Soft</div>
              <div className="text-sm font-bold">+18%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Reset */}
      <div className="flex justify-end">
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          Đặt lại mặc định
        </button>
      </div>
    </div>
  );
};

export default AppearanceManager;