/** Validate evidence metadata, fragments, assets and static content consistency. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPublic, normalise } from './public-content.mjs';
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = process.argv[2] ? path.resolve(process.argv[2]) : repo;
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const html = read('index.html');
const data = normalise(loadPublic(process.argv[3] ? path.resolve(process.argv[3]) : path.join(repo,'content/site.json')));
const decode = text => text.replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&#39;', "'");
const visitorText = decode(html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<\/?(?:strong|em|span|time)(?:\s[^>]*)?>/g, '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
const ids = [...html.matchAll(/\bid="([^"<>]+)"/g)].map(m => m[1]);
assert.equal(ids.length, new Set(ids).size, 'Duplicate HTML IDs');
for (const [, id] of html.matchAll(/href="#([^"<>]*)"/g)) {
  assert.ok(id && ids.includes(id), `Missing fragment target: ${id}`);
}
const local = [...html.matchAll(/(?:href|src)="([^"<>]+)"/g)].map(m => decode(m[1])).filter(x => !/^(?:https?:|mailto:|#)/.test(x));
for (const file of local) assert.ok(fs.existsSync(path.join(root, file)), `Missing asset ${file}`);
assert.ok(!/(?:TODO|\[VERIFY\]|mirainthehub|Advance Article|top 5%|Chartered Engineer|CB2 9GR|tel:)/i.test(html), 'Stale or unapproved visitor content');
assert.ok(!html.includes('nn-2026-'), 'Private submission reference exposed');
const jsonld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
assert.equal(jsonld.url, data.site.url);
assert.equal(jsonld.jobTitle, data.site.role);
assert.ok(html.includes(`rel="canonical" href="${data.site.url}"`));
for (const meta of ['og:url', 'og:image', 'twitter:image']) {
  assert.ok(html.includes(`"${meta}" content="${data.site.url}${meta.endsWith('image') ? 'assets/og-image.png' : ''}"`), `${meta} mismatch`);
}
assert.ok(read('sitemap.xml').includes(`<loc>${data.site.url}</loc>`));
assert.ok(read('robots.txt').includes(`${data.site.url}sitemap.xml`));
assert.ok(fs.readFileSync(path.join(repo,'README.md'),'utf8').includes(data.site.url), 'README URL mismatch');
assert.equal(new Set(data.records.map(x => x.id)).size, data.records.length, 'Duplicate evidence IDs');
for (const record of data.records) {
  assert.ok(['VERIFIED', 'APPLICANT_CONFIRMED'].includes(record.evidence_status), `Uncleared record ${record.id}`);
  assert.equal(record.visibility, 'PUBLIC');
  assert.ok(record.source && /^\d{4}-\d{2}-\d{2}$/.test(record.reviewed), `Missing provenance ${record.id}`);
  assert.ok(html.includes(`data-record="${record.id}"`), `Record not rendered: ${record.id}`);
  if (record.id !== 'STATUS') {
    for (const text of record.text) assert.ok(visitorText.includes(text), `Rendered claim differs from inventory: ${record.id}`);
  }
  for (const link of record.links) assert.ok(new URL(link.url).protocol === 'https:', `Unsafe URL ${record.id}`);
}
for (const status of new Set(data.outputs.map(o => o.status))) {
  const group = data.outputs.filter(o => o.status === status);
  assert.ok(group.every(o => html.includes('data-record="' + o.id + '"')), 'Missing output group record');
}
const png = fs.readFileSync(path.join(root, 'assets/og-image.png'));
assert.equal(png.readUInt32BE(16), 1200); assert.equal(png.readUInt32BE(20), 630);
assert.ok(fs.statSync(path.join(root, data.site.portrait)).size <= 250000, 'Portrait too large');
const pdf = fs.readFileSync(path.join(root, data.site.cv));
assert.equal(pdf.subarray(0,5).toString(), '%PDF-');
console.log(`PASS: ${data.records.length} public records; ${ids.length} anchors; assets, metadata, output groups and source references.`);
