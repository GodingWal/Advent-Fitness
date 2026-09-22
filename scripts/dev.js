// One-command local startup: `npm run dev` (from repo root).
// - Warns if :3000 is occupied by something other than volt-api
// - Installs + starts volt-api, waits for /health
// - Detects the LAN IP automatically, passes it to Expo as EXPO_PUBLIC_API_URL
// - Leaves Expo's own QR output streaming (scan with Expo Go, same Wi-Fi)
const { spawn } = require('child_process');
const net = require('net');
const os = require('os');
const path = require('path');
const fs = require('fs');

const ROOT = __dirname.includes('scripts') ? path.join(__dirname, '..') : __dirname;
const API_DIR = path.join(ROOT, 'volt-api');
const PORT = Number(process.env.PORT || 3000);

function lanIp() {
  const ifs = os.networkInterfaces();
  for (const addrs of Object.values(ifs)) {
    for (const a of addrs || []) {
      if (a.family === 'IPv4' && !a.internal) return a.address;
    }
  }
  return '127.0.0.1';
}

function portOpen(port) {
  return new Promise((resolve) => {
    const s = net.connect(port, '127.0.0.1');
    s.once('connect', () => {
      s.end();
      resolve(true);
    });
    s.once('error', () => resolve(false));
  });
}

async function healthOk(port) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/health`);
    if (!res.ok) return false;
    const body = await res.json();
    return body && body.ok === true;
  } catch {
    return false;
  }
}

function ensureApiDeps() {
  if (!fs.existsSync(path.join(API_DIR, 'node_modules'))) {
    console.log('[dev] installing volt-api dependencies…');
    const r = spawn('npm', ['install', '--no-audit', '--no-fund'], {
      cwd: API_DIR,
      stdio: 'inherit',
      shell: true,
    });
    return new Promise((resolve, reject) => {
      r.on('exit', (code) => (code === 0 ? resolve() : reject(new Error('volt-api npm install failed'))));
    });
  }
  return Promise.resolve();
}

async function waitForHealth(port, tries = 40) {
  for (let i = 0; i < tries; i++) {
    if (await healthOk(port)) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function main() {
  if (await portOpen(PORT)) {
    if (await healthOk(PORT)) {
      console.log(`[dev] reusing healthy volt-api on :${PORT}`);
    } else {
      console.error(
        `[dev] ERROR: port ${PORT} is occupied by something that is not volt-api.\n` +
          `      Stop it and run npm run dev again.`
      );
      process.exit(1);
    }
  } else {
    await ensureApiDeps();
    console.log('[dev] starting volt-api…');
    const api = spawn('npm', ['start'], { cwd: API_DIR, stdio: 'inherit', shell: true });
    api.on('exit', (code) => {
      console.error(`[dev] volt-api exited (code ${code}) — stopping.`);
      process.exit(code ?? 1);
    });
    process.on('SIGINT', () => api.kill('SIGINT'));
    const ok = await waitForHealth(PORT);
    if (!ok) {
      console.error('[dev] ERROR: volt-api did not become healthy. See logs above.');
      api.kill();
      process.exit(1);
    }
  }

  const ip = lanIp();
  const apiUrl = `http://${ip}:${PORT}`;
  console.log(`[dev] API: ${apiUrl} (health ok)`);
  console.log('[dev] starting Expo — scan the QR below with Expo Go (same Wi-Fi).');
  const expo = spawn('npx', ['expo', 'start'], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, EXPO_PUBLIC_API_URL: apiUrl },
  });
  process.on('SIGINT', () => expo.kill('SIGINT'));
  expo.on('exit', (code) => process.exit(code ?? 0));
}

main().catch((e) => {
  console.error('[dev] ERROR:', e.message);
  process.exit(1);
});
