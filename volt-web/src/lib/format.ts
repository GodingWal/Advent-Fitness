export function formatDurationMin(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function formatPace(secPerKm: number | null | undefined, units: string): string {
  if (secPerKm == null || !Number.isFinite(secPerKm) || secPerKm <= 0) return '—';
  const m = Math.floor(secPerKm / 60);
  const s = String(Math.round(secPerKm % 60)).padStart(2, '0');
  return units === 'mi' ? `${m}:${s} /mi` : `${m}:${s} /km`;
}

export function formatDistance(km: number | null | undefined, units: string): string {
  if (km == null || !Number.isFinite(km)) return '—';
  if (units === 'mi') return `${(km * 0.621371).toFixed(2)} mi`;
  return `${km.toFixed(2)} km`;
}

export function weekProgress(doneMin: number, targetH: number): number {
  if (targetH <= 0) return 0;
  return Math.min(100, Math.round((doneMin / (targetH * 60)) * 100));
}

export function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}

export function daysUntil(expiresAt: string): number {
  return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000);
}
