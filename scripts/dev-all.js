// One-command startup for all three VOLT surfaces: `npm run dev:all` (repo root).
// Starts volt-api (:3000), Expo (LAN QR), and volt-web (:3001).
// Windows-safe: spawns node + npm-cli directly, never invokes `.cmd` shims.
// Follows the same pattern as scripts/dev-local.js.
const { spawn, spawnSync } = require('node:child_process');
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');

const root = path.resolve(__dirname, '..');
const apiDir = path.join(root, 'volt-api');
const webDir = path.join(root, 'volt-web');
const npmCli = process.env.npm_execpath;

if (!npmCli) {
  console.error('Run this launcher through npm: npm run dev:all');
  process.exit(1);
}

function findLanIp() {
  try {
    const interfaces = os.networkInterfaces();
    for (const addresses of Object.values(interfaces)) {
      for (const address of addresses || []) {
        if (address.family !== 'IPv4' || address.internal) continue;
        if (/^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(address.address)) return address.address;
      }
    }
  } catch {
    return '127.0.0.1';
  }
  return '127.0.0.1';
}

function runChecked(args, cwd) {
  const result = spawnSync(process.execPath, [npmCli, ...args], { cwd, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

async function apiIsHealthy(url) {
  try {
    const response = await fetch(`${url}/health`, { signal: AbortSignal.timeout(1500) });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitFor(url, attempts = 40) {
  for (let i = 0; i < attempts; i += 1) {
    if (await apiIsHealthy(url)) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

function start(name, args, cwd, env) {
  const child = spawn(process.execPath, [npmCli, ...args], {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
  child.on('exit', (code) => {
    console.error(`[dev:all] ${name} exited (code ${code})`);
  });
  return child;
}

async function main() {
  const lanIp = process.env.VOLT_LAN_IP || findLanIp();
  const apiUrl = 'http://127.0.0.1:3000';
  const phoneApiUrl = `http://${lanIp}:3000`;
  const webUrl = 'http://localhost:3001';

  const children = [];
  const stop = () => {
    for (const c of children) {
      if (!c.killed) {
        try { c.kill(); } catch { /* already gone */ }
      }
    }
  };
  process.on('SIGINT', () => { stop(); process.exit(0); });
  process.on('SIGTERM', () => { stop(); process.exit(0); });

  // 1. volt-api
  let apiManaged = false;
  if (!(await apiIsHealthy(apiUrl))) {
    console.log('[dev:all] building volt-api…');
    runChecked(['run', 'build'], apiDir);
    console.log('[dev:all] starting volt-api…');
    children.push(start('volt-api', ['start'], apiDir, {}));
    apiManaged = true;
    if (!(await waitFor(apiUrl))) {
      stop();
      throw new Error('volt-api did not become healthy on :3000.');
    }
  } else {
    console.log('[dev:all] reusing healthy volt-api on :3000');
  }

  // 2. volt-web (needs API first so proxies work)
  if (!fs.existsSync(path.join(webDir, 'node_modules'))) {
    console.log('[dev:all] installing volt-web dependencies…');
    runChecked(['install', '--no-audit', '--no-fund'], webDir);
  }
  console.log('[dev:all] starting volt-web…');
  children.push(
    start('volt-web', ['run', 'dev'], webDir, { VOLT_API_URL: apiUrl, NEXT_PUBLIC_API_URL: phoneApiUrl })
  );
  await waitFor(webUrl);

  // 3. Expo
  console.log('[dev:all] starting Expo…');
  const expoCli = require.resolve('expo/bin/cli', { paths: [root] });
  const expo = spawn(process.execPath, [expoCli, 'start', '--lan', '--clear'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, EXPO_PUBLIC_API_URL: phoneApiUrl },
  });
  children.push(expo);

  console.log('');
  console.log('[dev:all] VOLT is up:');
  console.log(`  API URL      : ${apiUrl} (health ok)`);
  console.log(`  Web URL      : ${webUrl}`);
  console.log(`  Expo status  : starting — scan the QR below with Expo Go (same Wi-Fi)`);
  console.log(`  Database mode: ${process.env.DATABASE_URL ? 'postgres (DATABASE_URL set)' : 'in-memory dev store'}`);
  const missing = [];
  if (!process.env.GOOGLE_PLACES_API_KEY) missing.push('GOOGLE_PLACES_API_KEY (places proxy returns 503 without it)');
  if (missing.length > 0) console.log(`  Missing config: ${missing.join(', ')}`);
  console.log('');

  expo.on('exit', (code) => {
    stop();
    process.exit(code || 0);
  });
  if (apiManaged) {
    children[0].on('exit', (code) => {
      console.error(`[dev:all] volt-api exited (code ${code}) — stopping.`);
      stop();
      process.exit(code || 1);
    });
  }
}

main().catch((error) => {
  console.error(`\n[dev:all] Unable to start Volt: ${error.message}`);
  process.exit(1);
});
