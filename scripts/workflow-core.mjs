/** Local-only workflow primitives. Private state must remain outside public/source roots. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { ROOT, loadPublic, validatePublic } from './public-content.mjs';
import { readJSON, saveJSON } from './durable-json.mjs';

export const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
export function stable(value) {
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stable(value[k])).join(',') + '}';
  return JSON.stringify(value);
}
export const digest = value => sha(stable(value));
export function runtimeInfo(){const r=spawnSync(process.env.SITE_PYTHON||'python',['-c','import sys,reportlab,PIL,json;print(json.dumps({"python":sys.version.split()[0],"reportlab":reportlab.Version,"pillow":PIL.__version__}))'],{encoding:'utf8'});
  if(r.status!==0)throw new Error('RUNTIME_MANIFEST');return {node:process.version,...JSON.parse(r.stdout)};}
export const json = readJSON;
export const writeJSON = saveJSON;
// Bind both the committed private record and its readable mirror. A torn/stale
// mirror cannot conceal a newer calibration or published-baseline change.
export const privateRecordHash = file => digest({record:json(file),mirror:fs.existsSync(file)?sha(fs.readFileSync(file)):null});
export function inside(parent,child) {
  const rel=path.relative(path.resolve(parent),path.resolve(child));
  return !rel.startsWith('..') && !path.isAbsolute(rel);
}
export function resolved(file) {
  if(fs.existsSync(file))return fs.realpathSync(file);
  return path.join(resolved(path.dirname(path.resolve(file))),path.basename(file));
}
export function privateState(stateRoot,sourceRoot) {
  const state=resolved(path.resolve(stateRoot)),source=resolved(path.resolve(sourceRoot));
  if(inside(ROOT,state)||inside(state,ROOT)||inside(source,state)||inside(state,source)||inside(ROOT,source))
    throw new Error('PRIVATE_LOCATION');
  return {state,source};
}
export function readSources(sourceRoot,declared) {
  const source=fs.realpathSync(sourceRoot),texts={},fingerprints=[];
  for(const s of declared) {
    const file=path.join(source,s.path),real=fs.realpathSync(file);
    if(!inside(source,real)||!fs.statSync(real).isFile())throw new Error('SOURCE_LOCATION');
    const bytes=fs.readFileSync(real);
    texts[s.id]=bytes.toString('utf8');fingerprints.push({id:s.id,path:s.path,sha256:sha(bytes)});
  }
  return {texts,fingerprints};
}
export function unchanged(a,b) { return stable(a)===stable(b); }
export function semantic(data) {
  const value=structuredClone(data);delete value.release_date;delete value.sources;
  function walk(x){if(!x||typeof x!=='object')return;if(x.provenance)delete x.provenance.reviewed;
    Object.values(x).forEach(walk);}
  walk(value);return value;
}
export function publicChanges(before,after) {
  const a=semantic(before),b=semantic(after),changes=[];
  function compare(x,y,locator) {
    if(stable(x)===stable(y))return;
    if(Array.isArray(x)&&Array.isArray(y)&&[...x,...y].every(v=>v&&typeof v==='object'&&v.id)) {
      const ids=new Set([...x,...y].map(v=>v.id));for(const id of ids)compare(x.find(v=>v.id===id),y.find(v=>v.id===id),locator+'/'+id);
    } else if(x&&y&&typeof x==='object'&&typeof y==='object'&&!Array.isArray(x)&&!Array.isArray(y)) {
      for(const k of new Set([...Object.keys(x),...Object.keys(y)]))compare(x[k],y[k],locator+'/'+k);
    } else changes.push({field:locator,before:x??null,after:y??null});
  }
  compare(a,b,'');
  return changes;
}
export function readState(stateRoot,sourceRoot) {
  const roots=privateState(stateRoot,sourceRoot),state=json(path.join(roots.state,'state.json'));
  if(state.version!==1||state.source_root!==roots.source)throw new Error('STATE_SOURCE');
  const policyFile=path.join(roots.state,state.policy_file||'reviewed.json'),baselineRoot=path.join(roots.state,state.baseline_dir||'baseline'),publishedFile=path.join(roots.state,'published.json');
  if(!inside(roots.state,resolved(policyFile))||!inside(roots.state,resolved(baselineRoot)))throw new Error('STATE_LOCATION');
  return {...roots,policyFile,publishedFile,policy:validatePublic(json(policyFile)),published:validatePublic(json(publishedFile)),
    baseline:readSources(baselineRoot,state.sources),config:state};
}
export function issue(stateRoot,code,details={}) {
  writeJSON(path.join(stateRoot,'reconciliation.json'),{state:'NEEDS_RECONCILIATION',code,...details,
    instruction:'Reconcile the named canonical records against authoritative evidence, review public wording and refresh the private calibration from an explicitly reviewed public dataset. Do not edit generated files.'});
  return {state:'NEEDS_RECONCILIATION',code};
}
export const INPUT_FILES = Object.freeze(['scripts/workflow-core.mjs','scripts/canonical-adapters.mjs','scripts/review-workflow.mjs',
  'scripts/workflow-lock.mjs',
  'scripts/durable-json.mjs',
  'scripts/prepare-update.mjs','scripts/release-workflow.mjs','scripts/workflow-cli.mjs','scripts/browser-qa.mjs',
  'scripts/build-site.mjs','scripts/render-site.mjs','scripts/public-content.mjs','scripts/build_public_cv.py','scripts/build_social_card.py',
  'scripts/check-candidate.mjs','scripts/check-site.mjs','scripts/check-preview.mjs','scripts/navigation.test.mjs','scripts/check_public_cv.py',
  'scripts/preview.mjs','templates/index.html','schemas/public-content.schema.json','.htmlvalidate.json','requirements-build.txt',
  'package.json','package-lock.json','build-resources/fonts/Vera.ttf','build-resources/fonts/VeraBd.ttf','build-resources/fonts/hashes.json',
  'build-resources/social-baseline.json','.nojekyll','styles.css','script.js','favicon.svg','assets/hao-yu-portrait.jpg','assets/og-image.png']);
export function inputHashes() {return Object.fromEntries(INPUT_FILES.map(f=>[f,sha(fs.readFileSync(path.join(ROOT,f)))]));}
export function removeOwnedDirectory(parent,dir) {
  if(!inside(parent,dir)||path.resolve(parent)===path.resolve(dir)||!inside(parent,resolved(dir)))throw new Error('CLEANUP_LOCATION');
  fs.rmSync(dir,{recursive:true,force:true});
}
