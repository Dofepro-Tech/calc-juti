import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repoName = process.env.GITHUB_PAGES_REPO || 'calc-juti';
const basePath = process.env.VITE_BASE_PATH || `/${repoName}/`;
const viteBin = resolve('node_modules', 'vite', 'bin', 'vite.js');

rmSync('docs', { recursive: true, force: true });

const result = spawnSync(
  process.execPath,
  [viteBin, 'build', '--base', basePath, '--outDir', 'docs'],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
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