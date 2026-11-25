export type OversightMetric = {
  value: number | null;
  state?: string;
  hint?: string;
  unavailableReason?: string;
  asOf?: string;
  source?: string;
};

export function metricValue(metric?: OversightMetric | null, fallback = 0): number {
  if (!metric || typeof metric.value !== 'number' || Number.isNaN(metric.value)) return fallback;
  return metric.value;
}

export function metricUnavailable(metric?: OversightMetric | null): boolean {
  return !metric || metric.value === null || metric.state === 'unavailable' || metric.state === 'error';
}

export const chartColors = {
  maroon: '#711F32',
  maroonSoft: '#9A3B4E',
  gold: '#B38B45',
  amber: '#C9962B',
  cream: '#F4EBDD',
  slate: '#6B7280',
  emerald: '#047857',
  rose: '#9F1239',
  sky: '#3B6EA5',
};

export const statusColor: Record<string, string> = {
  APPROVED: chartColors.maroon,
  PENDING: chartColors.gold,
  PENDING_REVIEW: chartColors.amber,
  REJECTED: chartColors.rose,
  INACTIVE: chartColors.slate,
};

export function statusLabel(status: string): string {
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function monthLabel(month: string): string {
  if (!month || !/^\d{4}-\d{2}$/.test(month)) return month;
  const [year, m] = month.split('-').map(Number);
  return new Date(year, m - 1, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}
