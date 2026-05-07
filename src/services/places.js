import axios from 'axios';
import Constants from 'expo-constants';
import { PLACES_QUERY_MAP } from '../data/mockPOIs';

const API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  Constants.expoConfig?.extra?.googlePlacesApiKey ||
  '';

const PLACES_BASE = 'https://maps.googleapis.com/maps/api/place';

export function hasPlacesKey() {
  return Boolean(API_KEY);
}

function buildPhotoUrl(photoRef) {
  if (!photoRef || !API_KEY) return null;
  return `${PLACES_BASE}/photo?maxwidth=600&photoreference=${photoRef}&key=${API_KEY}`;
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
    const { data } = await axios.get(`${PLACES_BASE}/nearbysearch/json?${query.toString()}`);
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
    console.warn('Places API error', e?.message);
    return null;
  }
}
