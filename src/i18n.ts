/**
 * i18n configuration
 * Ngôn ngữ mặc định: Tiếng Việt (vi)
 * Fallback: Tiếng Anh (en)
 * Lưu lựa chọn ngôn ngữ vào localStorage.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import vi from './locales/vi';
import en from './locales/en';

const STORAGE_KEY = 'vgreen.language';

const getInitialLanguage = (): string => {
  if (typeof window === 'undefined') return 'vi';
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'vi' || saved === 'en') return saved;
  } catch {
    // localStorage có thể bị chặn (private mode, quota) - bỏ qua.
  }
  // Mặc định là tiếng Việt theo yêu cầu chuẩn hoá.
  return 'vi';
};

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'vi',
    defaultNS: 'translation',
    ns: ['translation'],
    interpolation: {
      escapeValue: false, // React đã escape giá trị an toàn.
    },
    react: {
      useSuspense: false,
    },
  });

// Đồng bộ hoá localStorage khi ngôn ngữ thay đổi.
i18n.on('languageChanged', (lng) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    // Bỏ qua lỗi quota/private mode.
  }
  // Cập nhật thuộc tính lang của <html> để phục vụ a11y & SEO.
  document.documentElement.lang = lng;
});

// Khởi tạo thuộc tính lang ngay khi load.
if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language;
}

export { STORAGE_KEY };
export default i18n;