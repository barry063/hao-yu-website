/** Read-only link check. Bot blocking is inconclusive, never an invented PASS. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const urls = [...new Set([...html.matchAll(/href="(https:\/\/[^"<>]+)"/g)].map(m => m[1].replaceAll('&amp;', '&')))]
  .filter(url => !url.startsWith('https://fonts.'));
const results = await Promise.all(urls.map(async url => {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'HaoYuWebsiteLinkCheck/1.0' } });
    await response.body?.cancel();
    return { url, status: response.status, destination: response.url,
      result: response.ok ? 'PASS' : [401,403,429,503,999].includes(response.status) ? 'INCONCLUSIVE' : 'FAIL' };
  } catch(error) { return { url, result: 'INCONCLUSIVE', error: error.message }; }
}));
console.log(JSON.stringify(results, null, 2));
if (results.some(item => item.result === 'FAIL')) process.exitCode = 1;
