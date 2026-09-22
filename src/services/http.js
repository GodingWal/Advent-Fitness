import axios from 'axios';
import { logger } from './logger';

const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

function envBaseUrl() {
  return process.env.EXPO_PUBLIC_API_URL || '';
}

let _overrideBaseUrl = null;

// Development-only API address override (used by the connection screen).
// Ignored in production builds.
export function setApiBaseUrl(url) {
  _overrideBaseUrl = url || null;
  http.defaults.baseURL = resolveApiBaseUrl({ loud: false });
}

export function getApiBaseUrl() {
  return _overrideBaseUrl || envBaseUrl();
}

function resolveApiBaseUrl({ loud = true } = {}) {
  const url = getApiBaseUrl();
  if (!url) {
    const message =
      'EXPO_PUBLIC_API_URL is missing. Run npm run dev (it sets the address automatically).';
    if (loud) {
      logger.error(message);
      if (isDev) throw new Error(message);
    }
    return '';
  }
  assertSafeUrl(url);
  return url;
}

function assertSafeUrl(url) {
  if (!url) return;
  const isLocalhost = /^https?:\/\/(127\.0\.0\.1|localhost)(:|\/|$)/.test(url);
  const isPrivateLan =
    /^https?:\/\/(10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)/.test(
      url
    );
  const isHttps = url.startsWith('https://');
  if (isHttps) return;
  if (isDev && (isLocalhost || isPrivateLan)) return;
  throw new Error(
    `Refusing to use non-HTTPS API URL in production: ${url}. Configure an explicit https:// endpoint.`
  );
}

export const http = axios.create({
  baseURL: resolveApiBaseUrl({ loud: false }),
  timeout: 10_000,
});

// Fail loudly in dev when no API address is configured, instead of
// letting requests go out relative and fail with a bare "Network Error".
http.interceptors.request.use((config) => {
  const base = config.baseURL || http.defaults.baseURL;
  if (!base) {
    throw new Error('EXPO_PUBLIC_API_URL is missing. Run npm run dev.');
  }
  return config;
});

// Auth wiring without a React import (avoids context cycles).
// AuthContext calls configureHttp({ getToken, onUnauthorized }) once.
let _getToken = null;
let _onUnauthorized = null;
let _interceptorsInstalled = false;

export function configureHttp({ getToken, onUnauthorized } = {}) {
  if (typeof getToken === 'function') _getToken = getToken;
  if (typeof onUnauthorized === 'function') _onUnauthorized = onUnauthorized;
  if (_interceptorsInstalled) return http;
  _interceptorsInstalled = true;

  http.interceptors.request.use(async (config) => {
    try {
      const token = _getToken ? await _getToken() : null;
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      logger.warn('http auth header failed', { message: e?.message });
    }
    return config;
  });

  http.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error?.response?.status === 401 && _onUnauthorized) {
        try {
          _onUnauthorized();
        } catch (_) {
          // never break the rejection chain
        }
      }
      return Promise.reject(error);
    }
  );
  return http;
}

export function __resetHttpForTests() {
  _getToken = null;
  _onUnauthorized = null;
  _interceptorsInstalled = false;
  http.interceptors.request.clear?.();
  http.interceptors.response.clear?.();
}

const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

function shouldRetry(error) {
  if (!error) return false;
  if (error.code === 'ECONNABORTED') return true;
  if (error.message === 'Network Error') return true;
  const status = error.response?.status;
  return status != null && RETRYABLE_STATUS.has(status);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function requestWithRetry(config, { retries = 3, baseDelay = 300 } = {}) {
  let attempt = 0;
  let lastError;
  while (attempt <= retries) {
    try {
      return await http.request(config);
    } catch (e) {
      lastError = e;
      if (attempt === retries || !shouldRetry(e)) {
        logger.warn('http request failed', {
          url: config?.url,
          attempt,
          status: e?.response?.status,
          message: e?.message,
        });
        throw e;
      }
      const delay = baseDelay * 2 ** attempt + Math.floor(Math.random() * 100);
      await sleep(delay);
      attempt += 1;
    }
  }
  throw lastError;
}
