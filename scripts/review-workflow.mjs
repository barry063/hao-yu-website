/** Immutable public packages; explicit operator decision kept in private state. */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, loadPublic, VISITOR_FILES } from './public-content.mjs';
import { digest, json, sha, stable, readState, readSources, inputHashes, runtimeInfo, writeJSON } from './workflow-core.mjs';
export const PACKAGES=path.join(ROOT,'tmp/candidates');
export function packageFor(id) {
  if(!/^[a-f0-9]{64}$/.test(id))throw new Error('EXACT_CANDIDATE_REQUIRED');
  const dir=path.join(PACKAGES,id),manifest=json(path.join(dir,'manifest.json'));
  if(fs.realpathSync(dir)!==dir)throw new Error('STALE_PACKAGE_LOCATION');
  if(digest(manifest)!==id)throw new Error('STALE_MANIFEST');
  const data=loadPublic(path.join(dir,'data.json'));
  if(sha(fs.readFileSync(path.join(dir,'data.json')))!==manifest.dataset)throw new Error('STALE_DATASET');
  const files=[];function walk(base,prefix=''){for(const e of fs.readdirSync(base,{withFileTypes:true})){
    if(e.isSymbolicLink())throw new Error('STALE_OUTPUT_LOCATION');const name=prefix+e.name;
    if(e.isDirectory())walk(path.join(base,e.name),name+'/');else files.push(name);}}
  walk(path.join(dir,'visitor'));
  if(stable(files.sort())!==stable([...VISITOR_FILES].sort()))throw new Error('STALE_OUTPUT_SET');
  for(const f of VISITOR_FILES)if(sha(fs.readFileSync(path.join(dir,'visitor',f)))!==manifest.outputs[f])throw new Error('STALE_OUTPUT');
  if(sha(fs.readFileSync(path.join(dir,'review.json')))!==manifest.review)throw new Error('STALE_REVIEW');
  const review=json(path.join(dir,'review.json'));
  if(review.state!=='READY_FOR_REVIEW'||review.checks.some(c=>c.result!=='PASS'))throw new Error('FAILED_REVIEW');
  for(const id of ['HTML_CONTENT_NAVIGATION_HTTP','PUBLIC_PDF','BROWSER_KEYBOARD_ZOOM_MOTION'])if(!review.checks.some(c=>c.id===id))throw new Error('FAILED_REVIEW');
  return {dir,manifest,data,review};
}
export function gate({id,sourceRoot,stateRoot,target,requireApproval=true}) {
  const state=readState(stateRoot,sourceRoot),p=packageFor(id);
  if(target!==p.manifest.target)throw new Error('TARGET_MISMATCH');
  if(stable(readSources(state.source,state.config.sources).fingerprints)!==stable(p.manifest.sources))throw new Error('STALE_SOURCES');
  if(stable(inputHashes())!==stable(p.manifest.inputs))throw new Error('STALE_INPUTS');
  if(stable(runtimeInfo())!==stable(p.manifest.runtime))throw new Error('STALE_RUNTIME');
  if(sha(fs.readFileSync(state.policyFile))!==p.manifest.policy)throw new Error('STALE_POLICY');
  if(sha(fs.readFileSync(path.join(ROOT,'content/site.json')))!==p.manifest.repository_dataset)throw new Error('STALE_REPOSITORY_DATASET');
  if(sha(fs.readFileSync(path.join(state.state,'published.json')))!==p.manifest.published)throw new Error('STALE_PUBLISHED_BASELINE');
  if(requireApproval){const file=path.join(state.state,'approvals',id+'.json');if(!fs.existsSync(file))throw new Error('APPROVAL_REQUIRED');const a=json(file);
    if(a.decision!=='APPROVE'||a.candidate!==id||a.target!==target||!a.actor||!a.statement||!a.time)throw new Error('APPROVAL_REQUIRED');}
  return {...p,state};
}
export function approve(options) {
  if(options.decision!=='APPROVE'||!options.actor||!options.statement)throw new Error('EXPLICIT_USER_DECISION_REQUIRED');
  const p=gate({...options,requireApproval:false}),file=path.join(p.state.state,'approvals',options.id+'.json');
  if(fs.existsSync(file)){const old=json(file);if(old.decision==='APPROVE'&&old.candidate===options.id&&old.target===options.target)return old;
    throw new Error('APPROVAL_CONFLICT');}
  const record={decision:'APPROVE',candidate:options.id,target:options.target,actor:options.actor,statement:options.statement,time:new Date().toISOString()};
  writeJSON(file,record);return record;
}
