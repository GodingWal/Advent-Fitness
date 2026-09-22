import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from './http';

export const DEV_API_URL_KEY = '@volt/dev-api-url';

export async function getStoredDevApiUrl() {
  try {
    const raw = await AsyncStorage.getItem(DEV_API_URL_KEY);
    return typeof raw === 'string' && raw.trim() ? raw.trim() : null;
  } catch {
    return null;
  }
}

export async function setStoredDevApiUrl(url) {
  try {
    if (!url || !String(url).trim()) {
      await AsyncStorage.removeItem(DEV_API_URL_KEY);
      return;
    }
    await AsyncStorage.setItem(DEV_API_URL_KEY, String(url).trim());
  } catch {
    // Storage is best-effort in dev.
  }
}

function normalizeBase(url) {
  return String(url || '')
    .trim()
    .replace(/\/+$/, '');
}

export async function checkHealth(timeoutMs = 8000) {
  const base = normalizeBase(getApiBaseUrl());
  if (!base) {
    return {
      ok: false,
      url: '',
      error: 'EXPO_PUBLIC_API_URL is missing. Run npm run dev.',
    };
  }
  try {
    const res = await axios.get(`${base}/health`, { timeout: timeoutMs });
    const ok = res?.data?.ok === true || res?.status === 200;
    if (ok) return { ok: true, url: base, error: null };
    return {
      ok: false,
      url: base,
      error: `Backend unreachable at ${base}. Start it with npm run dev.`,
    };
  } catch (e) {
    const detail = e?.response?.status ? ` (HTTP ${e.response.status})` : '';
    const message = e?.message ? `${e.message}${detail}` : `Request failed${detail}`;
    return {
      ok: false,
      url: base,
      error: `Backend unreachable at ${base}. Start it with npm run dev. (${message})`,
    };
  }
}
