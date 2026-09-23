import { z } from 'zod';
import { apiFetch } from './client';

export const placeSchema = z.object({
  id: z.string(),
  category: z.string(),
  name: z.string(),
  address: z.string(),
  rating: z.number().nullable().optional(),
  coordinate: z.object({ latitude: z.number(), longitude: z.number() }).optional(),
  open: z.boolean().nullable().optional(),
});
export type Place = z.infer<typeof placeSchema>;

// Always goes through the backend proxy so no Google key ships to the browser.
export async function nearbyPlaces(q: { category?: string; latitude: number; longitude: number; radius?: number }) {
  const p = new URLSearchParams({
    latitude: String(q.latitude),
    longitude: String(q.longitude),
    radius: String(q.radius ?? 5000),
  });
  if (q.category) p.set('category', q.category);
  // Same-origin proxy route (server keeps the Google key).
  const res = await fetch(`/api/places/nearby?${p}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('VOLT cannot reach the server. Check your connection and try again.');
  const data = (await res.json()) as unknown;
  return z.array(placeSchema).parse(data);
}

export async function apiHealth(): Promise<{ ok: boolean; mode?: string }> {
  try {
    const res = await fetch('/api/health', { cache: 'no-store' });
    if (!res.ok) return { ok: false };
    return (await res.json()) as { ok: boolean; mode?: string };
  } catch {
    return { ok: false };
  }
}
