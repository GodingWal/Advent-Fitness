const { spawn, spawnSync } = require('node:child_process');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const apiDir = path.join(root, 'volt-api');
const npmCli = process.env.npm_execpath;
const useTunnel = process.argv.includes('--tunnel');

if (!npmCli) {
  console.error('Run this launcher through npm: npm run dev:local');
  process.exit(1);
}

function findLanIp() {
  const candidates = [];
  let interfaces = {};
  try {
    interfaces = os.networkInterfaces();
  } catch {
    return '127.0.0.1';
  }
  for (const addresses of Object.values(interfaces)) {
    for (const address of addresses || []) {
      if (address.family !== 'IPv4' || address.internal) continue;
      if (/^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(address.address)) {
        candidates.push(address.address);
      }
    }
  }
  return candidates[0] || '127.0.0.1';
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

async function waitForApi(url, attempts = 20) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (await apiIsHealthy(url)) return true;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
}

async function main() {
  const lanIp = process.env.VOLT_LAN_IP || findLanIp();
  const localApiUrl = 'http://127.0.0.1:3000';
  const phoneApiUrl = `http://${lanIp}:3000`;
  let apiProcess = null;

  if (!(await apiIsHealthy(localApiUrl))) {
    console.log('Building and starting Volt API...');
    runChecked(['run', 'build'], apiDir);
    apiProcess = spawn(process.execPath, [npmCli, 'start'], { cwd: apiDir, stdio: 'inherit' });
    if (!(await waitForApi(localApiUrl))) {
      apiProcess.kill();
      throw new Error('Volt API did not become healthy on port 3000.');
    }
  } else {
    console.log('Using the Volt API already running on port 3000.');
  }

  console.log(`Phone API: ${phoneApiUrl}`);
  console.log('Starting Expo. Scan the QR code with Expo Go.');

  const expoCli = require.resolve('expo/bin/cli', { paths: [root] });
  const expoArgs = [expoCli, 'start', useTunnel ? '--tunnel' : '--lan', '--clear'];
  const expo = spawn(process.execPath, expoArgs, {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, EXPO_PUBLIC_API_URL: phoneApiUrl },
  });

  const stop = () => {
    if (apiProcess && !apiProcess.killed) apiProcess.kill();
    if (!expo.killed) expo.kill();
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
  expo.on('exit', (code) => {
    if (apiProcess && !apiProcess.killed) apiProcess.kill();
    process.exit(code || 0);
  });
}

main().catch((error) => {
  console.error(`\nUnable to start Volt: ${error.message}`);
  console.error('Run "npm run setup" once, then try again.');
  process.exit(1);
});
