import { describe, expect, it } from 'vitest';
import { DEV_DEFAULTS, validateProductionSecrets } from '../src/config';

describe('production secrets enforcement', () => {
  it('does nothing outside production', () => {
    expect(() =>
      validateProductionSecrets({
        env: 'development',
        authJwtSecret: DEV_DEFAULTS.authJwtSecret,
        qrSecret: DEV_DEFAULTS.qrSecret,
        kisiWebhookSecret: DEV_DEFAULTS.kisiWebhookSecret,
      })
    ).not.toThrow();
    expect(() =>
      validateProductionSecrets({
        env: 'test',
        authJwtSecret: DEV_DEFAULTS.authJwtSecret,
        qrSecret: DEV_DEFAULTS.qrSecret,
        kisiWebhookSecret: DEV_DEFAULTS.kisiWebhookSecret,
      })
    ).not.toThrow();
  });

  it('throws in production when any secret is still the dev default', () => {
    expect(() =>
      validateProductionSecrets({
        env: 'production',
        authJwtSecret: DEV_DEFAULTS.authJwtSecret,
        qrSecret: 'real-qr',
        kisiWebhookSecret: 'real-kisi',
      })
    ).toThrow(/AUTH_JWT_SECRET/);

    expect(() =>
      validateProductionSecrets({
        env: 'production',
        authJwtSecret: 'real-auth',
        qrSecret: DEV_DEFAULTS.qrSecret,
        kisiWebhookSecret: DEV_DEFAULTS.kisiWebhookSecret,
      })
    ).toThrow(/QR_SECRET.*KISI_WEBHOOK_SECRET|KISI_WEBHOOK_SECRET.*QR_SECRET/);
  });

  it('passes in production with real secrets', () => {
    expect(() =>
      validateProductionSecrets({
        env: 'production',
        authJwtSecret: 'real-auth-secret',
        qrSecret: 'real-qr-secret',
        kisiWebhookSecret: 'real-kisi-secret',
      })
    ).not.toThrow();
  });
});
