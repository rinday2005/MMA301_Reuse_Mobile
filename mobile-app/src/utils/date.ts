/**
 * Date and time formatting utility functions for Mobile App
 */

export function formatDate(
  dateInput: string | number | Date | undefined | null,
  format: 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'SHORT' = 'DD/MM/YYYY'
): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  if (format === 'YYYY-MM-DD') {
    return `${year}-${month}-${day}`;
  }
  if (format === 'SHORT') {
    return `${day}/${month}`;
  }
  return `${day}/${month}/${year}`;
}

export function formatDateTime(dateInput: string | number | Date | undefined | null): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes} ${formatDate(d)}`;
}

export function calculateDays(
  startDateStr?: string | Date,
  endDateStr?: string | Date
): number {
  if (!startDateStr || !endDateStr) return 1;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;

  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

export default {
  formatDate,
  formatDateTime,
  calculateDays,
};
