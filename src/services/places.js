import axios from 'axios';
import Constants from 'expo-constants';
import { PLACES_QUERY_MAP } from '../data/mockPOIs';
import { logger } from './logger';

const API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  Constants.expoConfig?.extra?.googlePlacesApiKey ||
  '';

const PLACES_BASE = 'https://maps.googleapis.com/maps/api/place';

const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function hasPlacesKey() {
  return Boolean(API_KEY);
}

function buildPhotoUrl(photoRef) {
  if (!photoRef || !API_KEY) return null;
  return `${PLACES_BASE}/photo?maxwidth=600&photoreference=${photoRef}&key=${API_KEY}`;
}

async function getWithRetry(url, { retries = 2, baseDelay = 300, timeout = 8000 } = {}) {
  let attempt = 0;
  let lastErr;
  while (attempt <= retries) {
    try {
      return await axios.get(url, { timeout });
    } catch (e) {
      lastErr = e;
      const status = e?.response?.status;
      const transient =
        e?.code === 'ECONNABORTED' ||
        e?.message === 'Network Error' ||
        (status != null && RETRYABLE_STATUS.has(status));
      if (attempt === retries || !transient) throw e;
      await sleep(baseDelay * 2 ** attempt + Math.floor(Math.random() * 100));
      attempt += 1;
    }
  }
  throw lastErr;
}

export async function fetchNearbyPOIs({ category, latitude, longitude, radius = 5000 }) {
  if (!API_KEY) return null;
  const params = PLACES_QUERY_MAP[category];
  if (!params) return [];

  const query = new URLSearchParams({
    location: `${latitude},${longitude}`,
    radius: String(radius),
    key: API_KEY,
  });
  if (params.type) query.append('type', params.type);
  if (params.keyword) query.append('keyword', params.keyword);

  try {
    const { data } = await getWithRetry(
      `${PLACES_BASE}/nearbysearch/json?${query.toString()}`
    );
    if (data.status && data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      logger.warn('Places API non-OK status', { status: data.status, message: data.error_message });
      return null;
    }
    return (data.results || []).map((r) => ({
      id: r.place_id,
      category,
      name: r.name,
      address: r.vicinity,
      rating: r.rating,
      coordinate: {
        latitude: r.geometry.location.lat,
        longitude: r.geometry.location.lng,
      },
      photo: r.photos?.[0]?.photo_reference ? buildPhotoUrl(r.photos[0].photo_reference) : null,
      open: r.opening_hours?.open_now,
    }));
  } catch (e) {
    logger.warn('Places API error', { message: e?.message, status: e?.response?.status });
    return null;
  }
}
