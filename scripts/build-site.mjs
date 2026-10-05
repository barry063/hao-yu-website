/** Public-only preparation; never replaces live files or performs remote writes. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { ROOT, loadPublic, normalise, formatDate, escapeHTML, VISITOR_FILES } from './public-content.mjs';
import { renderSite } from './render-site.mjs';

export const hash = value => crypto.createHash('sha256').update(value).digest('hex');
export function outputDirectory(target) {
  const out = path.resolve(target), allowed = path.join(ROOT, 'tmp', 'candidates');
  const relative = path.relative(allowed,out);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Output must be a child of tmp/candidates');
  let ancestor = out;
  while (ancestor !== ROOT) {
    if (fs.existsSync(ancestor) && fs.lstatSync(ancestor).isSymbolicLink()) throw new Error('Symlink output refused');
    ancestor = path.dirname(ancestor);
  }
  if (fs.existsSync(out) && fs.readdirSync(out).length) throw new Error('Output must be empty; select a new candidate directory');
  return out;
}
function python(executable, args) {
  const result = spawnSync(executable,args,{encoding:'utf8',env:{...process.env,PYTHONHASHSEED:'0'}});
  if (result.error || result.status !== 0) throw new Error('PDF/image tool failed; check pinned local dependencies');
}
export function buildSite({ out, input = path.join(ROOT,'content/site.json'), pythonExecutable = process.env.SITE_PYTHON || 'python' }) {
  out = outputDirectory(out);
  const data = loadPublic(input), n = normalise(data), html = renderSite(data);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  if (ids.length !== new Set(ids).size || /\{\{|\}\}/.test(html)) throw new Error('Invalid generated HTML');
  for (const [,id] of html.matchAll(/href="#([^"]*)"/g)) if (!ids.includes(id)) throw new Error('Missing fragment target');
  const inputs = {dataset:hash(fs.readFileSync(input)),template:hash(fs.readFileSync(path.join(ROOT,'templates/index.html')))};
  const social = Object.fromEntries(['name','role','institution','topic','status'].map(k => [k,n.social[k]]));
  const baseline = JSON.parse(fs.readFileSync(path.join(ROOT,'build-resources/social-baseline.json')));
  const reuseCard = JSON.stringify(social) === JSON.stringify(baseline.fields);
  if (reuseCard && hash(fs.readFileSync(path.join(ROOT,'assets/og-image.png'))) !== baseline.sha256) throw new Error('Baseline social card changed');
  fs.mkdirSync(path.join(out,'assets'),{recursive:true});
  const work = fs.mkdtempSync(path.join(os.tmpdir(),'hao-public-build-'));
  try {
    const normalised = path.join(work,'public.json');
    fs.writeFileSync(normalised,JSON.stringify({...n,release_label:formatDate(data.release_date)}));
    fs.writeFileSync(path.join(out,'index.html'),html);
    fs.writeFileSync(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escapeHTML(n.site.url)}</loc><lastmod>${data.release_date}</lastmod></url></urlset>\n`);
    fs.writeFileSync(path.join(out,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${n.site.url}sitemap.xml\n`);
    for (const file of ['.nojekyll','styles.css','script.js','favicon.svg','assets/hao-yu-portrait.jpg']) fs.copyFileSync(path.join(ROOT,file),path.join(out,file));
    python(pythonExecutable,[path.join(ROOT,'scripts/build_public_cv.py'),'--data',normalised,'--output',path.join(out,n.site.cv)]);
    if (reuseCard) fs.copyFileSync(path.join(ROOT,'assets/og-image.png'),path.join(out,'assets/og-image.png'));
    else python(pythonExecutable,[path.join(ROOT,'scripts/build_social_card.py'),'--data',normalised,'--output',path.join(out,'assets/og-image.png')]);
    if (inputs.dataset !== hash(fs.readFileSync(input)) || inputs.template !== hash(fs.readFileSync(path.join(ROOT,'templates/index.html')))) throw new Error('Build inputs changed during preparation');
    const hashes = Object.fromEntries(VISITOR_FILES.map(f => [f,hash(fs.readFileSync(path.join(out,f)))]));
    return {inputs,hashes,social_card:reuseCard ? 'REUSED' : 'GENERATED',release_date:data.release_date};
  } catch (error) {
    // A failed partial output cannot masquerade as a completed candidate. No approval exists at P02.
    fs.writeFileSync(path.join(out,'BUILD_FAILED.txt'),'FAILED: not a reviewable candidate\n');
    throw error;
  } finally {
    if (path.dirname(work) !== path.resolve(os.tmpdir())) throw new Error('Invalid build cleanup directory');
    fs.rmSync(work,{recursive:true,force:true});
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2), options = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = {'--out':'out','--data':'input','--python':'pythonExecutable'}[args[i]];
    if (!key || !args[i + 1]) throw new Error('Usage: build-site.mjs --out tmp/candidates/<name> [--data public.json] [--python executable]');
    options[key] = args[i + 1];
  }
  try { console.log(JSON.stringify(buildSite(options),null,2)); }
  catch { console.error('Build refused or failed. No root visitor file changed.'); process.exitCode = 1; }
}
