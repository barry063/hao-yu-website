/** Validate every declared locale against its reviewed public content. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPublic, normalise } from './public-content.mjs';
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = process.argv[2] ? path.resolve(process.argv[2]) : repo;
const input=loadPublic(process.argv[3] ? path.resolve(process.argv[3]) : path.join(repo,'content/site.json'));
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const decode = text => text.replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&#39;', "'");
const collapse=text=>text.replace(/\s+/g,' ').trim();
for(const locale of input.localisation?['en','zh']:['en']) {
  const page=locale==='zh'?'zh/index.html':'index.html', html=read(page),data=normalise(input,locale);
  const visitorText = collapse(decode(html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<\/?(?:strong|em|span|time)(?:\s[^>]*)?>/g, '').replace(/<[^>]+>/g, ' ')));
  const ids = [...html.matchAll(/\bid="([^"<>]+)"/g)].map(m => m[1]);
  assert.equal(ids.length, new Set(ids).size, 'Duplicate HTML IDs');
  for (const [, id] of html.matchAll(/href="#([^"<>]*)"/g)) assert.ok(id && ids.includes(id), `Missing fragment target: ${id}`);
  const local = [...html.matchAll(/(?:href|src)="([^"<>]+)"/g)].map(m => decode(m[1])).filter(x => !/^(?:https?:|mailto:|#)/.test(x));
  for (const url of local) {
    const file=url.split(/[?#]/)[0], absolute=path.resolve(root,path.dirname(page),file);
    const rel=path.relative(root,absolute);
    assert.ok(!rel.startsWith('..')&&!path.isAbsolute(rel),'Local link escapes candidate');
    assert.ok(fs.existsSync(absolute), `Missing local destination: ${url}`);
    if(fs.statSync(absolute).isDirectory()) assert.ok(fs.existsSync(path.join(absolute,'index.html')),'Directory has no index');
  }
  assert.ok(!/(?:TODO|\[VERIFY\]|mirainthehub|Advance Article|top 5%|Chartered Engineer|CB2 9GR|tel:)/i.test(html), 'Stale or unapproved visitor content');
  assert.ok(!/\b(?:MQT-\d+|nn-\d{4}-[a-z0-9-]+)/i.test(html), 'Private submission reference exposed');
  const jsonld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(jsonld.url, data.site.url);
  assert.ok(['Person','ProfilePage'].includes(jsonld['@type']));
  const person = jsonld['@type'] === 'ProfilePage' ? jsonld.mainEntity : jsonld;
  if (jsonld['@type'] === 'ProfilePage') {
    assert.equal(jsonld['@id'], data.site.url + '#profile-page');
    assert.equal(jsonld.name, data.site.title);
    assert.equal(person['@id'], input.presentation.url + '#person');
  }
  assert.equal(person['@type'], 'Person');
  assert.equal(person.url, input.presentation.url);
  assert.equal(person.name, data.site.name);
  assert.equal(person.jobTitle, data.site.role);
  assert.equal(person.affiliation.name, data.site.institution);
  assert.deepEqual(person.sameAs, data.profiles.filter(l => l.id !== 'EMAIL').map(l => l.url));
  assert.equal(decode(html.match(/<title>(.*?)<\/title>/)[1]), data.site.title);
  for (const key of ['og:title','twitter:title']) {
    const value = html.match(new RegExp(`(?:property|name)="${key}" content="([^"]*)"`));
    assert.ok(value, `Missing ${key}`);assert.equal(decode(value[1]), data.site.title);
  }
  assert.ok(html.includes(`rel="canonical" href="${data.site.url}"`));
  for (const meta of ['og:url', 'og:image', 'twitter:image']) {
    const expected=meta.endsWith('image')?new URL(data.site.image||'assets/og-image.png',input.presentation.url).href:data.site.url;
    assert.ok(html.includes(`"${meta}" content="${expected}"`), `${meta} mismatch`);
  }
  assert.ok(read('sitemap.xml').includes(`<loc>${data.site.url}</loc>`));
  assert.ok(read('robots.txt').includes(`${input.presentation.url}sitemap.xml`));
  assert.ok(fs.readFileSync(path.join(repo,'README.md'),'utf8').includes(input.presentation.url), 'README URL mismatch');
  assert.equal(new Set(data.records.map(x => x.id)).size, data.records.length, 'Duplicate evidence IDs');
  for (const record of data.records) {
    assert.ok(['VERIFIED', 'APPLICANT_CONFIRMED'].includes(record.evidence_status), `Uncleared record ${record.id}`);
    assert.equal(record.visibility, 'PUBLIC');
    assert.ok(record.source && /^\d{4}-\d{2}-\d{2}$/.test(record.reviewed), `Missing provenance ${record.id}`);
    assert.ok(html.includes(`data-record="${record.id}"`), `Record not rendered: ${record.id}`);
    if (record.id !== 'STATUS') for (const text of record.text) assert.ok(visitorText.includes(collapse(text)), `Rendered claim differs from inventory: ${record.id}`);
    for (const link of record.links) assert.ok(new URL(link.url).protocol === 'https:', `Unsafe URL ${record.id}`);
  }
  for (const output of data.outputs) assert.ok(html.includes('data-record="'+output.id+'"'),'Missing output group record');
  const png = fs.readFileSync(path.join(root,data.site.image||'assets/og-image.png'));
  assert.equal(png.readUInt32BE(16), 1200);assert.equal(png.readUInt32BE(20), 630);
  assert.ok(fs.statSync(path.join(root,data.site.portrait)).size<=250000,'Portrait too large');
  assert.equal(fs.readFileSync(path.join(root,data.site.cv)).subarray(0,5).toString(),'%PDF-');
  const expectedPDF=new URL(data.site.cv,input.presentation.url);
  const pdfLinks=[...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map(m=>new URL(decode(m[1]),data.site.url))
    .filter(url=>/\.pdf$/i.test(decodeURIComponent(url.pathname)));
  assert.ok(pdfLinks.length>0,'CV download missing');
  assert.ok(pdfLinks.every(url=>url.origin===expectedPDF.origin&&decodeURIComponent(url.pathname)===expectedPDF.pathname),'Wrong-language CV link');
  if(input.localisation) {
    assert.ok(html.includes(`lang="${locale==='zh'?'zh-Hans':'en-GB'}"`),'Incorrect page language');
    const alternates=[...html.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/g)].map(m=>[m[1],decode(m[2])]);
    assert.deepEqual(Object.fromEntries(alternates),{en:input.presentation.url,'zh-Hans':input.presentation.url+'zh/','x-default':input.presentation.url});
  }
  console.log(`PASS ${locale}: ${data.records.length} public records; ${ids.length} anchors; correct PDF, assets, metadata, output groups and source references.`);
}
