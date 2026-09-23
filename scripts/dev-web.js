// `npm run dev:web` — API (+ health check) then volt-web only. Windows-safe.
const { spawn, spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const root = path.resolve(__dirname, '..');
const apiDir = path.join(root, 'volt-api');
const webDir = path.join(root, 'volt-web');
const npmCli = process.env.npm_execpath;
if (!npmCli) {
  console.error('Run this launcher through npm: npm run dev:web');
  process.exit(1);
}

async function healthy(url) {
  try {
    const r = await fetch(`${url}/health`, { signal: AbortSignal.timeout(1500) });
    return r.ok;
  } catch {
    return false;
  }
}
async function waitFor(url, n = 40) {
  for (let i = 0; i < n; i += 1) {
    if (await healthy(url)) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function main() {
  const apiUrl = 'http://127.0.0.1:3000';
  const children = [];
  const stop = () => children.forEach((c) => { if (!c.killed) try { c.kill(); } catch {} });
  process.on('SIGINT', () => { stop(); process.exit(0); });

  if (!(await healthy(apiUrl))) {
    console.log('[dev:web] building volt-api…');
    const b = spawnSync(process.execPath, [npmCli, 'run', 'build'], { cwd: apiDir, stdio: 'inherit' });
    if (b.status !== 0) process.exit(b.status || 1);
    console.log('[dev:web] starting volt-api…');
    const api = spawn(process.execPath, [npmCli, 'start'], { cwd: apiDir, stdio: 'inherit' });
    children.push(api);
    if (!(await waitFor(apiUrl))) {
      stop();
      throw new Error('volt-api did not become healthy on :3000.');
    }
  } else {
    console.log('[dev:web] reusing healthy volt-api on :3000');
  }

  if (!fs.existsSync(path.join(webDir, 'node_modules'))) {
    console.log('[dev:web] installing volt-web dependencies…');
    const r = spawnSync(process.execPath, [npmCli, 'install', '--no-audit', '--no-fund'], { cwd: webDir, stdio: 'inherit' });
    if (r.status !== 0) process.exit(r.status || 1);
  }
  console.log(`[dev:web] API: ${apiUrl} (health ok)`);
  console.log('[dev:web] Web: http://localhost:3001');
  console.log(`[dev:web] Database mode: ${process.env.DATABASE_URL ? 'postgres' : 'in-memory dev store'}`);
  const web = spawn(process.execPath, [npmCli, 'run', 'dev'], { cwd: webDir, stdio: 'inherit' });
  children.push(web);
  web.on('exit', (c) => process.exit(c || 0));
}

main().catch((e) => {
  console.error(`[dev:web] ERROR: ${e.message}`);
  process.exit(1);
});
