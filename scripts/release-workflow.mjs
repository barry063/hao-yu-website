/** Manual publication primitives. No Git commit/push, watcher or fresh rebuild. */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT, VISITOR_FILES } from './public-content.mjs';
import { sha, digest, json, writeJSON, privateState } from './workflow-core.mjs';
import { gate, packageFor } from './review-workflow.mjs';
const releaseFiles=[...VISITOR_FILES,'content/site.json'];
function capture(root){return Object.fromEntries(releaseFiles.map(f=>[f,sha(fs.readFileSync(path.join(root,f)))]));}
function copySet(from,to){for(const f of releaseFiles){fs.mkdirSync(path.dirname(path.join(to,f)),{recursive:true});fs.copyFileSync(path.join(from,f),path.join(to,f));}}
export function promote(options) {
  if(options.authorisePublication!==true)throw new Error('CURRENT_PUBLICATION_AUTHORITY_REQUIRED');
  const p=gate(options),destination=options.destination||ROOT;
  const before=capture(destination),rollback=digest({version:1,files:before}),backup=path.join(p.state.state,'rollback',rollback);
  if(!fs.existsSync(backup)){fs.mkdirSync(backup,{recursive:true});copySet(destination,backup);writeJSON(path.join(backup,'manifest.json'),{version:1,files:before});}
  const record={state:'APPROVED',step:'PROMOTED_LOCALLY',candidate:options.id,target:options.target,rollback};
  try {
    // Gate again immediately before the first public write; publish existing bytes only.
    gate(options);
    for(const f of VISITOR_FILES){fs.mkdirSync(path.dirname(path.join(destination,f)),{recursive:true});fs.copyFileSync(path.join(p.dir,'visitor',f),path.join(destination,f));}
    fs.copyFileSync(path.join(p.dir,'data.json'),path.join(destination,'content/site.json'));
    for(const f of VISITOR_FILES)if(sha(fs.readFileSync(path.join(destination,f)))!==p.manifest.outputs[f])throw new Error('PROMOTION_HASH');
    writeJSON(path.join(p.state.state,'release.json'),record);return record;
  } catch {copySet(backup,destination);throw new Error('PROMOTION_FAILED_BASELINE_RESTORED');}
}
export function rollback({sourceRoot,stateRoot,id,authoriseRestoration=false,destination=ROOT,dryRun=true}) {
  if(!/^[a-f0-9]{64}$/.test(id||''))throw new Error('EXACT_ROLLBACK_REQUIRED');
  const roots=privateState(stateRoot,sourceRoot),backup=path.join(roots.state,'rollback',id),manifest=json(path.join(backup,'manifest.json'));
  if(digest(manifest)!==id)throw new Error('ROLLBACK_MANIFEST');
  for(const f of releaseFiles)if(sha(fs.readFileSync(path.join(backup,f)))!==manifest.files[f])throw new Error('ROLLBACK_HASH');
  if(!dryRun){if(!authoriseRestoration)throw new Error('CURRENT_RESTORATION_AUTHORITY_REQUIRED');copySet(backup,destination);}
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
export async function verifyLive({id,sourceRoot,stateRoot,target,commit,browserCheck}) {
  const p=packageFor(id),roots=privateState(stateRoot,sourceRoot);
  if(target!==p.manifest.target)throw new Error('TARGET_MISMATCH');
  const approval=json(path.join(roots.state,'approvals',id+'.json'));
  if(approval.decision!=='APPROVE'||approval.candidate!==id||approval.target!==target)throw new Error('APPROVAL_REQUIRED');
  const deployed=await deployment(commit,target),checks=[];
  const committedData=execFileSync('git',['show',commit+':content/site.json'],{cwd:ROOT});
  if(sha(Buffer.from(committedData.toString('utf8').replaceAll('\r\n','\n')))!==sha(Buffer.from(fs.readFileSync(path.join(p.dir,'data.json'),'utf8').replaceAll('\r\n','\n'))))throw new Error('COMMIT_DATASET_MISMATCH');
  writeJSON(path.join(roots.state,'release.json'),{state:'PUBLISHED_PENDING_VERIFICATION',candidate:id,...deployed});
  for(const f of VISITOR_FILES){
    // The dotfile configures Pages and may not be served. Verify it in the commit instead.
    const committed=execFileSync('git',['show',commit+':'+f],{cwd:ROOT});
    const expected=fs.readFileSync(path.join(p.dir,'visitor',f));
    const binary=/\.(pdf|png|jpg)$/.test(f),norm=b=>binary?b:Buffer.from(b.toString('utf8').replaceAll('\r\n','\n'));
    if(sha(norm(committed))!==sha(norm(expected)))throw new Error('COMMIT_ARTIFACT_MISMATCH');
    if(f!=='.nojekyll'){const response=await fetch(new URL(f+'?candidate='+id,target),{cache:'no-store'});
      if(!response.ok||sha(norm(Buffer.from(await response.arrayBuffer())))!==sha(norm(expected)))throw new Error('LIVE_ARTIFACT_MISMATCH');}
    checks.push({file:f,result:'PASS',method:f==='.nojekyll'?'COMMIT':'COMMIT_AND_LIVE'});
  }
  if(!browserCheck)throw new Error('LIVE_BROWSER_CHECK_REQUIRED');const browser=await browserCheck(target);
  // Recheck after network/browser work so another deployment cannot silently supersede this one.
  await deployment(commit,target);
  const record={state:'LIVE_VERIFIED',candidate:id,...deployed,checks,browser};
  writeJSON(path.join(roots.state,'published.json'),p.data);writeJSON(path.join(roots.state,'release.json'),record);return record;
}
