import Constants from 'expo-constants';
import { logger, setReporter } from './logger';

let initialized = false;

export function initTelemetry() {
  if (initialized) return;
  initialized = true;
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN || Constants.expoConfig?.extra?.sentryDsn || null;

  setReporter((entry) => {
    if (__DEV__) return;
    // No hard Sentry dependency: forward only if a transport is injected.
    if (typeof globalThis.__VOLT_TELEMETRY__ === 'function') {
      try {
        globalThis.__VOLT_TELEMETRY__(entry);
      } catch (_) {
        // never break the app
      }
    } else if (entry.level === 'error' && dsn) {
      // DSN configured but no native SDK yet — keeps the hook documented.
      // Install @sentry/react-native and call Sentry.captureException here.
    }
  });
}

export function flushTelemetry() {
  logger.info('telemetry flush (noop)');
}
