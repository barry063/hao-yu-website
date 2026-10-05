/** Verify assets are served identically under the project prefix. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPreviewServer } from './preview.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const server = createPreviewServer();
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
try {
const base = `http://127.0.0.1:${server.address().port}/hao-yu-website/`;
for (const file of ['index.html', 'styles.css', 'script.js', 'assets/Hao_Yu_CV.pdf', 'assets/hao-yu-portrait.jpg', 'assets/og-image.png', 'robots.txt', 'sitemap.xml']) {
  const response = await fetch(base + (file === 'index.html' ? '' : file));
  assert.equal(response.status, 200, `HTTP ${file}`);
  const body = Buffer.from(await response.arrayBuffer());
  assert.ok(body.equals(fs.readFileSync(path.join(root, file))), `Served content differs: ${file}`);
}
for (const file of ['content/site.json', 'AGENTS.md', '../package.json']) {
  const response = await fetch(base + file);
  await response.body?.cancel();
  assert.equal(response.status, 404, `Workspace file exposed: ${file}`);
}
console.log('PASS: eight project-path assets match local bytes; non-visitor files return 404.');
} finally { await new Promise(resolve => server.close(resolve)); }
