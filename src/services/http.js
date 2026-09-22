import axios from 'axios';
import Constants from 'expo-constants';
import { logger } from './logger';

const RAW_BASE_URL = process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiUrl || '';

const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

function assertSafeUrl(url) {
  if (!url) return;
  const isLocalhost = /^https?:\/\/(127\.0\.0\.1|localhost)(:|\/|$)/.test(url);
  const isPrivateLan =
    /^https?:\/\/(10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)/.test(
      url
    );
  const isHttps = url.startsWith('https://');
  if (!isHttps && !(isDev && (isLocalhost || isPrivateLan))) {
    throw new Error(`Refusing to use non-HTTPS API URL outside dev/localhost: ${url}`);
  }
}

assertSafeUrl(RAW_BASE_URL);

export const http = axios.create({
  baseURL: RAW_BASE_URL,
  timeout: 10_000,
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
