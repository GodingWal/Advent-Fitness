import axios from 'axios';
import Constants from 'expo-constants';
import { logger } from './logger';

const RAW_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiUrl || '';

const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

function assertSafeUrl(url) {
  if (!url) return;
  const isLocalhost = /^https?:\/\/(127\.0\.0\.1|localhost)(:|\/|$)/.test(url);
  const isHttps = url.startsWith('https://');
  if (!isHttps && !(isDev && isLocalhost)) {
    throw new Error(`Refusing to use non-HTTPS API URL outside dev/localhost: ${url}`);
  }
}

assertSafeUrl(RAW_BASE_URL);

export const http = axios.create({
  baseURL: RAW_BASE_URL,
  timeout: 10_000,
});

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
