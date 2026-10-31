/**
 * Utility functions for currency formatting across the app.
 */

export function formatCurrency(
  amount: number | string | undefined | null,
  currency: string = '₫'
): string {
  if (amount === undefined || amount === null) return `0 ${currency}`;
  const num = typeof amount === 'number' ? amount : Number(amount) || 0;
  return `${num.toLocaleString('vi-VN')} ${currency}`.trim();
}

export function formatVND(amount: number | string | undefined | null): string {
  return formatCurrency(amount, '₫');
}

export default formatCurrency;
