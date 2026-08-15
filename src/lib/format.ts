/**
 * Định dạng số tiền và ngày tháng dùng chung
 */

export function formatCurrency(amount: number, locale: string = 'vi-VN'): string {
  const lc = locale === 'en' ? 'en-US' : 'vi-VN';
  return new Intl.NumberFormat(lc).format(amount) + ' ₫';
}

export function formatShortCurrency(amount: number, locale: string = 'vi-VN'): string {
  const lc = locale === 'en' ? 'en-US' : 'vi-VN';
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)} ${locale === 'en' ? 'billion' : 'tỷ'}`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(0)} ${locale === 'en' ? 'million' : 'triệu'}`;
  }
  return formatCurrency(amount, locale);
}

export function formatDate(date: Date | string, locale: string = 'vi-VN'): string {
  const lc = locale === 'en' ? 'en-US' : 'vi-VN';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(lc);
}

export function generateReference(prefix: string): string {
  return `${prefix}${Date.now().toString().slice(-8)}`;
}
