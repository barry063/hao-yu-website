/** Manual publication primitives. No Git commit/push, watcher or fresh rebuild. */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT, VISITOR_FILES, ALL_VISITOR_FILES, visitorFiles, loadPublic } from './public-content.mjs';
import { sha, digest, json, writeJSON, privateState, inside, resolved } from './workflow-core.mjs';
import { gate, packageFor } from './review-workflow.mjs';
const ownedFiles=new Set([...ALL_VISITOR_FILES,'content/site.json']);
function releasePath(root,file) {
  // Resolve the explicitly selected directory once (Windows temp roots may be
  // junctions), then reject any nested junction/symlink that changes a file path.
  const base=resolved(path.resolve(root)),target=path.join(base,file);
  if(!ownedFiles.has(file)||!inside(base,target)||base===target||resolved(target)!==target)
    throw new Error('RELEASE_LOCATION');
  if(fs.existsSync(target)&&!fs.lstatSync(target).isFile())throw new Error('RELEASE_LOCATION');
  return target;
}
/** Null records intentional absence, needed for the first release of a new locale. */
export function captureRelease(root,files) {
  return Object.fromEntries(files.map(file=>{
    const target=releasePath(root,file);return [file,fs.existsSync(target)?sha(fs.readFileSync(target)):null];
  }));
}
function checkSnapshot(manifest) {
  if(![1,2].includes(manifest.version)||!manifest.files||Array.isArray(manifest.files))throw new Error('ROLLBACK_MANIFEST');
  const files=Object.keys(manifest.files);
  if(!files.includes('content/site.json')||VISITOR_FILES.some(f=>!files.includes(f))||files.some(f=>!ownedFiles.has(f)))throw new Error('ROLLBACK_MANIFEST');
  for(const hash of Object.values(manifest.files))if(!(manifest.version===2&&hash===null)&&!/^[a-f0-9]{64}$/.test(hash||''))throw new Error('ROLLBACK_MANIFEST');
}
function copyPresent(from,to,files) {
  for(const [file,hash] of Object.entries(files))if(hash!==null){
    const source=releasePath(from,file),target=releasePath(to,file);
    if(sha(fs.readFileSync(source))!==hash)throw new Error('ROLLBACK_HASH');
    fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(source,target);
  }
}
/** Restore only the exact owned snapshot; never recurse or remove directories. */
export function restoreRelease(from,to,manifest,{dryRun=false}={}) {
  checkSnapshot(manifest);
  // Validate the complete backup and all destinations before the first write.
  for(const [file,hash] of Object.entries(manifest.files)){
    const source=releasePath(from,file);releasePath(to,file);
    if(hash===null){if(fs.existsSync(source))throw new Error('ROLLBACK_HASH');}
    else if(!fs.existsSync(source)||sha(fs.readFileSync(source))!==hash)throw new Error('ROLLBACK_HASH');
  }
  if(dryRun)return;
  copyPresent(from,to,manifest.files);
  for(const [file,hash] of Object.entries(manifest.files))if(hash===null){
    const target=releasePath(to,file);if(fs.existsSync(target))fs.unlinkSync(target);
  }
  if(digest(captureRelease(to,Object.keys(manifest.files)))!==digest(manifest.files))throw new Error('RESTORATION_HASH');
}
export function promote(options) {
  if(options.authorisePublication!==true)throw new Error('CURRENT_PUBLICATION_AUTHORITY_REQUIRED');
  const p=gate(options),destination=options.destination||ROOT;
  const current=loadPublic(path.join(destination,'content/site.json')),files=[...new Set([...visitorFiles(current),...visitorFiles(p.data),'content/site.json'])];
  const before=captureRelease(destination,files),manifest={version:2,files:before},rollback=digest(manifest),backup=path.join(p.state.state,'rollback',rollback);
  if(!fs.existsSync(backup)){fs.mkdirSync(backup,{recursive:true});copyPresent(destination,backup,before);writeJSON(path.join(backup,'manifest.json'),manifest);}
  restoreRelease(backup,destination,manifest,{dryRun:true});
  const record={state:'APPROVED',step:'PROMOTED_LOCALLY',candidate:options.id,target:options.target,rollback};
  try {
    // Gate again immediately before the first public write; publish existing bytes only.
    gate(options);
    for(const f of visitorFiles(p.data)){const target=releasePath(destination,f);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(p.dir,'visitor',f),target);}
    for(const f of visitorFiles(current))if(!visitorFiles(p.data).includes(f)){const target=releasePath(destination,f);if(fs.existsSync(target))fs.unlinkSync(target);}
    fs.copyFileSync(path.join(p.dir,'data.json'),releasePath(destination,'content/site.json'));
    for(const f of visitorFiles(p.data))if(sha(fs.readFileSync(releasePath(destination,f)))!==p.manifest.outputs[f])throw new Error('PROMOTION_HASH');
    writeJSON(path.join(p.state.state,'release.json'),record);return record;
  } catch {restoreRelease(backup,destination,manifest);throw new Error('PROMOTION_FAILED_BASELINE_RESTORED');}
}
export function rollback({sourceRoot,stateRoot,id,authoriseRestoration=false,destination=ROOT,dryRun=true}) {
  if(!/^[a-f0-9]{64}$/.test(id||''))throw new Error('EXACT_ROLLBACK_REQUIRED');
  const roots=privateState(stateRoot,sourceRoot),backup=path.join(roots.state,'rollback',id),manifest=json(path.join(backup,'manifest.json'));
  if(digest(manifest)!==id)throw new Error('ROLLBACK_MANIFEST');
  if(!dryRun&&!authoriseRestoration)throw new Error('CURRENT_RESTORATION_AUTHORITY_REQUIRED');
  restoreRelease(backup,destination,manifest,{dryRun});
  return {state:'PREPARED',operation:dryRun?'ROLLBACK_CHECKED':'RESTORED_LOCALLY',rollback:id,remote_publication:'NOT_PERFORMED'};
}
async function deployment(commit,target) {
  if(!/^[a-f0-9]{40}$/.test(commit||''))throw new Error('EXACT_COMMIT_REQUIRED');
  const text=execFileSync('git',['credential','fill'],{input:'protocol=https\nhost=github.com\n\n',encoding:'utf8',env:{...process.env,GIT_TERMINAL_PROMPT:'0'},stdio:['pipe','pipe','pipe']});
  const secret=text.split(/\r?\n/).find(l=>l.startsWith('password='))?.slice(9);if(!secret)throw new Error('GITHUB_CREDENTIAL_UNAVAILABLE');
  const headers={Accept:'application/vnd.github+json','User-Agent':'HaoYuReleaseVerification',Authorization:`Bearer ${secret}`};
  const get=async endpoint=>{const r=await fetch('https://api.github.com/repos/barry063/hao-yu-website/'+endpoint,{headers});if(!r.ok)throw new Error('GITHUB_DEPLOYMENT_CHECK');return r.json();};
  const settings=await get('pages');if(settings.html_url!==target||settings.source?.branch!=='main'||settings.source?.path!=='/')throw new Error('HOSTING_ROUTE_CHANGED');
  const main=await get('commits/main');if(main.sha!==commit)throw new Error('DEPLOYED_MAIN_MISMATCH');
  const runs=await get('actions/runs?head_sha='+commit+'&per_page=100');
  const run=runs.workflow_runs.find(r=>r.name==='pages build and deployment'&&r.head_sha===commit&&r.conclusion==='success'&&r.status==='completed');
  if(!run)throw new Error('SUCCESSFUL_PAGES_DEPLOYMENT_REQUIRED');return {commit,run_id:run.id,run_url:run.html_url,target};
}
/** Read exact committed bytes, including PDFs larger than Node's 1 MiB default. */
export function readCommittedFile(commit,file,{cwd=ROOT}={}) {
  if(!/^[a-f0-9]{40}$/.test(commit||''))throw new Error('EXACT_COMMIT_REQUIRED');
  if(!ownedFiles.has(file))throw new Error('COMMIT_ARTIFACT_PATH');
  const object=commit+':'+file;
  const size=Number(execFileSync('git',['cat-file','-s',object],{cwd,encoding:'utf8'}).trim());
  if(!Number.isSafeInteger(size)||size<0)throw new Error('COMMIT_ARTIFACT_SIZE');
  const bytes=execFileSync('git',['cat-file','blob',object],{cwd,maxBuffer:Math.max(1024*1024,size+65536)});
  if(bytes.length!==size)throw new Error('COMMIT_ARTIFACT_SIZE');
  return bytes;
}
export async function verifyLive({id,sourceRoot,stateRoot,target,commit,browserCheck}) {
  const p=packageFor(id),roots=privateState(stateRoot,sourceRoot);
  if(target!==p.manifest.target)throw new Error('TARGET_MISMATCH');
  const approval=json(path.join(roots.state,'approvals',id+'.json'));
  if(approval.decision!=='APPROVE'||approval.candidate!==id||approval.target!==target)throw new Error('APPROVAL_REQUIRED');
  const deployed=await deployment(commit,target),checks=[];
  const committedData=readCommittedFile(commit,'content/site.json');
  if(sha(Buffer.from(committedData.toString('utf8').replaceAll('\r\n','\n')))!==sha(Buffer.from(fs.readFileSync(path.join(p.dir,'data.json'),'utf8').replaceAll('\r\n','\n'))))throw new Error('COMMIT_DATASET_MISMATCH');
  writeJSON(path.join(roots.state,'release.json'),{state:'PUBLISHED_PENDING_VERIFICATION',candidate:id,...deployed});
  for(const f of visitorFiles(p.data)){
    // The dotfile configures Pages and may not be served. Verify it in the commit instead.
    const committed=readCommittedFile(commit,f);
    const expected=fs.readFileSync(path.join(p.dir,'visitor',f));
    const binary=/\.(pdf|png|jpg)$/.test(f),norm=b=>binary?b:Buffer.from(b.toString('utf8').replaceAll('\r\n','\n'));
    if(sha(norm(committed))!==sha(norm(expected)))throw new Error('COMMIT_ARTIFACT_MISMATCH');
    if(f!=='.nojekyll'){const response=await fetch(new URL(f+'?candidate='+id,target),{cache:'no-store'});
      if(!response.ok||sha(norm(Buffer.from(await response.arrayBuffer())))!==sha(norm(expected)))throw new Error('LIVE_ARTIFACT_MISMATCH');}
    checks.push({file:f,result:'PASS',method:f==='.nojekyll'?'COMMIT':'COMMIT_AND_LIVE'});
  }
  if(!browserCheck)throw new Error('LIVE_BROWSER_CHECK_REQUIRED');const browser=await browserCheck(target,p.data);
  // Recheck after network/browser work so another deployment cannot silently supersede this one.
  await deployment(commit,target);
  const record={state:'LIVE_VERIFIED',candidate:id,...deployed,checks,browser};
  writeJSON(path.join(roots.state,'published.json'),p.data);writeJSON(path.join(roots.state,'release.json'),record);return record;
}
