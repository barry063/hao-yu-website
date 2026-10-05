/** Serve only public website files, including under the GitHub Pages project path. */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { VISITOR_FILES } from './public-content.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = new Set(VISITOR_FILES);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.pdf': 'application/pdf', '.xml': 'application/xml', '.txt': 'text/plain' };
export function createPreviewServer(candidateRoot = root) { return http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    let name = decodeURIComponent(url.pathname).replace(/^\/hao-yu-website(?=\/|$)/, '').replace(/^\//, '');
    if (!name) name = 'index.html';
    if (!files.has(name) || !['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(404); res.end('Not found'); return;
    }
    const body = await fs.readFile(path.join(candidateRoot, name));
    res.writeHead(200, { 'Content-Type': types[path.extname(name)] || 'application/octet-stream', 'Content-Length': body.length, 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(404); res.end('Not found'); }
}); }
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const port = Number(process.argv[2] || 8080);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid preview port');
  createPreviewServer(process.argv[3] ? path.resolve(process.argv[3]) : root).listen(port, '127.0.0.1', () => console.log(`Preview: http://localhost:${port}/hao-yu-website/`));
}
