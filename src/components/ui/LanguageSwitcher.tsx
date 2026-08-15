/**
 * LanguageSwitcher - Cho phép người dùng chuyển đổi giữa Tiếng Việt và Tiếng Anh.
 *
 * Hỗ trợ 2 variant:
 * - compact: dạng pill nhỏ, hiển thị ở header/menu (mặc định)
 * - list:    dạng danh sách lựa chọn, dùng trong trang settings
 */

import { useTranslation } from 'react-i18next';
import { Languages, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export type LanguageSwitcherVariant = 'compact' | 'list';

interface LanguageSwitcherProps {
  variant?: LanguageSwitcherVariant;
  className?: string;
  onAfterChange?: () => void;
}

const LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt', short: 'VI' },
  { code: 'en', label: 'English', short: 'EN' },
] as const;

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'compact',
  className,
  onAfterChange,
}) => {
  const { i18n } = useTranslation();

  const changeLanguage = (code: string) => {
    if (code === i18n.language) return;
    void i18n.changeLanguage(code);
    onAfterChange?.();
  };

  if (variant === 'list') {
    return (
      <div className={cn('space-y-1', className)}>
        {LANGUAGES.map((lng) => {
          const active = i18n.language === lng.code;
          return (
            <button
              key={lng.code}
              type="button"
              onClick={() => changeLanguage(lng.code)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground hover:bg-muted',
              )}
            >
              <span>{lng.label}</span>
              {active && <Check className="w-4 h-4" />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center bg-muted rounded-full p-0.5 text-xs',
        className,
      )}
      role="group"
      aria-label="Language switcher"
    >
      <Languages className="w-3.5 h-3.5 text-muted-foreground ml-2 mr-1" />
      {LANGUAGES.map((lng) => {
        const active = i18n.language === lng.code;
        return (
          <button
            key={lng.code}
            type="button"
            onClick={() => changeLanguage(lng.code)}
            aria-pressed={active}
            className={cn(
              'px-3 py-1 rounded-full transition-all font-medium',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {lng.short}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;