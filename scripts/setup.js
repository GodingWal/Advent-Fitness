const { spawnSync } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function run(args, cwd) {
  const result = spawnSync(npm, args, { cwd, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

console.log('Installing the locked Volt mobile dependencies...');
run(['ci'], root);

console.log('Installing the locked Volt API dependencies...');
run(['ci'], path.join(root, 'volt-api'));

console.log('\nSetup complete. Run: npm run dev:local');
