import { getApiBaseUrl } from './http';
import { strings } from '../i18n/strings';

function currentBaseUrl(explicitUrl) {
  if (typeof explicitUrl === 'string' && explicitUrl.trim()) return explicitUrl.trim();
  try {
    return getApiBaseUrl() || '';
  } catch {
    return '';
  }
}

export function backendUnreachableMessage(url) {
  const base = currentBaseUrl(url);
  const at = base ? ` at ${base}` : '';
  return `Backend unreachable${at}. Start it with npm run dev.`;
}

export function isNetworkError(error) {
  if (!error) return false;
  if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') return true;
  const message = String(error.message || '');
  if (/network error/i.test(message)) return true;
  if (/timeout/i.test(message)) return true;
  if (/EXPO_PUBLIC_API_URL is missing/i.test(message)) return true;
  // Axios: request made but no response received.
  if (error.request && !error.response) return true;
  return false;
}

export function isEmailTakenError(error) {
  if (error?.response?.status === 409) return true;
  const code = error?.response?.data?.code;
  return code === 'EMAIL_TAKEN';
}

export function friendlyAuthError(error, { url, fallback } = {}) {
  if (isEmailTakenError(error)) return strings.auth.emailTaken;
  if (isNetworkError(error)) return backendUnreachableMessage(url);
  const serverMessage = error?.response?.data?.message;
  if (typeof serverMessage === 'string' && serverMessage.trim()) return serverMessage.trim();
  const message = error?.message;
  if (typeof message === 'string' && message.trim()) {
    if (/request failed with status code 409/i.test(message)) return strings.auth.emailTaken;
    return message.trim();
  }
  if (typeof fallback === 'string' && fallback) return fallback;
  return strings.auth.genericError;
}
