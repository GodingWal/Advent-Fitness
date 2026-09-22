import { buildApp } from './app';
import { config, isDev } from './config';
import { seed } from './db/seed';

async function main(): Promise<void> {
  const app = await buildApp();
  if (config.env !== 'test') {
    await seed();
    if (isDev()) {
      console.log('Seed user: member@volt.test / Volt12345!');
    }
  }
  await app.listen({ port: config.port, host: '0.0.0.0' });
  console.log(`advent-fitness-api listening on http://localhost:${config.port}`);
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});
