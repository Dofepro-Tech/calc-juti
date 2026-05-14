import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repoName = process.env.GITHUB_PAGES_REPO || 'calc-juti';
const basePath = process.env.VITE_BASE_PATH || `/${repoName}/`;
const buildId = process.env.APP_BUILD_ID || new Date().toISOString();
const viteBin = resolve('node_modules', 'vite', 'bin', 'vite.js');
const iconScript = resolve('scripts', 'generate-icons.mjs');

writeFileSync(
  resolve('public', 'app-version.json'),
  `${JSON.stringify({ buildId, generatedAt: buildId }, null, 2)}\n`,
);

const iconResult = spawnSync(process.execPath, [iconScript], {
  stdio: 'inherit',
  env: {
    ...process.env,
  },
});

if (iconResult.status !== 0) {
  process.exit(iconResult.status ?? 1);
}

rmSync('docs', { recursive: true, force: true });

const result = spawnSync(
  process.execPath,
  [viteBin, 'build', '--base', basePath, '--outDir', 'docs'],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      APP_BUILD_ID: buildId,
      VITE_BASE_PATH: basePath,
      VITE_ROUTER_MODE: 'hash',
    },
  },
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

mkdirSync('docs', { recursive: true });
writeFileSync(resolve('docs', '.nojekyll'), '');