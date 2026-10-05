/** Verify assets are served identically under the project prefix. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPreviewServer } from './preview.mjs';
import { VISITOR_FILES } from './public-content.mjs';
const root = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const server = createPreviewServer(root);
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
try {
const base = `http://127.0.0.1:${server.address().port}/hao-yu-website/`;
for (const file of VISITOR_FILES) {
  const response = await fetch(base + (file === 'index.html' ? '' : file));
  assert.equal(response.status, 200, `HTTP ${file}`);
  const body = Buffer.from(await response.arrayBuffer());
  assert.ok(body.equals(fs.readFileSync(path.join(root, file))), `Served content differs: ${file}`);
}
for (const file of ['content/site.json', 'AGENTS.md', '../package.json', 'scripts/build-site.mjs', 'docs/CONTENT_SOURCE_MAP.md', 'BUILD_FAILED.txt']) {
  const response = await fetch(base + file);
  await response.body?.cancel();
  assert.equal(response.status, 404, `Workspace file exposed: ${file}`);
}
console.log('PASS: ten project-path visitor files match local bytes; non-visitor files return 404.');
} finally { await new Promise(resolve => server.close(resolve)); }
