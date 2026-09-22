export const DEV_DEFAULTS = {
  authJwtSecret: 'dev-auth-secret-change-me',
  qrSecret: 'dev-qr-secret-change-me',
  kisiWebhookSecret: 'dev-kisi-webhook-secret',
} as const;

export function validateProductionSecrets(cfg: {
  env: string;
  authJwtSecret: string;
  qrSecret: string;
  kisiWebhookSecret: string;
}): void {
  if (cfg.env !== 'production') return;
  const bad: string[] = [];
  if (cfg.authJwtSecret === DEV_DEFAULTS.authJwtSecret) bad.push('AUTH_JWT_SECRET');
  if (cfg.qrSecret === DEV_DEFAULTS.qrSecret) bad.push('QR_SECRET');
  if (cfg.kisiWebhookSecret === DEV_DEFAULTS.kisiWebhookSecret) bad.push('KISI_WEBHOOK_SECRET');
  if (bad.length > 0) {
    throw new Error(
      `Refusing to boot in production with dev-default secrets: ${bad.join(', ')}. ` +
        `Set real values via env vars.`
    );
  }
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  env: process.env.NODE_ENV ?? 'development',
  authJwtSecret: process.env.AUTH_JWT_SECRET ?? DEV_DEFAULTS.authJwtSecret,
  qrSecret: process.env.QR_SECRET ?? DEV_DEFAULTS.qrSecret,
  kisiWebhookSecret: process.env.KISI_WEBHOOK_SECRET ?? DEV_DEFAULTS.kisiWebhookSecret,
  kisiApiBaseUrl: process.env.KISI_API_BASE_URL ?? '',
  kisiApiKey: process.env.KISI_API_KEY ?? '',
  googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY ?? '',
};

validateProductionSecrets(config);

export function isDev(): boolean {
  return config.env !== 'production' && config.env !== 'test';
}
