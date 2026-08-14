/**
 * AppearanceManager - Module quản lý giao diện (theme, font-size, density, accent color)
 * - Lưu cấu hình trong localStorage
 * - Áp dụng toàn cục qua document.documentElement (class + style)
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Moon, Sun, Monitor, Droplet, Check } from 'lucide-react';

/**
 * ThemeMode - Kiểu theme
 */
type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Accent - Màu nhấn đơn giản
 */
interface Accent {
  key: string;
  name: string;
  hex: string;
}

/**
 * Lấy giá trị từ localStorage an toàn
 */
function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Lưu giá trị vào localStorage an toàn
 */
function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

/**
 * Áp dụng theme theo mode, thêm/xóa class "dark" vào documentElement
 */
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

/**
 * Theo dõi thay đổi system theme khi mode = system
 */
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
      // Safari fallback
      // @ts-ignore
      mq.addListener(listener);
      return () => {
        // @ts-ignore
        mq.removeListener(listener);
      };
    }
  }
  return () => {};
}

/**
 * Áp dụng font-size root (ảnh hưởng tới rem)
 */
function applyFontSize(px: number) {
  document.documentElement.style.fontSize = `${px}px`;
}

/**
 * Áp dụng màu nhấn thông qua CSS Variable --ui-accent
 */
function applyAccent(hex: string) {
  document.documentElement.style.setProperty('--ui-accent', hex);
}

/**
 * Áp dụng chế độ compact: thay đổi line-height và letter-spacing nhẹ nhàng
 * (áp dụng mức nhẹ để không phá layout; chủ yếu tối ưu Admin)
 */
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

/**
 * AppearanceManager Component - giao diện cài đặt
 */
const AppearanceManager: React.FC = () => {
  // Khởi tạo từ localStorage
  const [theme, setTheme] = useState<ThemeMode>(() => (safeGet('ui.theme') as ThemeMode) || 'system');
  const [fontPx, setFontPx] = useState<number>(() => {
    const saved = safeGet('ui.fontPx');
    return saved ? parseInt(saved, 10) || 16 : 16;
  });
  const [compact, setCompact] = useState<boolean>(() => safeGet('ui.compact') === 'true');
  const [accent, setAccent] = useState<string>(() => safeGet('ui.accent') || '#16a34a');

  /** Danh sách accent màu cơ bản */
  const accents: Accent[] = useMemo(
    () => [
      { key: 'green', name: 'Green', hex: '#16a34a' },
      { key: 'blue', name: 'Blue', hex: '#2563eb' },
      { key: 'purple', name: 'Purple', hex: '#7c3aed' },
      { key: 'orange', name: 'Orange', hex: '#f97316' },
      { key: 'rose', name: 'Rose', hex: '#e11d48' },
    ],
    []
  );

  /** Áp dụng khi mount và khi thay đổi */
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

  /** Reset về mặc định */
  const handleReset = () => {
    setTheme('system');
    setFontPx(16);
    setCompact(false);
    setAccent('#16a34a');
  };

  return (
    <div className="space-y-4">
      {/* Stylesheet nhỏ để tham chiếu CSS variables (không can thiệp shadcn.css) */}
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
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-3">Chế độ hiển thị</h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center justify-center space-x-2 border rounded-lg py-2 transition-colors ${
              theme === 'light' ? 'border-[var(--ui-accent)] bg-[color:var(--ui-accent)/0.05] text-gray-900' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Sun className="w-4 h-4 text-[var(--ui-accent)]" />
            <span>Light</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center justify-center space-x-2 border rounded-lg py-2 transition-colors ${
              theme === 'dark' ? 'border-[var(--ui-accent)] bg-[color:var(--ui-accent)/0.05] text-gray-900' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Moon className="w-4 h-4 text-[var(--ui-accent)]" />
            <span>Dark</span>
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`flex items-center justify-center space-x-2 border rounded-lg py-2 transition-colors ${
              theme === 'system' ? 'border-[var(--ui-accent)] bg-[color:var(--ui-accent)/0.05] text-gray-900' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Monitor className="w-4 h-4 text-[var(--ui-accent)]" />
            <span>System</span>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">System sẽ tự đồng bộ theo cài đặt hệ điều hành.</p>
      </div>

      {/* Font Size */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-3">Cỡ chữ toàn trang</h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setFontPx(14)}
            className={`border rounded-lg py-2 text-sm transition-colors ${
              fontPx === 14 ? 'border-[var(--ui-accent)] bg-[color:var(--ui-accent)/0.05] text-gray-900' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            Nhỏ (14)
          </button>
          <button
            onClick={() => setFontPx(16)}
            className={`border rounded-lg py-2 transition-colors ${
              fontPx === 16 ? 'border-[var(--ui-accent)] bg-[color:var(--ui-accent)/0.05] text-gray-900' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            Chuẩn (16)
          </button>
          <button
            onClick={() => setFontPx(18)}
            className={`border rounded-lg py-2 text-lg transition-colors ${
              fontPx === 18 ? 'border-[var(--ui-accent)] bg-[color:var(--ui-accent)/0.05] text-gray-900' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            Lớn (18)
          </button>
        </div>
      </div>

      {/* Compact Mode */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-3">Chế độ cô đọng</h3>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">Giảm khoảng cách, tăng mật độ thông tin (phù hợp màn hình nhỏ).</p>
          <button
            onClick={() => setCompact(!compact)}
            className={`min-w-[80px] text-sm rounded-full px-3 py-1 border transition-colors ${
              compact
                ? 'border-[var(--ui-accent)] bg-[color:var(--ui-accent)/0.08] text-gray-900'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            {compact ? 'Bật' : 'Tắt'}
          </button>
        </div>
      </div>

      {/* Accent Color */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-3">Màu nhấn</h3>
        <div className="flex items-center gap-3 flex-wrap">
          {accents.map((a) => (
            <button
              key={a.key}
              onClick={() => setAccent(a.hex)}
              className="w-9 h-9 rounded-full relative"
              style={{ backgroundColor: a.hex }}
              title={a.name}
            >
              {accent.toLowerCase() === a.hex.toLowerCase() && (
                <span className="absolute inset-0 flex items-center justify-center text-white">
                  <Check className="w-4 h-4" />
                </span>
              )}
            </button>
          ))}
          <div className="flex items-center gap-2 ml-1">
            <Droplet className="w-4 h-4 text-gray-500" />
            <input
              aria-label="Chọn màu nhấn"
              type="color"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              className="w-9 h-9 rounded-full overflow-hidden cursor-pointer border border-gray-200"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Một số thành phần sử dụng Tailwind màu cố định sẽ không đổi màu.</p>
      </div>

      {/* Reset */}
      <div className="flex justify-end">
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700"
        >
          Đặt lại mặc định
        </button>
      </div>
    </div>
  );
};

export default AppearanceManager;
