/** Explicit read-only source preparation. Rejected text stays outside both repositories. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { ROOT, loadPublic, validatePublic, VISITOR_FILES } from './public-content.mjs';
import { privateState, readSources, readState, unchanged, writeJSON, publicChanges, sha, digest, inputHashes, runtimeInfo, issue, removeOwnedDirectory } from './workflow-core.mjs';
import { derivePublic } from './canonical-adapters.mjs';
import { buildSite } from './build-site.mjs';
import { PACKAGES, packageFor } from './review-workflow.mjs';
import { browserQA } from './browser-qa.mjs';
export function calibrate({sourceRoot,stateRoot,input=path.join(ROOT,'content/site.json'),refresh=false}) {
  const roots=privateState(stateRoot,sourceRoot),policy=loadPublic(input),snapshot=readSources(roots.source,policy.sources);
  if(!unchanged(snapshot.fingerprints,policy.sources))throw new Error('REVIEWED_SOURCE_FINGERPRINT_REQUIRED');
  const exists=fs.existsSync(path.join(roots.state,'state.json'));
  if(exists&&!refresh)throw new Error('EXISTING_CALIBRATION_PRESERVED');
  if(exists)readState(stateRoot,sourceRoot);
  // Calibration must reproduce the reviewed dataset, including provenance, exactly.
  if(!unchanged(derivePublic(policy,snapshot.texts,snapshot.texts),policy))throw new Error('CALIBRATION_EDITORIAL_REVIEW');
  fs.mkdirSync(roots.state,{recursive:true});
  const calibration='calibrations/'+digest({sources:snapshot.fingerprints,policy}),folder=path.join(roots.state,calibration);
  fs.mkdirSync(folder,{recursive:true});
  for(const s of policy.sources){const file=path.join(folder,'baseline',s.path);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,snapshot.texts[s.id]);}
  writeJSON(path.join(folder,'reviewed.json'),policy);
  if(!unchanged(snapshot.fingerprints,readSources(roots.source,policy.sources).fingerprints))throw new Error('CONCURRENT_SOURCE_EDIT');
  // A newly reviewed policy may contain pending facts. Comparison starts from
  // the operator-verified released inventory, never from that proposal itself.
  if(!exists)writeJSON(path.join(roots.state,'published.json'),loadPublic(path.join(ROOT,'content/site.json')));
  writeJSON(path.join(roots.state,'state.json'),{version:1,source_root:roots.source,sources:policy.sources,policy_file:calibration+'/reviewed.json',baseline_dir:calibration+'/baseline'});
  return {state:'PREPARED',operation:'CALIBRATED',sources:snapshot.fingerprints};
}
export async function structuralChecks(visitor,data) {
  const commands=[['HTML_CONTENT_NAVIGATION_HTTP',process.execPath,[path.join(ROOT,'scripts/check-candidate.mjs'),visitor,data]],
    ['PUBLIC_PDF',process.env.SITE_PYTHON||'python',[path.join(ROOT,'scripts/check_public_cv.py'),path.join(visitor,'assets/Hao_Yu_CV.pdf'),data]]];
  const checks=commands.map(([id,exe,args])=>{const r=spawnSync(exe,args,{encoding:'utf8',cwd:ROOT});
    if(r.error||r.status!==0)throw new Error('VALIDATION_'+id);return {id,result:'PASS'};});
  let browser;try{browser=await browserQA({visitor,evidence:path.join(ROOT,'tmp/qa',path.basename(path.dirname(visitor)))});}
  catch(error){if(/^[A-Z_]+$/.test(error.message))throw error;throw new Error('VALIDATION_BROWSER_KEYBOARD_ZOOM_MOTION');}
  checks.push({id:'BROWSER_KEYBOARD_ZOOM_MOTION',result:'PASS',evidence:browser});return checks;
}
export async function prepare({sourceRoot,stateRoot,releaseDate,force=false,checks=structuralChecks,afterSnapshot,afterBuild}) {
  let state,stage;
  try {
    state=readState(stateRoot,sourceRoot);const snapshot=readSources(state.source,state.config.sources),inputs=inputHashes();
    const bindings={policy:sha(fs.readFileSync(state.policyFile)),published:sha(fs.readFileSync(state.publishedFile)),repository_dataset:sha(fs.readFileSync(path.join(ROOT,'content/site.json')))},runtime=runtimeInfo();
    if(afterSnapshot)await afterSnapshot();
    const data=derivePublic(state.policy,snapshot.texts,state.baseline.texts),changes=publicChanges(state.published,data);
    if(!unchanged(snapshot.fingerprints,readSources(state.source,state.config.sources).fingerprints))throw new Error('CONCURRENT_SOURCE_EDIT');
    if(!changes.length&&!force)return {state:'NO_CHANGE',sources:snapshot.fingerprints};
    if(!/^\d{4}-\d{2}-\d{2}$/.test(releaseDate||''))throw new Error('FIXED_RELEASE_DATE_REQUIRED');
    data.release_date=releaseDate;data.sources=snapshot.fingerprints;validatePublic(data);
    stage=path.join(PACKAGES,'.prepare-'+crypto.randomUUID());fs.mkdirSync(stage,{recursive:true});
    const dataset=path.join(stage,'data.json');writeJSON(dataset,data);
    const built=buildSite({out:path.join(stage,'visitor'),input:dataset});
    const results=await checks(path.join(stage,'visitor'),dataset);
    if(!Array.isArray(results)||results.length<2||results.some(c=>c.result!=='PASS'))throw new Error('FAILED_CHECKS');
    if(afterBuild)await afterBuild();
    if(!unchanged(snapshot.fingerprints,readSources(state.source,state.config.sources).fingerprints)||!unchanged(inputs,inputHashes()))throw new Error('CONCURRENT_INPUT_EDIT');
    if(bindings.policy!==sha(fs.readFileSync(state.policyFile))||bindings.published!==sha(fs.readFileSync(state.publishedFile))||bindings.repository_dataset!==sha(fs.readFileSync(path.join(ROOT,'content/site.json')))||!unchanged(runtime,runtimeInfo())||!unchanged(state.config,readState(stateRoot,sourceRoot).config))throw new Error('CONCURRENT_DATASET_EDIT');
    const affected=VISITOR_FILES.filter(f=>!fs.existsSync(path.join(ROOT,f))||sha(fs.readFileSync(path.join(ROOT,f)))!==built.hashes[f]);
    const review={state:'READY_FOR_REVIEW',changes,affected_files:affected,
      affected_sections:changes.length?['profile','research','projects','publications','education','metadata','public CV']:['update labels','generated public CV','sitemap'],
      holds:state.policy.outputs.filter(o=>!data.outputs.some(n=>n.id===o.id)).map(o=>({id:o.id,reason:'Removed from the public selection; reconcile privately.'})),checks:results,publication:'Requires explicit approval of this exact candidate and current authority; preparation never publishes.'};
    writeJSON(path.join(stage,'review.json'),review);
    const manifest={version:1,sources:snapshot.fingerprints,dataset:sha(fs.readFileSync(dataset)),inputs,runtime,
      release_date:releaseDate,target:data.presentation.url,outputs:built.hashes,review:sha(fs.readFileSync(path.join(stage,'review.json'))),
      ...bindings};
    writeJSON(path.join(stage,'manifest.json'),manifest);const id=digest(manifest),dest=path.join(PACKAGES,id);
    if(fs.existsSync(dest)){packageFor(id);removeOwnedDirectory(PACKAGES,stage);}else fs.renameSync(stage,dest);
    const captures=path.join(ROOT,'tmp/qa',path.basename(stage)),namedCaptures=path.join(ROOT,'tmp/qa',id);
    if(fs.existsSync(captures)&&!fs.existsSync(namedCaptures))fs.renameSync(captures,namedCaptures);
    stage=null;return {state:'READY_FOR_REVIEW',candidate:id,target:manifest.target,changes:changes.length,checks:results};
  } catch(error) {
    if(stage&&fs.existsSync(stage))removeOwnedDirectory(PACKAGES,stage);
    const code=/^[A-Z_]+$/.test(error.message)?error.message:/^[A-Z_]+$/.test(error.code||'')?'FILESYSTEM_'+error.code:'SOURCE_OR_BUILD_FAILURE';
    if(state)return issue(state.state,code,{locator:error.locator||{sources:['EB','PUB','CONTRIB','PROFILE','EXPORT'],action:'Check declared-source availability/format, evidence/clearance and the reported validation stage.'},
      diagnostic:error.message,stack:error.stack});
    return {state:'FAILED',code};
  }
}
