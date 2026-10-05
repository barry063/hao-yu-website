/** Verify the actual public GitHub Pages output against the local release bytes. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = 'https://barry063.github.io/hao-yu-website/';
const files = ['index.html', 'styles.css', 'script.js', 'favicon.svg', 'robots.txt', 'sitemap.xml',
  'assets/Hao_Yu_CV.pdf', 'assets/hao-yu-portrait.jpg', 'assets/og-image.png'];
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const results = await Promise.all(files.map(async file => {
  const url = new URL(file === 'index.html' ? '' : file, base);
  url.searchParams.set('release-check', '2026-10-05-static-refresh');
  const response = await fetch(url, { signal: AbortSignal.timeout(20000), cache: 'no-store' });
  assert.equal(response.status, 200, `${file}: HTTP status`);
  const remote = Buffer.from(await response.arrayBuffer());
  const local = fs.readFileSync(path.join(root, file));
  // Git's Windows line-ending conversion is harmless for text but not binary assets.
  const textFile = /\.(html|css|js|svg|txt|xml)$/.test(file);
  const normalise = bytes => textFile ? bytes.toString('utf8').replaceAll('\r\n', '\n') : bytes;
  assert.deepEqual(normalise(remote), normalise(local), `${file}: live release differs`);
  return { file, status: response.status, sha256: sha(remote), bytes: remote.length,
    match: textFile ? 'normalised-text-identical' : 'byte-identical' };
}));
console.log(JSON.stringify({ checked_at: new Date().toISOString(), base, results }, null, 2));
