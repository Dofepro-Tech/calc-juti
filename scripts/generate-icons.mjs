import sharp from 'sharp';
import { resolve } from 'node:path';

const sourceIcon = resolve('public', 'brand-icon.svg');

const targets = [
  { file: resolve('public', 'pwa-512x512.png'), size: 512 },
  { file: resolve('public', 'pwa-maskable-512x512.png'), size: 512 },
  { file: resolve('public', 'pwa-192x192.png'), size: 192 },
  { file: resolve('public', 'apple-touch-icon.png'), size: 180 },
];

for (const target of targets) {
  await sharp(sourceIcon)
    .resize(target.size, target.size)
    .png({ compressionLevel: 9, quality: 90 })
    .toFile(target.file);
}