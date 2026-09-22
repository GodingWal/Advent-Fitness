import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

// Mirror of mobile's PLACES_QUERY_MAP in src/data/mockPOIs.js
const PLACES_QUERY_MAP: Record<string, { type?: string; keyword?: string }> = {
  trails: { type: 'park', keyword: 'hiking trail' },
  gyms: { type: 'gym' },
  basketball: { keyword: 'basketball court' },
  tennis: { keyword: 'tennis court' },
  pickleball: { keyword: 'pickleball' },
  yoga: { keyword: 'yoga studio' },
  pools: { keyword: 'public swimming pool' },
  skate: { keyword: 'skate park' },
};

const querySchema = z.object({
  category: z.string().min(1),
  latitude: z.coerce.number().refine((n) => Number.isFinite(n), { message: 'Invalid latitude' }),
  longitude: z.coerce.number().refine((n) => Number.isFinite(n), { message: 'Invalid longitude' }),
  radius: z.coerce
    .number()
    .int()
    .positive()
    .default(5000),
});

const GOOGLE_NEARBY_BASE = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
const GOOGLE_PHOTO_BASE = 'https://maps.googleapis.com/maps/api/place/photo';

interface GoogleResult {
  place_id?: string;
  name?: string;
  vicinity?: string;
  rating?: number;
  geometry?: { location?: { lat?: number; lng?: number } };
  photos?: Array<{ photo_reference?: string }>;
  opening_hours?: { open_now?: boolean };
}

export function normalizeGoogleResult(r: GoogleResult, category: string): {
  id: string;
  category: string;
  name: string;
  address: string;
  rating: number | undefined;
  coordinate: { latitude: number; longitude: number };
  photo: string | null;
  open: boolean | undefined;
} {
  const photoRef = r.photos?.[0]?.photo_reference;
  return {
    id: r.place_id ?? '',
    category,
    name: r.name ?? '',
    address: r.vicinity ?? '',
    rating: r.rating,
    coordinate: {
      latitude: r.geometry?.location?.lat ?? 0,
      longitude: r.geometry?.location?.lng ?? 0,
    },
    // NOTE: intentionally WITHOUT the API key — the key must never be echoed to clients.
    photo: photoRef ? `${GOOGLE_PHOTO_BASE}?maxwidth=600&photoreference=${photoRef}` : null,
    open: r.opening_hours?.open_now,
  };
}

export async function registerPlacesRoutes(app: FastifyInstance): Promise<void> {
  // Exact path: NO /v1 prefix — mobile calls GET {API_URL}/places/nearby?...
  app.get('/places/nearby', async (req, reply) => {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      reply.code(400).send({ message: 'Invalid request', issues: parsed.error.issues });
      return;
    }
    const { category, latitude, longitude, radius } = parsed.data;

    // Read Google key ONLY from server env. Never accept it from the client, never echo it.
    const apiKey = process.env.GOOGLE_PLACES_API_KEY ?? '';
    if (!apiKey) {
      reply
        .code(503)
        .send({ success: false, code: 'PLACES_UNCONFIGURED', message: 'Places API is not configured.' });
      return;
    }

    const mapping = PLACES_QUERY_MAP[category];
    if (!mapping) {
      reply.code(200).send([]);
      return;
    }

    const q = new URLSearchParams({
      location: `${latitude},${longitude}`,
      radius: String(radius),
      key: apiKey,
    });
    if (mapping.type) q.append('type', mapping.type);
    if (mapping.keyword) q.append('keyword', mapping.keyword);

    let upstream: { status?: string; results?: GoogleResult[]; error_message?: string };
    try {
      const res = await fetch(`${GOOGLE_NEARBY_BASE}?${q.toString()}`);
      upstream = (await res.json()) as typeof upstream;
    } catch {
      reply
        .code(502)
        .send({ success: false, code: 'PLACES_UPSTREAM_ERROR', message: 'Places lookup failed.' });
      return;
    }
    if (upstream.status && upstream.status !== 'OK' && upstream.status !== 'ZERO_RESULTS') {
      reply
        .code(502)
        .send({ success: false, code: 'PLACES_UPSTREAM_ERROR', message: 'Places lookup failed.' });
      return;
    }
    const out = (upstream.results ?? []).map((r) => normalizeGoogleResult(r, category));
    reply.code(200).send(out);
  });
}
