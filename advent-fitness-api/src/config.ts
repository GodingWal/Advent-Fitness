export const config = {
  port: Number(process.env.PORT ?? 3000),
  env: process.env.NODE_ENV ?? 'development',
  authJwtSecret: process.env.AUTH_JWT_SECRET ?? 'dev-auth-secret-change-me',
  qrSecret: process.env.QR_SECRET ?? 'dev-qr-secret-change-me',
  kisiWebhookSecret: process.env.KISI_WEBHOOK_SECRET ?? 'dev-kisi-webhook-secret',
  kisiApiBaseUrl: process.env.KISI_API_BASE_URL ?? '',
  kisiApiKey: process.env.KISI_API_KEY ?? '',
};

export function isDev(): boolean {
  return config.env !== 'production' && config.env !== 'test';
}
